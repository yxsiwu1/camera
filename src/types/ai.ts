export type AIProvider = 'deepseek' | 'kimi' | 'custom';

export type AIProfile = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type AISettings = {
  provider: AIProvider;
  profiles: Record<AIProvider, AIProfile>;
};
