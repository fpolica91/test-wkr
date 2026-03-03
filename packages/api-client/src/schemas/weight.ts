import { z } from 'zod';
import { WeightUnitSchema } from './enums';

// Base WeightEntry schema
const WeightEntryBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  weight: z.number().min(0).max(1000), // kg
  bodyFat: z.number().min(0).max(100).optional(),
  date: z.string().datetime(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// WeightEntry response (what we return from API)
export const WeightEntryResponseSchema = WeightEntryBaseSchema;
export type WeightEntryResponse = z.infer<typeof WeightEntryResponseSchema>;

// WeightEntry list response
export const WeightEntryListResponseSchema = z.array(WeightEntryResponseSchema);
export type WeightEntryListResponse = z.infer<typeof WeightEntryListResponseSchema>;

// Create weight entry request
export const CreateWeightEntryRequestSchema = z.object({
  weight: z.number().min(0).max(1000),
  bodyFat: z.number().min(0).max(100).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type CreateWeightEntryRequest = z.infer<typeof CreateWeightEntryRequestSchema>;

// Update weight entry request
export const UpdateWeightEntryRequestSchema = CreateWeightEntryRequestSchema.partial();
export type UpdateWeightEntryRequest = z.infer<typeof UpdateWeightEntryRequestSchema>;

// Weight stats response
export const WeightStatsResponseSchema = z.object({
  currentWeight: z.number().optional(),
  previousWeight: z.number().optional(),
  weightChange: z.number().optional(),
  sevenDayAverage: z.number().optional(),
  thirtyDayAverage: z.number().optional(),
  totalEntries: z.number().int().min(0),
  latestEntryDate: z.string().datetime().optional(),
});
export type WeightStatsResponse = z.infer<typeof WeightStatsResponseSchema>;

// Update weight unit preference request
export const UpdateWeightUnitRequestSchema = z.object({
  userWeightUnit: WeightUnitSchema,
});
export type UpdateWeightUnitRequest = z.infer<typeof UpdateWeightUnitRequestSchema>;