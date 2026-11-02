import type { AIProfile, AIProvider } from '../types/ai';

export function validateAIProfile(profile: AIProfile): AIProfile {
  const apiKey = profile.apiKey.trim();
  const model = profile.model.trim();
  if (!apiKey) throw new Error('请填写 API Key。');
  if (/\s/.test(apiKey) || apiKey.length > 2048) throw new Error('API Key 格式不正确，请重新粘贴完整密钥。');
  if (!model || model.length > 120 || /\s/.test(model)) throw new Error('请填写有效的模型名称。');
  let url: URL;
  try { url = new URL(profile.baseUrl.trim()); }
  catch { throw new Error('请填写完整的 HTTPS API 地址。'); }
  if (url.protocol !== 'https:' || !url.hostname || url.username || url.password || url.search || url.hash) {
    throw new Error('API 地址必须使用 HTTPS，且不能包含账号、查询参数或片段。');
  }
  const baseUrl = url.toString().replace(/\/+$/, '').replace(/\/chat\/completions$/, '');
  return { apiKey, model, baseUrl };
}

export type AIMessage = { role: 'system' | 'user'; content: string | Array<
  { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
> };

export class AIRequestError extends Error {
  constructor(message: string, public fatal = false) { super(message); this.name = 'AIRequestError'; }
}

export async function requestAICompletion(provider: AIProvider, draft: AIProfile, messages: AIMessage[],
  options: { signal?: AbortSignal; timeoutMs?: number; json?: boolean; outputSchema?: { name: string; schema: object }; maxTokens?: number } = {}) {
  const { signal, timeoutMs = 45000, maxTokens = 4096 } = options;
  const profile = validateAIProfile(draft);
  // Official compatibility endpoints advertise JSON mode. Custom/self-hosted
  // endpoints must support strict schema output; never silently downgrade them.
  const jsonModeOnly = ['api.deepseek.com', 'api.moonshot.cn', 'api.moonshot.ai'].includes(new URL(profile.baseUrl).hostname);
  const responseFormat = options.outputSchema && !jsonModeOnly
    ? { type: 'json_schema', json_schema: { ...options.outputSchema, strict: true } }
    : options.json || options.outputSchema ? { type: 'json_object' } : undefined;
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel);
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch(`${profile.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${profile.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: profile.model,
        messages,
        stream: false,
        max_tokens: maxTokens,
        ...(responseFormat ? { response_format: responseFormat } : {}),
        ...(provider === 'kimi' && profile.model === 'kimi-k3' ? { reasoning_effort: 'low' } : {}),
      }),
    });
    if (controller.signal.aborted) throw new Error('AI 请求已取消。');
    if (!response.ok) {
      const errors: Record<number, string> = {
        400: '请求不受支持，请检查视觉模型、JSON 输出能力和接口地址；自建服务需支持 json_schema。',
        401: 'API Key 无效或已失效，请检查密钥与服务商是否对应。',
        402: '账户余额不足，请在服务商平台充值后重试。',
        403: '没有访问权限，请检查账号权限与模型是否已开通。',
        404: '找不到接口或模型，请检查 API 地址和模型名称。',
        429: '请求受限或额度不足，请检查服务商额度并稍后重试。',
        422: '服务拒绝了请求参数，请检查视觉输入和 JSON Schema 支持。',
      };
      throw new AIRequestError(errors[response.status] ?? `服务暂不可用（HTTP ${response.status}），请稍后重试。`,
        [400, 401, 402, 403, 404, 422].includes(response.status));
    }
    let data;
    try { data = await response.json(); }
    catch { throw new Error('接口没有返回有效 JSON，请检查 API 地址。'); }
    if (controller.signal.aborted) throw new Error('AI 请求已取消。');
    const content = data?.choices?.[0]?.message?.content;
    if (data?.choices?.[0]?.finish_reason === 'length') throw new Error('模型输出被截断，未获得完整 JSON，请更换简短输出的视觉模型。');
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('接口已响应，但没有返回文本；请检查模型设置或稍后重试。');
    }
    return { content, elapsedMs: Date.now() - startedAt };
  } catch (error) {
    if (timedOut) throw new Error(`AI 请求超时（${timeoutMs / 1000} 秒），请检查网络或尝试更快的模型。`);
    if (controller.signal.aborted) throw new Error('AI 请求已取消。');
    // Do not display provider response bodies: they may echo credentials.
    if (error instanceof TypeError) throw new Error('网络连接失败，请检查地址和网络；网页版也可能受服务商跨域限制。');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function testAIConnection(provider: AIProvider, draft: AIProfile, signal?: AbortSignal) {
  const result = await requestAICompletion(provider, draft, [{ role: 'user', content: '连接测试，请只回复 OK。' }], { signal });
  return { elapsedMs: result.elapsedMs };
}
