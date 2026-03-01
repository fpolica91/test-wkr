// Export all schemas
export * from './schemas';

// Re-export commonly used types
export type {
  FitnessLevel,
  GoalType,
  LocationType,
  FocusArea,
  UserResponse,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  GoalResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  ExerciseResponse,
  CreateExerciseRequest,
  ToggleExerciseCompletionRequest,
  ToggleExerciseCompletionResponse,
  WorkoutResponse,
  WorkoutListResponse,
  GenerateWorkoutRequest,
  UpdateWorkoutRequest,
  WorkoutQueryParams,
  UserStatsResponse,
  UpdateUserRequest,
  UpdateFitnessLevelRequest,
} from './schemas';