import { useState, useCallback, useEffect } from 'react';
import { useNetwork } from '../../context/NetworkContext';
import { getPendingQueue } from '../services/offlineService';
import { syncPendingOperations } from '../../modules/ledger/services/ledgerService';

export function useSync() {
  const { isOnline } = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    // This will be updated to use a more efficient way if needed
    const { getPendingQueue } = await import('../../services/offline');
    const queue = await getPendingQueue();
    setPendingCount(queue.length);
  }, []);

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 5000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await syncPendingOperations();
      await refreshPendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshPendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    triggerSync,
    refreshPendingCount,
  };
}
