import { z } from 'zod';
import { FitnessLevelSchema, WeightUnitSchema } from './enums';

// Base User schema (for internal use)
const UserBaseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email().optional(),
  fitnessLevel: FitnessLevelSchema,
  userWeightUnit: WeightUnitSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// User response (what we return from API)
export const UserResponseSchema = UserBaseSchema;
export type UserResponse = z.infer<typeof UserResponseSchema>;

// Register request
export const RegisterRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  email: z.string().email().optional(),
  fitnessLevel: FitnessLevelSchema,
  initialWeight: z.number().min(0).max(1000).optional(),
  initialBodyFat: z.number().min(0).max(100).optional(),
  userWeightUnit: WeightUnitSchema.optional(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Login request
export const LoginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Auth response
export const AuthResponseSchema = z.object({
  access_token: z.string(),
  user: UserResponseSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Update user request
export const UpdateUserRequestSchema = z.object({
  email: z.string().email().optional(),
  fitnessLevel: FitnessLevelSchema.optional(),
  userWeightUnit: WeightUnitSchema.optional(),
});
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

// Update fitness level request (simplified)
export const UpdateFitnessLevelRequestSchema = z.object({
  fitnessLevel: FitnessLevelSchema,
});
export type UpdateFitnessLevelRequest = z.infer<typeof UpdateFitnessLevelRequestSchema>;