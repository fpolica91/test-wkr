import { z } from 'zod';
import { LocationTypeSchema } from './enums';

// Base Exercise schema
const ExerciseBaseSchema = z.object({
  id: z.string(),
  workoutId: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().optional(),
  restTime: z.number().int().optional(),
  locationType: LocationTypeSchema,
  completed: z.boolean(),
  completedAt: z.string().datetime().optional(),
  votedDown: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Exercise response
export const ExerciseResponseSchema = ExerciseBaseSchema;
export type ExerciseResponse = z.infer<typeof ExerciseResponseSchema>;

// Create exercise request (for AI-generated workouts)
export const CreateExerciseRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.string().optional(),
  restTime: z.number().int().optional(),
  locationType: LocationTypeSchema,
});
export type CreateExerciseRequest = z.infer<typeof CreateExerciseRequestSchema>;

// Toggle exercise completion request/response
export const ToggleExerciseCompletionRequestSchema = z.object({
  completed: z.boolean(),
});
export type ToggleExerciseCompletionRequest = z.infer<typeof ToggleExerciseCompletionRequestSchema>;

export const ToggleExerciseCompletionResponseSchema = ExerciseResponseSchema;
export type ToggleExerciseCompletionResponse = z.infer<typeof ToggleExerciseCompletionResponseSchema>;