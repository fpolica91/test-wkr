// Enums matching backend Prisma schema
export enum FitnessLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum GoalType {
  BUILD_MUSCLE = 'BUILD_MUSCLE',
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  BE_MORE_ATHLETIC = 'BE_MORE_ATHLETIC',
  FLEXIBILITY = 'FLEXIBILITY',
  GENERAL_FITNESS = 'GENERAL_FITNESS',
}

export enum LocationType {
  HOME = 'HOME',
  GYM = 'GYM',
  BOTH = 'BOTH',
}

// User interface
export interface User {
  id: string;
  username: string;
  email?: string;
  fitnessLevel: FitnessLevel;
  createdAt: string;
  updatedAt: string;
}

// Goal interface
export interface Goal {
  id: string;
  userId: string;
  goalType: GoalType;
  targetValue?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Exercise interface
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  locationType: LocationType;
  createdAt: string;
  updatedAt: string;
}

// Workout interface
export interface Workout {
  id: string;
  userId: string;
  name: string;
  duration?: number;
  caloriesBurned?: number;
  workoutDate: string;
  notes?: string;
  completed: boolean;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

// Auth response
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    fitnessLevel: FitnessLevel;
  };
}