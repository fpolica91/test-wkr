import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AIWorkoutService } from './ai-workout.service';
import type { UpdateWorkoutRequest, LocationType } from '@fitness/api-client';

@Injectable()
export class WorkoutsService {
  constructor(
    private prisma: PrismaService,
    private aiWorkoutService: AIWorkoutService,
  ) {}

  async generateWorkout(userId: string, locationType?: LocationType) {
    const workoutData = await this.aiWorkoutService.generateWorkout(
      userId,
      locationType,
    );

    const workout = await this.prisma.workout.create({
      data: {
        userId,
        name: workoutData.name,
        duration: workoutData.duration,
        caloriesBurned: workoutData.caloriesBurned,
        workoutDate: new Date(),
        completed: false,
        exercises: {
          create: workoutData.exercises.map((ex) => ({
            name: ex.name,
            description: ex.description,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            restTime: ex.restTime,
            locationType: ex.locationType,
          })),
        },
      },
      include: { exercises: true },
    });

    return workout;
  }

  async getNextWorkout(userId: string) {
    // Find the latest incomplete workout
    const latestWorkout = await this.prisma.workout.findFirst({
      where: {
        userId,
        completed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        exercises: true,
      },
    });

    if (latestWorkout) {
      return latestWorkout;
    }

    // If no incomplete workout, generate a new one
    return this.generateWorkout(userId);
  }

  async findAll(userId: string, completed?: boolean) {
    const where: Prisma.WorkoutWhereInput = { userId };
    if (completed !== undefined) {
      where.completed = completed;
    }

    return this.prisma.workout.findMany({
      where,
      orderBy: { workoutDate: 'desc' },
      include: {
        exercises: true,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
      include: {
        exercises: true,
      },
    });
    if (!workout) {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }
    return workout;
  }

  async update(
    userId: string,
    id: string,
    updateWorkoutDto: UpdateWorkoutRequest,
  ) {
    await this.findOne(userId, id);
    return this.prisma.workout.update({
      where: { id },
      data: updateWorkoutDto,
      include: {
        exercises: true,
      },
    });
  }

  async completeWorkout(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.workout.update({
      where: { id },
      data: { completed: true },
      include: {
        exercises: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.workout.delete({
      where: { id },
    });
  }

  async getUserStats(userId: string) {
    // Get all completed workouts for the user
    const completedWorkouts = await this.prisma.workout.findMany({
      where: {
        userId,
        completed: true,
      },
      select: {
        workoutDate: true,
        duration: true,
        caloriesBurned: true,
      },
      orderBy: {
        workoutDate: 'desc',
      },
    });

    // Calculate totals
    const totalWorkouts = completedWorkouts.length;
    const totalMinutes = completedWorkouts.reduce(
      (sum, w) => sum + (w.duration || 0),
      0,
    );
    const totalCalories = completedWorkouts.reduce(
      (sum, w) => sum + (w.caloriesBurned || 0),
      0,
    );

    // Calculate streak
    let streakDays = 0;
    if (completedWorkouts.length > 0) {
      // Get unique dates (YYYY-MM-DD) in UTC
      const uniqueDates = new Set<string>();
      completedWorkouts.forEach((w) => {
        const dateStr = w.workoutDate.toISOString().split('T')[0];
        uniqueDates.add(dateStr);
      });

      // Sort dates descending (most recent first)
      const sortedDates = Array.from(uniqueDates).sort().reverse();

      // Calculate consecutive days from today backwards
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // If the most recent workout date is today, start streak from today
      // Otherwise start from yesterday
      const currentDate = new Date(today);
      let currentDateStr = todayStr;

      // Check if today is in the set
      if (!uniqueDates.has(todayStr)) {
        // Streak broken if no workout today
        streakDays = 0;
      } else {
        // Count consecutive days from today backwards
        let consecutive = 0;
        while (uniqueDates.has(currentDateStr)) {
          consecutive++;
          // Move to previous day
          currentDate.setDate(currentDate.getDate() - 1);
          currentDateStr = currentDate.toISOString().split('T')[0];
        }
        streakDays = consecutive;
      }
    }

    return {
      streakDays,
      totalWorkouts,
      totalMinutes,
      totalCalories,
    };
  }
}
