import type { RegisterRequest, LoginRequest, CreateGoalRequest, GoalResponse, WorkoutResponse, LocationType, FocusArea, AuthResponse, UserStatsResponse, UserResponse, UpdateUserRequest, UpdateFitnessLevelRequest, ExerciseResponse, CreateWeightEntryRequest, UpdateWeightEntryRequest, WeightEntryResponse, WeightEntryListResponse, WeightStatsResponse, UpdateWeightUnitRequest, WeightUnit } from '@fitness/api-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Event emitter for auth errors
type AuthErrorHandler = () => void;
const authErrorHandlers: AuthErrorHandler[] = [];

export const onAuthError = (handler: AuthErrorHandler) => {
  authErrorHandlers.push(handler);
  return () => {
    const index = authErrorHandlers.indexOf(handler);
    if (index > -1) authErrorHandlers.splice(index, 1);
  };
};

const emitAuthError = () => {
  authErrorHandlers.forEach(handler => handler());
};

type RegisterData = RegisterRequest;

type LoginData = LoginRequest;

type GoalData = CreateGoalRequest;



class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 401 Unauthorized - emit auth error to redirect to login
      if (response.status === 401) {
        emitAuthError();
      }
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterData) {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData) {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User profile endpoints
  async getCurrentUser() {
    return this.request<UserResponse>('/api/users/me');
  }

  async updateUser(data: UpdateUserRequest) {
    return this.request<UserResponse>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateFitnessLevel(data: UpdateFitnessLevelRequest) {
    return this.request<UserResponse>('/api/users/me/fitness-level', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Goals endpoints
  async createGoal(data: GoalData) {
    return this.request<GoalResponse>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGoals() {
    return this.request<GoalResponse[]>('/api/goals');
  }

  async updateGoal(id: string, data: Partial<GoalData>) {
    return this.request<GoalResponse>(`/api/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string) {
    return this.request<GoalResponse>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Workout generation endpoints
  async generateWorkout(locationType?: LocationType, focusArea?: FocusArea) {
    const body: { locationType?: LocationType; focusArea?: FocusArea } = {};
    if (locationType) body.locationType = locationType;
    if (focusArea) body.focusArea = focusArea;
    return this.request<WorkoutResponse>('/api/workouts/generate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getNextWorkout() {
    return this.request<WorkoutResponse>('/api/workouts/next');
  }

  // Workout endpoints (to be implemented in backend)
  async completeWorkout(workoutId: string) {
    return this.request<WorkoutResponse>(`/api/workouts/${workoutId}/complete`, {
      method: 'PATCH',
    });
  }

  async getWorkoutHistory() {
    return this.request<WorkoutResponse[]>('/api/workouts');
  }

  async getUserStats() {
    return this.request<UserStatsResponse>('/api/workouts/stats');
  }

  async toggleExerciseCompletion(workoutId: string, exerciseId: string, completed: boolean) {
    return this.request<ExerciseResponse>(`/api/workouts/${workoutId}/exercises/${exerciseId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  // Weight tracking endpoints
  async getWeightEntries() {
    return this.request<WeightEntryListResponse>('/api/weight');
  }

  async createWeightEntry(data: CreateWeightEntryRequest) {
    return this.request<WeightEntryResponse>('/api/weight', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWeightEntry(id: string, data: UpdateWeightEntryRequest) {
    return this.request<WeightEntryResponse>(`/api/weight/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteWeightEntry(id: string) {
    return this.request<WeightEntryResponse>(`/api/weight/${id}`, {
      method: 'DELETE',
    });
  }

  async getWeightStats() {
    return this.request<WeightStatsResponse>('/api/weight/stats');
  }

  async updateWeightUnit(data: UpdateWeightUnitRequest) {
    return this.request<UserResponse>('/api/weight/preferences/unit', {
      method: 'PATCH',
      body: JSON.stringify(data),
  async swapExercise(workoutId: string, exerciseId: string, locationType?: LocationType, focusArea?: FocusArea) {
    const params = new URLSearchParams();
    if (locationType) params.set('locationType', locationType);
    if (focusArea) params.set('focusArea', focusArea);
    const queryString = params.toString();
    return this.request<WorkoutResponse>(
      `/api/workouts/${workoutId}/exercises/${exerciseId}/swap${queryString ? `?${queryString}` : ''}`,
      { method: 'PATCH' }
    );
  }

  async regenerateWorkout(workoutId: string, feedback: string, locationType?: LocationType, focusArea?: FocusArea) {
    return this.request<WorkoutResponse>(`/api/workouts/${workoutId}/regenerate`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback, locationType, focusArea }),
    });
  }

  async voteWorkout(workoutId: string, vote: 'UPVOTE' | 'DOWNVOTE') {
    return this.request<WorkoutResponse>(`/api/workouts/${workoutId}/vote`, {
      method: 'PATCH',
      body: JSON.stringify({ vote }),
    });
  }
}

export const api = new ApiService();