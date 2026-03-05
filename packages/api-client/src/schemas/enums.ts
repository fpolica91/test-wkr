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

export const WeightUnitSchema = z.enum(['KG', 'LB']);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;

export const FocusAreaSchema = z.enum([
  'FULL_BODY',
  'CORE',
  'STAMINA',
  'UPPER_BODY',
  'LEGS',
  'FLEXIBILITY', 
  'BASE_ON_GOALS_AND_LATEST_WORKOUTS',
]);
export type FocusArea = z.infer<typeof FocusAreaSchema>;

export const VoteTypeSchema = z.enum(['UPVOTE', 'DOWNVOTE']);
export type VoteType = z.infer<typeof VoteTypeSchema>;