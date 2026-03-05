import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosError } from 'axios';
import type { LocationType, FocusArea } from '@fitness/api-client';

interface Exercise {
  name: string;
  description?: string;
  sets: number;
  reps: number;
  weight?: string | null;
  restTime?: number;
  locationType: LocationType;
}

interface WorkoutGenerationResult {
  name: string;
  duration: number;
  caloriesBurned: number;
  exercises: Exercise[];
}

interface DeepSeekMessage {
  role: string;
  content: string;
}

interface DeepSeekChoice {
  message: DeepSeekMessage;
}

interface DeepSeekResponse {
  choices: DeepSeekChoice[];
}

@Injectable()
export class AIWorkoutService {
  private readonly deepseekApiKey: string;
  private readonly deepseekApiUrl = 'https://api.deepseek.com/chat/completions';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.deepseekApiKey =
      this.configService.get<string>('DEEPSEEK_API_KEY') || '';
  }

  async generateWorkout(
    userId: string,
    locationType?: LocationType,
    focusArea?: FocusArea,
    feedback?: string,
  ): Promise<WorkoutGenerationResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        goals: { where: { isActive: true } },
        workouts: {
          where: {
            workoutDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          include: {
            exercises: true,
          },
          orderBy: {
            workoutDate: 'desc',
          },
          take: 5,
        },
      },
    });
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    // Map goals to match expected interface
    const mappedGoals = user.goals.map((goal) => ({
      goalType: goal.goalType,
      targetValue: goal.targetValue ?? undefined,
    }));

    const recentExercises = user.workouts.flatMap((w) =>
      w.exercises.map((e) => e.name),
    );

    const prompt = this.buildWorkoutPrompt(
      user.fitnessLevel,
      mappedGoals,
      locationType,
      recentExercises,
      focusArea,
      feedback,
    );

    const aiResponse = await this.callDeepSeekAPI(prompt);
    return this.parseAIResponse(aiResponse);
  }

  private buildWorkoutPrompt(
    fitnessLevel: string,
    goals: Array<{ goalType: string; targetValue?: number }>,
    locationType?: LocationType,
    recentExercises: string[] = [],
    focusArea?: FocusArea,
    feedback?: string,
  ): string {
    const goalDescriptions = goals
      .map(
        (g) =>
          `${g.goalType}${g.targetValue ? ` (target: ${g.targetValue})` : ''}`,
      )
      .join(', ');
    const location = locationType ? ` Location: ${locationType}.` : '';
    const recentExercisesText =
      recentExercises.length > 0
        ? ` Recent exercises (avoid repeating these back-to-back): ${recentExercises.join(', ')}.`
        : '';
    const feedbackText = feedback
      ? ` User feedback for this workout: "${feedback}".`
      : '';

    return `You are a fitness coach. Generate a workout plan for a ${fitnessLevel} level user with goals: ${goalDescriptions}.${location}${recentExercisesText}${feedbackText}
    
The workout should include:
1. A workout name
2. Estimated duration in minutes
3. Estimated calories burned
4. A list of 3-5 exercises with:
   - Exercise name
   - Brief description (optional)
   - Sets (number)
   - Reps (number)
    - Weight guidance (optional descriptive string only, e.g., 'bodyweight', 'light dumbbells', 'moderate weight' - NEVER use specific numbers like 50, 100, etc.)
   - Rest time between sets (optional, in seconds)
   - Location type (HOME, GYM, or BOTH)

Return the response as a JSON object with this exact structure:
{
  "name": "Workout Name",
  "duration": 60,
  "caloriesBurned": 300,
  "exercises": [
    {
      "name": "Exercise 1",
      "description": "Optional description",
      "sets": 3,
      "reps": 10,
      "weight": "bodyweight or light dumbbells",
      "restTime": 60,
      "locationType": "GYM"
    }
  ]
}

Ensure locationType matches one of: HOME, GYM, BOTH.`;
  }

  private async callDeepSeekAPI(prompt: string): Promise<string> {
    if (!this.deepseekApiKey) {
      // Fallback to a mock response for development
      throw new InternalServerErrorException('DeepSeek API key is not set');
    }

    try {
      const response = await axios.post<DeepSeekResponse>(
        this.deepseekApiUrl,
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        'DeepSeek API error:',
        axiosError.response?.data || axiosError.message,
      );

      throw new InternalServerErrorException('Failed to call DeepSeek API');
    }
  }

  private mockAIResponse(): string {
    return JSON.stringify({
      name: 'Full Body Strength',
      duration: 45,
      caloriesBurned: 250,
      exercises: [
        {
          name: 'Push-ups',
          description: 'Standard push-ups for chest and triceps',
          sets: 3,
          reps: 12,
          weight: null,
          restTime: 60,
          locationType: 'HOME',
        },
        {
          name: 'Bodyweight Squats',
          description: 'Squats using body weight',
          sets: 3,
          reps: 15,
          weight: null,
          restTime: 60,
          locationType: 'HOME',
        },
        {
          name: 'Plank',
          description: 'Hold plank position for core strength',
          sets: 3,
          reps: 1,
          weight: null,
          restTime: 45,
          locationType: 'HOME',
        },
      ],
    });
  }

  private parseAIResponse(aiResponse: string): WorkoutGenerationResult {
    try {
      // Extract JSON from response (in case AI adds extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed: unknown = JSON.parse(jsonString);

      // Validate required fields
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('name' in parsed) ||
        !('duration' in parsed) ||
        !('exercises' in parsed)
      ) {
        throw new Error('Invalid AI response structure');
      }

      const workout = parsed as WorkoutGenerationResult;

      // Additional validation
      if (
        typeof workout.name !== 'string' ||
        typeof workout.duration !== 'number' ||
        typeof workout.caloriesBurned !== 'number' ||
        !Array.isArray(workout.exercises)
      ) {
        throw new Error('Invalid AI response structure');
      }

      // Validate and normalize each exercise
      const normalizedExercises = workout.exercises.map((ex) => {
        // Ensure sets and reps are valid positive integers
        const sets = Math.max(1, Math.floor(Number(ex.sets)) || 3);
        const reps = Math.max(1, Math.floor(Number(ex.reps)) || 10);
        
        return {
          name: String(ex.name || 'Exercise'),
          description: ex.description ? String(ex.description) : undefined,
          sets,
          reps,
          weight:
            ex.weight === null || ex.weight === undefined
              ? null
              : String(ex.weight),
          restTime: ex.restTime ? Math.max(0, Math.floor(Number(ex.restTime))) : undefined,
          locationType: String(ex.locationType).toUpperCase() as LocationType,
        };
      });

      return {
        ...workout,
        exercises: normalizedExercises,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Return mock data as fallback
      return JSON.parse(this.mockAIResponse()) as WorkoutGenerationResult;
    }
  }

  async generateSingleExercise(
    userId: string,
    locationType?: LocationType,
    focusArea?: FocusArea,
    excludedExercises: string[] = [],
    rejectedExercise?: string,
  ): Promise<Exercise> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        goals: { where: { isActive: true } },
        workouts: {
          where: {
            workoutDate: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: {
            exercises: true,
          },
          orderBy: {
            workoutDate: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const recentExercises = [
      ...excludedExercises,
      ...user.workouts.flatMap((w) => w.exercises.map((e) => e.name)),
    ];

    const prompt = this.buildSingleExercisePrompt(
      user.fitnessLevel,
      user.goals.map((g) => ({ goalType: g.goalType, targetValue: g.targetValue ?? undefined })),
      locationType,
      recentExercises,
      focusArea,
      rejectedExercise,
    );

    const aiResponse = await this.callDeepSeekAPI(prompt);
    const result = this.parseSingleExerciseResponse(aiResponse);
    return result;
  }

  private buildSingleExercisePrompt(
    fitnessLevel: string,
    goals: Array<{ goalType: string; targetValue?: number }>,
    locationType?: LocationType,
    recentExercises: string[] = [],
    focusArea?: FocusArea,
    rejectedExercise?: string,
  ): string {
    const goalDescriptions = goals
      .map((g) => `${g.goalType}${g.targetValue ? ` (target: ${g.targetValue})` : ''}`)
      .join(', ');

    const location = locationType ? ` Location: ${locationType}.` : '';
    const focus = focusArea && focusArea !== 'BASE_ON_GOALS_AND_LATEST_WORKOUTS' 
      ? ` Focus area: ${focusArea}.` 
      : '';
    const recentExercisesText =
      recentExercises.length > 0
        ? ` Exercises to avoid (already done recently): ${recentExercises.join(', ')}.`
        : '';
    
    const rejectedText = rejectedExercise
      ? ` The user specifically REJECTED this exercise: "${rejectedExercise}". Do NOT recommend this exercise or any similar exercises.`
      : '';

    return `You are a fitness coach. Generate a single replacement exercise for a ${fitnessLevel} level user with goals: ${goalDescriptions}.${location}${focus}${recentExercisesText}${rejectedText}
    
The exercise should be different from recent exercises and MUST NOT be "${rejectedExercise || 'the rejected exercise'}".

Return the response as a JSON object with this exact structure:
{
  "name": "Exercise Name",
  "description": "Brief description of how to perform the exercise",
  "sets": 3,
  "reps": 10,
  "weight": "bodyweight or light dumbbells",
  "restTime": 60,
  "locationType": "GYM"
}

Ensure locationType matches one of: HOME, GYM, BOTH.`;
  }

  private parseSingleExerciseResponse(aiResponse: string): Exercise {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed: unknown = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid AI response structure');
      }

      const exercise = parsed as Exercise;
      const sets = Math.max(1, Math.floor(Number(exercise.sets)) || 3);
      const reps = Math.max(1, Math.floor(Number(exercise.reps)) || 10);

      return {
        name: String(exercise.name || 'Exercise'),
        description: exercise.description ? String(exercise.description) : undefined,
        sets,
        reps,
        weight: exercise.weight === null || exercise.weight === undefined ? null : String(exercise.weight),
        restTime: exercise.restTime ? Math.max(0, Math.floor(Number(exercise.restTime))) : undefined,
        locationType: String(exercise.locationType).toUpperCase() as LocationType,
      };
    } catch (error) {
      console.error('Failed to parse AI response for single exercise:', error);
      return {
        name: 'Alternative Squat',
        description: 'A great lower body exercise',
        sets: 3,
        reps: 12,
        weight: 'bodyweight',
        restTime: 60,
        locationType: 'BOTH',
      };
    }
  }
}
