import * as SecureStore from 'expo-secure-store';
import type { AIProvider } from '../types/ai';

export const readAIKey = (provider: AIProvider) => SecureStore.getItemAsync(`drama.ai.${provider}`);

export async function writeAIKey(provider: AIProvider, key: string) {
  if (!key) {
    await SecureStore.deleteItemAsync(`drama.ai.${provider}`);
  } else {
    await SecureStore.setItemAsync(`drama.ai.${provider}`, key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
}
