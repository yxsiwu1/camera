import type { AIProvider, AISettings } from '../types/ai';

export const AI_PROVIDER_IDS: AIProvider[] = ['deepseek', 'kimi', 'custom'];

export const AI_PROVIDERS: Record<AIProvider, { name: string; hint: string; baseUrl: string; model: string }> = {
  deepseek: { name: 'DeepSeek', hint: 'DeepSeek 开放平台', baseUrl: 'https://api.deepseek.com', model: 'deepseek-flash' },
  kimi: { name: 'Kimi', hint: '月之暗面 · 国内站', baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k3' },
  custom: { name: '自定义', hint: '填写自己的 API Key、服务地址与模型', baseUrl: '', model: '' },
};

export function createAISettings(): AISettings {
  return {
    provider: 'deepseek',
    profiles: {
      deepseek: { baseUrl: AI_PROVIDERS.deepseek.baseUrl, model: AI_PROVIDERS.deepseek.model, apiKey: '' },
      kimi: { baseUrl: AI_PROVIDERS.kimi.baseUrl, model: AI_PROVIDERS.kimi.model, apiKey: '' },
      custom: { baseUrl: AI_PROVIDERS.custom.baseUrl, model: AI_PROVIDERS.custom.model, apiKey: '' },
    },
  };
}
