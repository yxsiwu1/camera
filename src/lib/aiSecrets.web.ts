import type { AIProvider } from '../types/ai';

// The browser has no OS keychain. Keep keys in memory, never in localStorage.
const keys: Partial<Record<AIProvider, string>> = {};
export async function readAIKey(provider: AIProvider) { return keys[provider] ?? null; }
export async function writeAIKey(provider: AIProvider, key: string) {
  if (key) keys[provider] = key;
  else delete keys[provider];
}
