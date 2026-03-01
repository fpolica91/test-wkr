import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import type { UserResponse, FitnessLevel } from '@fitness/api-client';


interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, fitnessLevel: FitnessLevel, email?: string) => Promise<void>;
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
    // Check for existing token on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken) {
      setToken(storedToken);
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as UserResponse;
          // Validate user data isn't old mock data
          if (userData.id === 'mock-id' || userData.username === 'User' || !userData.fitnessLevel) {
            console.warn('Discarding stale mock user data');
            localStorage.removeItem('auth_user');
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error('Failed to parse stored user data:', error);
          localStorage.removeItem('auth_user');
        }
      }
    }
    setIsLoading(false);
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

  const register = async (username: string, password: string, fitnessLevel: FitnessLevel, email?: string) => {
    try {
      setIsLoading(true);
      const response = await api.register({ username, password, fitnessLevel, email });
      api.setToken(response.access_token);
      setToken(response.access_token);
      
      const userData: UserResponse = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        fitnessLevel: response.user.fitnessLevel,
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