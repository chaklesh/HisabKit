import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { syncPendingOperations } from "../modules/ledger/services/ledgerService";
import { getPendingQueue } from "../shared/services/offlineService";

interface NetworkState {

  isOnline: boolean;


  pendingCount: number;
  syncNow: () => Promise<number>;
}

const NetworkContext = createContext<NetworkState | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {

  const [isOnline, setIsOnline] = useState(true);


  const [pendingCount, setPendingCount] = useState(0);
  const syncingRef = useRef(false);

  // Monitor connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {

      setIsOnline(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  // Update pending count periodically
  useEffect(() => {
    const refreshCount = async () => {
      const queue = await getPendingQueue();


      setPendingCount(queue.length);
    };
    refreshCount();
    const interval = setInterval(refreshCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return 0;
    syncingRef.current = true;
    try {
      const synced = await syncPendingOperations();
      const queue = await getPendingQueue();


      setPendingCount(queue.length);
      return synced;
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {

    if (isOnline && pendingCount > 0) {
      syncNow();
    }

  }, [isOnline, pendingCount, syncNow]);

  return (

    <NetworkContext.Provider value={{ isOnline, pendingCount, syncNow }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used within NetworkProvider");
  return ctx;
}
