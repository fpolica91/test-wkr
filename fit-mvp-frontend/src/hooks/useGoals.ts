import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { GoalResponse as Goal, GoalType } from '@fitness/api-client';
import { toast } from 'sonner';

export const useGoals = () => {
  const queryClient = useQueryClient();

  const { 
    data: goals = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      try {
        return await api.getGoals();
      } catch (error) {
        console.error('Failed to fetch goals:', error);
        return [];
      }
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: { goalType: GoalType; targetValue?: number }) => {
      return api.createGoal(data);
    },
    onSuccess: (newGoal) => {
      queryClient.setQueryData(['goals'], (old: Goal[] = []) => [...old, newGoal]);
      toast.success('Goal created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create goal');
      console.error('Create goal error:', error);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Goal> }) => {
      return api.updateGoal(id, data);
    },
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData(['goals'], (old: Goal[] = []) => 
        old.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal)
      );
      toast.success('Goal updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update goal');
      console.error('Update goal error:', error);
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.deleteGoal(id);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['goals'], (old: Goal[] = []) => 
        old.filter(goal => goal.id !== id)
      );
      toast.success('Goal deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete goal');
      console.error('Delete goal error:', error);
    },
  });

  const activeGoals = goals.filter(goal => goal.isActive);
  const inactiveGoals = goals.filter(goal => !goal.isActive);

  return {
    goals,
    activeGoals,
    inactiveGoals,
    isLoading,
    error,
    createGoal: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutateAsync,
    isUpdating: updateGoalMutation.isPending,
    deleteGoal: deleteGoalMutation.mutateAsync,
    isDeleting: deleteGoalMutation.isPending,
  };
};