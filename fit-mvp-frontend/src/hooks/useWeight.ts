import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { WeightEntryResponse, WeightStatsResponse, CreateWeightEntryRequest, UpdateWeightEntryRequest } from '@fitness/api-client';
import { toast } from 'sonner';

export const useWeight = () => {
  const queryClient = useQueryClient();

  // Fetch weight entries
  const { 
    data: weightEntries = [], 
    isLoading: isLoadingEntries,
    error: entriesError
  } = useQuery({
    queryKey: ['weightEntries'],
    queryFn: async () => {
      try {
        const entries = await api.getWeightEntries();
        return entries as WeightEntryResponse[];
      } catch (error) {
        console.error('Failed to fetch weight entries:', error);
        toast.error('Failed to load weight entries');
        return [];
      }
    },
  });

  // Fetch weight stats
  const { 
    data: weightStats, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['weightStats'],
    queryFn: async () => {
      try {
        const stats = await api.getWeightStats();
        return stats as WeightStatsResponse;
      } catch (error) {
        console.error('Failed to fetch weight stats:', error);
        toast.error('Failed to load weight statistics');
        return null;
      }
    },
  });

  // Create weight entry mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateWeightEntryRequest) => {
      return api.createWeightEntry(data);
    },
    onSuccess: (newEntry) => {
      queryClient.setQueryData(['weightEntries'], (old: WeightEntryResponse[] = []) => {
        return [...old, newEntry];
      });
      toast.success('Weight entry added successfully!');
      queryClient.invalidateQueries({ queryKey: ['weightStats'] });
    },
    onError: (error) => {
      toast.error('Failed to add weight entry');
      console.error('Create weight entry error:', error);
    },
  });

  // Update weight entry mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWeightEntryRequest }) => {
      return api.updateWeightEntry(id, data);
    },
    onSuccess: (updatedEntry, variables) => {
      queryClient.setQueryData(['weightEntries'], (old: WeightEntryResponse[] = []) => {
        return old.map(entry => 
          entry.id === variables.id ? updatedEntry : entry
        );
      });
      toast.success('Weight entry updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['weightStats'] });
    },
    onError: (error) => {
      toast.error('Failed to update weight entry');
      console.error('Update weight entry error:', error);
    },
  });

  // Delete weight entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.deleteWeightEntry(id);
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData(['weightEntries'], (old: WeightEntryResponse[] = []) => {
        return old.filter(entry => entry.id !== id);
      });
      toast.success('Weight entry deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['weightStats'] });
    },
    onError: (error) => {
      toast.error('Failed to delete weight entry');
      console.error('Delete weight entry error:', error);
    },
  });

  // Update weight unit preference mutation
  const updateWeightUnitMutation = useMutation({
    mutationFn: async (userWeightUnit: 'KG' | 'LB') => {
      return api.updateWeightUnit({ userWeightUnit });
    },
    onSuccess: () => {
      toast.success('Weight unit preference updated!');
      // Invalidate user data to reflect new unit preference
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      toast.error('Failed to update weight unit preference');
      console.error('Update weight unit error:', error);
    },
  });

  const sortedEntries = [...weightEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const isLoading = isLoadingEntries || isLoadingStats;
  const error = entriesError || statsError;

  return {
    weightEntries: sortedEntries,
    weightStats,
    isLoading,
    error,
    createWeightEntry: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWeightEntry: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWeightEntry: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    updateWeightUnit: updateWeightUnitMutation.mutateAsync,
    isUpdatingUnit: updateWeightUnitMutation.isPending,
  };
};