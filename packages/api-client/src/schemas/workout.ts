import { z } from 'zod';
import { ExerciseResponseSchema } from './exercise';
import { FocusAreaSchema, VoteTypeSchema } from './enums';

// Base Workout schema
const WorkoutBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  duration: z.number().int().optional(),
  caloriesBurned: z.number().optional(),
  workoutDate: z.string().datetime(),
  notes: z.string().optional(),
  completed: z.boolean(),
  vote: VoteTypeSchema.optional(),
  feedback: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Workout response with exercises
export const WorkoutResponseSchema = WorkoutBaseSchema.extend({
  exercises: z.array(ExerciseResponseSchema),
});
export type WorkoutResponse = z.infer<typeof WorkoutResponseSchema>;

// Workout list response (array of workouts)
export const WorkoutListResponseSchema = z.array(WorkoutResponseSchema);
export type WorkoutListResponse = z.infer<typeof WorkoutListResponseSchema>;

// Generate workout request
export const GenerateWorkoutRequestSchema = z.object({
  locationType: z.enum(['HOME', 'GYM', 'BOTH']).optional(),
  focusArea: FocusAreaSchema.optional(),
});
export type GenerateWorkoutRequest = z.infer<typeof GenerateWorkoutRequestSchema>;

// Update workout request
export const UpdateWorkoutRequestSchema = z.object({
  name: z.string().optional(),
  duration: z.number().int().optional(),
  caloriesBurned: z.number().optional(),
  workoutDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
});
export type UpdateWorkoutRequest = z.infer<typeof UpdateWorkoutRequestSchema>;

// Pagination query params
export const WorkoutQueryParamsSchema = z.object({
  completed: z.enum(['true', 'false']).optional(),
});
export type WorkoutQueryParams = z.infer<typeof WorkoutQueryParamsSchema>;