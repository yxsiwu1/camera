import AsyncStorage from '@react-native-async-storage/async-storage';

export const captureStorage = {
  get: async (key: string) => AsyncStorage.getItem(key),
  set: async (key: string, value: string) => AsyncStorage.setItem(key, value),
  remove: async (key: string) => AsyncStorage.removeItem(key),
};
