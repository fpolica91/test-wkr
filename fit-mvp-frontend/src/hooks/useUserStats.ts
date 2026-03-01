import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { UserStatsResponse } from '@fitness/api-client';

export const useUserStats = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      try {
        return await api.getUserStats();
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Return default stats
        return {
          streakDays: 0,
          totalWorkouts: 0,
          totalMinutes: 0,
          totalCalories: 0,
        } as UserStatsResponse;
      }
    },
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};