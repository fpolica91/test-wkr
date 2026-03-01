import { z } from 'zod';

export const FitnessLevelSchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export type FitnessLevel = z.infer<typeof FitnessLevelSchema>;

export const GoalTypeSchema = z.enum([
  'BUILD_MUSCLE',
  'LOSE_WEIGHT', 
  'BE_MORE_ATHLETIC',
  'FLEXIBILITY',
  'GENERAL_FITNESS'
]);
export type GoalType = z.infer<typeof GoalTypeSchema>;

export const LocationTypeSchema = z.enum(['HOME', 'GYM', 'BOTH']);
export type LocationType = z.infer<typeof LocationTypeSchema>;