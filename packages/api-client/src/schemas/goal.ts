import { z } from 'zod';
import { GoalTypeSchema } from './enums';

// Base Goal schema
const GoalBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalType: GoalTypeSchema,
  description: z.string().optional(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  targetDate: z.string().datetime().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
// const GoalBaseSchema = z.any();

// Goal response (what we return from API)
export const GoalResponseSchema = GoalBaseSchema;
export type GoalResponse = z.infer<typeof GoalResponseSchema>;

// Create goal request
export const CreateGoalRequestSchema = z.object({
  goalType: GoalTypeSchema,
  description: z.string().max(500).optional(),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  targetDate: z.string().datetime().optional(),
});
export type CreateGoalRequest = z.infer<typeof CreateGoalRequestSchema>;

// Update goal request
export const UpdateGoalRequestSchema = CreateGoalRequestSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateGoalRequest = z.infer<typeof UpdateGoalRequestSchema>;