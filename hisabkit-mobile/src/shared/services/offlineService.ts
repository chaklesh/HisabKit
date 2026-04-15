import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CUSTOMERS: '@hisabkit_customers',
  TRANSACTIONS_PREFIX: '@hisabkit_txns_',
  PENDING_QUEUE: '@hisabkit_pending_queue',
  LAST_SYNC: '@hisabkit_last_sync',
  SUMMARY: '@hisabkit_summary',
} as const;

/** Generic cache helpers */
export async function cacheSet(key: string, data: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to cache key ${key}:`, e);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error(`Failed to read cache key ${key}:`, e);
    return null;
  }
}

export async function cacheRemove(key: string) {
  await AsyncStorage.removeItem(key);
}

/** ---- Pending operations queue (offline mutations) ---- */
export type OperationType = 
  | 'CREATE_TRANSACTION' 
  | 'UPDATE_TRANSACTION' 
  | 'DELETE_TRANSACTION'
  | 'CREATE_CUSTOMER'
  | 'UPDATE_CUSTOMER'
  | 'DELETE_CUSTOMER';

export interface PendingOperation {
  id: string;
  type: OperationType;
  payload: Record<string, any>;
  metadata?: {
    customerId?: string;
    transactionId?: string;
  };
  createdAt: string;
  retryCount: number;
}

export async function enqueue(op: Omit<PendingOperation, 'id' | 'createdAt' | 'retryCount'>) {
  const queue = await getPendingQueue();
  queue.push({
    ...op,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  await cacheSet(STORAGE_KEYS.PENDING_QUEUE, queue);
  return queue.length;
}

export async function getPendingQueue(): Promise<PendingOperation[]> {
  return (await cacheGet<PendingOperation[]>(STORAGE_KEYS.PENDING_QUEUE)) ?? [];
}

export async function setPendingQueue(queue: PendingOperation[]) {
  await cacheSet(STORAGE_KEYS.PENDING_QUEUE, queue);
}

export async function clearPendingQueue() {
  await cacheRemove(STORAGE_KEYS.PENDING_QUEUE);
}

export async function setLastSync(ts: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, ts);
}

export async function getLastSync(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
}

export { STORAGE_KEYS };

