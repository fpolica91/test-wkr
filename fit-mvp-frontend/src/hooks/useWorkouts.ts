import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { WorkoutResponse as Workout, LocationType } from '@fitness/api-client';
import { toast } from 'sonner';

export const useWorkouts = () => {
  const queryClient = useQueryClient();

  const { 
    data: workouts = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      try {
        const allWorkouts = await api.getWorkoutHistory();
        return allWorkouts as Workout[];
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
        return [];
      }
    },
  });

  const generateWorkoutMutation = useMutation({
    mutationFn: async (locationType?: string) => {
      return api.generateWorkout(locationType as LocationType);
    },
    onSuccess: (newWorkout) => {
      queryClient.setQueryData(['workouts'], (old: Workout[] = []) => {
        // Filter out any incomplete workouts and add the new one
        const filtered = old.filter(w => w.completed);
        return [...filtered, newWorkout];
      });
      toast.success('New workout generated!');
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (error) => {
      toast.error('Failed to generate workout');
      console.error('Workout generation error:', error);
    },
  });

  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      return api.completeWorkout(workoutId);
    },
    onSuccess: (_data, workoutId) => {
      queryClient.setQueryData(['workouts'], (old: Workout[] = []) => {
        return old.map(workout => 
          workout.id === workoutId 
            ? { ...workout, completed: true }
            : workout
        );
      });
      toast.success('Workout completed! Great job!');
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    },
    onError: (error) => {
      toast.error('Failed to mark workout as complete');
      console.error('Complete workout error:', error);
    },
  });

  const currentWorkout = workouts.find(w => !w.completed);
  const completedWorkouts = workouts.filter(w => w.completed);

  return {
    workouts,
    currentWorkout,
    completedWorkouts,
    isLoading,
    error,
    generateWorkout: generateWorkoutMutation.mutateAsync,
    isGenerating: generateWorkoutMutation.isPending,
    completeWorkout: completeWorkoutMutation.mutateAsync,
    isCompleting: completeWorkoutMutation.isPending,
  };
};