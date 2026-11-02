import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Camera data URLs can quickly exceed localStorage's small quota on web.
// IndexedDB retains the actual image data and resolves only after a committed write.
async function webTransaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('drama-captures', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('state');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction('state', mode);
      const request = run(transaction.objectStore('state'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error ?? new Error('照片记录写入失败'));
      transaction.onerror = () => reject(transaction.error ?? new Error('照片记录写入失败'));
    });
  } finally { database.close(); }
}

export const capturePersistence = Platform.OS === 'web' ? {
  async getItem(key: string): Promise<string | null> {
    const current = await webTransaction('readonly', store => store.get(key));
    if (typeof current === 'string') return current;
    // Preserve existing albums from the earlier localStorage-backed version.
    const legacy = await AsyncStorage.getItem(key);
    if (legacy !== null) await webTransaction('readwrite', store => store.put(legacy, key));
    return legacy;
  },
  async setItem(key: string, value: string): Promise<void> {
    await webTransaction('readwrite', store => store.put(value, key));
  },
  async removeItem(key: string): Promise<void> {
    await webTransaction('readwrite', store => store.delete(key));
    await AsyncStorage.removeItem(key);
  },
} : AsyncStorage;
