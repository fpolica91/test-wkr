import { z } from 'zod';

// User stats response
export const UserStatsResponseSchema = z.object({
  streakDays: z.number().int().min(0),
  totalWorkouts: z.number().int().min(0),
  totalMinutes: z.number().int().min(0),
  totalCalories: z.number().min(0),
});
export type UserStatsResponse = z.infer<typeof UserStatsResponseSchema>;