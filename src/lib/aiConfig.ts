import { AI_PROVIDER_IDS, createAISettings } from '../constants/ai';
import type { AIProfile, AIProvider, AISettings } from '../types/ai';
import { captureStorage } from './storage';
import { readAIKey, writeAIKey } from './aiSecrets';

const SETTINGS_KEY = 'drama.ai.settings.v1';

export async function loadAISettings(): Promise<AISettings> {
  const settings = createAISettings();
  const raw = await captureStorage.get(SETTINGS_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (AI_PROVIDER_IDS.includes(data?.provider)) settings.provider = data.provider;
    for (const provider of AI_PROVIDER_IDS) {
      const profile = data?.profiles?.[provider];
      if (typeof profile?.baseUrl === 'string') settings.profiles[provider].baseUrl = profile.baseUrl;
      if (typeof profile?.model === 'string') settings.profiles[provider].model = profile.model;
    }
  }
  await Promise.all(AI_PROVIDER_IDS.map(async provider => {
    settings.profiles[provider].apiKey = await readAIKey(provider) ?? '';
  }));
  return settings;
}

export async function saveAIProfile(provider: AIProvider, profile: AIProfile) {
  const settings = await loadAISettings();
  // Write the secret first; never serialize it into ordinary settings storage.
  await writeAIKey(provider, profile.apiKey);
  settings.provider = provider;
  settings.profiles[provider] = profile;
  await captureStorage.set(SETTINGS_KEY, JSON.stringify({
    provider,
    profiles: Object.fromEntries(AI_PROVIDER_IDS.map(id => [id, {
      baseUrl: settings.profiles[id].baseUrl,
      model: settings.profiles[id].model,
    }])),
  }));
}

export async function clearAIKey(provider: AIProvider) { await writeAIKey(provider, ''); }

// Load the selected provider when the user enables camera guidance.
export async function getActiveAIConfig() {
  const settings = await loadAISettings();
  return { provider: settings.provider, ...settings.profiles[settings.provider] };
}
