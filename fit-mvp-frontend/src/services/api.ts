import type { RegisterRequest, LoginRequest, CreateGoalRequest, GoalResponse, WorkoutResponse, LocationType, AuthResponse, UserStatsResponse, UserResponse, UpdateUserRequest, UpdateFitnessLevelRequest } from '@fitness/api-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterData) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User profile endpoints
  async getCurrentUser() {
    return this.request<UserResponse>('/users/me');
  }

  async updateUser(data: UpdateUserRequest) {
    return this.request<UserResponse>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateFitnessLevel(data: UpdateFitnessLevelRequest) {
    return this.request<UserResponse>('/users/me/fitness-level', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Goals endpoints
  async createGoal(data: GoalData) {
    return this.request<GoalResponse>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGoals() {
    return this.request<GoalResponse[]>('/goals');
  }

  async updateGoal(id: string, data: Partial<GoalData>) {
    return this.request<GoalResponse>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: string) {
    return this.request<GoalResponse>(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  // Workout generation endpoints
  async generateWorkout(locationType?: LocationType) {
    const body = locationType ? { locationType } : undefined;
    return this.request<WorkoutResponse>('/workouts/generate', {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async getNextWorkout() {
    return this.request<WorkoutResponse>('/workouts/next');
  }

  // Workout endpoints (to be implemented in backend)
  async completeWorkout(workoutId: string) {
    return this.request<WorkoutResponse>(`/workouts/${workoutId}/complete`, {
      method: 'PATCH',
    });
  }

  async getWorkoutHistory() {
    return this.request<WorkoutResponse[]>('/workouts');
  }

  async getUserStats() {
    return this.request<UserStatsResponse>('/workouts/stats');
  }
}

export const api = new ApiService();