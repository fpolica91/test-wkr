import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { WorkoutResponse as Workout, LocationType, FocusArea, ExerciseResponse } from '@fitness/api-client';
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
    mutationFn: async ({ locationType, focusArea }: { locationType?: string; focusArea?: string }) => {
      return api.generateWorkout(locationType as LocationType, focusArea as FocusArea);
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

  const toggleExerciseMutation = useMutation({
    mutationFn: async ({ workoutId, exerciseId, completed }: { workoutId: string; exerciseId: string; completed: boolean }) => {
      return api.toggleExerciseCompletion(workoutId, exerciseId, completed);
    },
    onSuccess: (updatedExercise: ExerciseResponse, variables) => {
      queryClient.setQueryData(['workouts'], (old: Workout[] = []) => {
        return old.map(workout => {
          if (workout.id === variables.workoutId) {
            return {
              ...workout,
              exercises: workout.exercises.map(ex => 
                ex.id === variables.exerciseId 
                  ? updatedExercise
                  : ex
              )
            };
          }
          return workout;
        });
      });
      
      if (variables.completed) {
        toast.success('Exercise completed!');
      }
    },
    onError: (error) => {
      toast.error('Failed to update exercise');
      console.error('Toggle exercise error:', error);
    },
  });

  const swapExerciseMutation = useMutation({
    mutationFn: async ({ workoutId, exerciseId, locationType, focusArea }: { 
      workoutId: string; 
      exerciseId: string; 
      locationType?: string;
      focusArea?: string;
    }) => {
      return api.swapExercise(workoutId, exerciseId, locationType as LocationType, focusArea as FocusArea);
    },
    onSuccess: (updatedWorkout: Workout) => {
      queryClient.setQueryData(['workouts'], (old: Workout[] = []) => {
        return old.map(workout => 
          workout.id === updatedWorkout.id 
            ? updatedWorkout
            : workout
        );
      });
      toast.success('Exercise swapped!');
    },
    onError: (error) => {
      toast.error('Failed to swap exercise');
      console.error('Swap exercise error:', error);
    },
  });

  const regenerateWorkoutMutation = useMutation({
    mutationFn: async ({ workoutId, feedback, locationType, focusArea }: { 
      workoutId: string; 
      feedback: string;
      locationType?: string;
      focusArea?: string;
    }) => {
      return api.regenerateWorkout(workoutId, feedback, locationType as LocationType, focusArea as FocusArea);
    },
    onSuccess: (updatedWorkout: Workout) => {
      queryClient.setQueryData(['workouts'], (old: Workout[] = []) => {
        return old.map(workout => 
          workout.id === updatedWorkout.id 
            ? updatedWorkout
            : workout
        );
      });
      toast.success('Workout regenerated!');
    },
    onError: (error) => {
      toast.error('Failed to regenerate workout');
      console.error('Regenerate workout error:', error);
    },
  });

  const voteWorkoutMutation = useMutation({
    mutationFn: async ({ workoutId, vote }: { workoutId: string; vote: 'UPVOTE' | 'DOWNVOTE' }) => {
      return api.voteWorkout(workoutId, vote);
    },
    onSuccess: (updatedWorkout: Workout) => {
      queryClient.setQueryData(['workouts'], (old: Workout[] = []) => {
        return old.map(workout => 
          workout.id === updatedWorkout.id 
            ? updatedWorkout
            : workout
        );
      });
    },
    onError: (error) => {
      toast.error('Failed to vote');
      console.error('Vote workout error:', error);
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
    toggleExerciseCompletion: toggleExerciseMutation.mutateAsync,
    isTogglingExercise: toggleExerciseMutation.isPending,
    swapExercise: swapExerciseMutation.mutateAsync,
    isSwappingExercise: swapExerciseMutation.isPending,
    regenerateWorkout: regenerateWorkoutMutation.mutateAsync,
    isRegenerating: regenerateWorkoutMutation.isPending,
    voteWorkout: voteWorkoutMutation.mutateAsync,
    isVoting: voteWorkoutMutation.isPending,
  };
};