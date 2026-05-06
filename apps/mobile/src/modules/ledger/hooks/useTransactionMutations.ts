import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import type { LedgerTransaction } from "../../../shared/types/ledger";
import { createTransaction, deleteTransaction, updateTransaction } from "../services/ledgerService";

export function useTransactionMutations(customerId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ledger", "transactions", customerId] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["ledger", "customers"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<LedgerTransaction>) => createTransaction(data),
    onSuccess: () => {
      invalidate();
      Alert.alert("Success", "Transaction recorded");
    },
    onError: (error: Error) => {
      if (error.message === "OFFLINE_QUEUED") {
        Alert.alert("Offline Mode", "Transaction saved to queue and will sync automatically.");
        invalidate();
      } else {
        Alert.alert("Error", "Failed to save transaction. Please try again.");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LedgerTransaction> }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      invalidate();
      Alert.alert("Success", "Transaction updated");
    },
    onError: (error: Error) => {
      if (error.message === "OFFLINE_QUEUED") {
        Alert.alert("Offline Mode", "Update queued for sync.");
        invalidate();
      } else {
        Alert.alert("Error", "Failed to update transaction.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      invalidate();
      Alert.alert("Deleted", "Entry removed from khata");
    },
    onError: (error: Error) => {
      if (error.message === "OFFLINE_QUEUED") {
        Alert.alert("Offline Mode", "Delete queued for sync.");
        invalidate();
      } else {
        Alert.alert("Error", "Failed to delete entry.");
      }
    },
  });

  return {
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
