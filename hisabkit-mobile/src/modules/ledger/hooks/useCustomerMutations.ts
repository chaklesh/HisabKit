import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer, updateCustomer, deleteCustomer } from '../services/ledgerService';
import { Alert } from 'react-native';
import type { Customer } from '../../../shared/types/ledger';

export function useCustomerMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: Partial<Customer>) => createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger', 'customers'] });
      Alert.alert('Success', 'Customer added successfully');
    },
    onError: (error: any) => {
      if (error.message === 'OFFLINE_QUEUED') {
        Alert.alert('Queued', 'Customer will be added when you are back online');
        queryClient.invalidateQueries({ queryKey: ['ledger', 'customers'] });
      } else {
        Alert.alert('Error', 'Failed to add customer. Please try again.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger', 'customers'] });
      Alert.alert('Success', 'Customer updated successfully');
    },
    onError: (error: any) => {
      if (error.message === 'OFFLINE_QUEUED') {
        Alert.alert('Queued', 'Update will be synced when you are back online');
        queryClient.invalidateQueries({ queryKey: ['ledger', 'customers'] });
      } else {
        Alert.alert('Error', 'Failed to update customer. Please try again.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger', 'customers'] });
      Alert.alert('Deleted', 'Customer removed successfully');
    },
    onError: (error: any) => {
      if (error.message === 'OFFLINE_QUEUED') {
        Alert.alert('Queued', 'Delete will be synced when you are back online');
        queryClient.invalidateQueries({ queryKey: ['ledger', 'customers'] });
      } else {
        Alert.alert('Error', 'Failed to delete customer. Please try again.');
      }
    },
  });

  return {
    createCustomer: createMutation.mutateAsync,
    updateCustomer: updateMutation.mutateAsync,
    deleteCustomer: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
