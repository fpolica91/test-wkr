import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosError } from 'axios';
import type { LocationType } from '@fitness/api-client';

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
    );

    const aiResponse = await this.callDeepSeekAPI(prompt);
    return this.parseAIResponse(aiResponse);
  }

  private buildWorkoutPrompt(
    fitnessLevel: string,
    goals: Array<{ goalType: string; targetValue?: number }>,
    locationType?: LocationType,
    recentExercises: string[] = [],
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

    return `You are a fitness coach. Generate a workout plan for a ${fitnessLevel} level user with goals: ${goalDescriptions}.${location}${recentExercisesText}
    
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
      return this.mockAIResponse();
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
      // Fallback to mock response
      return this.mockAIResponse();
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
      const normalizedExercises = workout.exercises.map((ex) => ({
        name: String(ex.name),
        description: ex.description ? String(ex.description) : undefined,
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        weight:
          ex.weight === null || ex.weight === undefined
            ? null
            : String(ex.weight),
        restTime: ex.restTime ? Number(ex.restTime) : undefined,
        locationType: String(ex.locationType).toUpperCase() as LocationType,
      }));

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
}
