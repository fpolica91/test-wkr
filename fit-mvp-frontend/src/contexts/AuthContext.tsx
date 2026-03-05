import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, onAuthError } from '../services/api';
import type { UserResponse, RegisterRequest } from '@fitness/api-client';


interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserResponse>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount and validate it
    const validateToken = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        api.setToken(storedToken);
        try {
          // Validate token by fetching current user
          const userData = await api.getCurrentUser();
          setToken(storedToken);
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (error) {
          // Token is invalid, clear it
          console.warn('Stored token is invalid, clearing...');
          api.clearToken();
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setIsLoading(false);
    };

    validateToken();

    // Listen for 401 auth errors from API
    const unsubscribe = onAuthError(() => {
      console.warn('Authentication error detected, logging out...');
      logout();
    });

    return unsubscribe;
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ username, password });
      api.setToken(response.access_token);
      setToken(response.access_token);
      
      const userData: UserResponse = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        fitnessLevel: response.user.fitnessLevel,
        userWeightUnit: response.user.userWeightUnit,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await api.register(data);
      api.setToken(response.access_token);
      setToken(response.access_token);
      
      const userData: UserResponse = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        fitnessLevel: response.user.fitnessLevel,
        userWeightUnit: response.user.userWeightUnit,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const updateUser = (userData: Partial<UserResponse>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};