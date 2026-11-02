import { CAMERA_STYLES, GUIDANCE_SYSTEM_PROMPT, GUIDANCE_TIMEOUT_MS } from '../constants/guidance';
import { CAMERA_MODE_PROMPTS } from '../constants/photographyPrompts';
import type { GuidanceConfig, GuidanceContext, GuidanceSample } from '../types/guidance';
import { requestAICompletion } from './aiClient';
import { parseGuidance } from './guidanceRules';
import { digitalZoomFactor } from './cameraGeometry';
import { GUIDANCE_SCHEMA } from '../constants/guidanceProtocol';
import type { AIMessage } from './aiClient';
import { SYSTEM_CAMERA_CAPABILITIES } from '../constants/cameraCapabilities';

export async function analyzeCameraSample(config: GuidanceConfig, context: GuidanceContext, sample: GuidanceSample, signal: AbortSignal, onProgress?: (message: string) => void) {
  if (!sample.dataUrl.startsWith('data:image/jpeg;base64,') || sample.dataUrl.length > 2_000_000) {
    throw new Error('分析图片格式或大小不合适，请重新取样。');
  }
  const messages: AIMessage[] = [
    { role: 'system', content: `${CAMERA_MODE_PROMPTS[context.mode]}\n\n${GUIDANCE_SYSTEM_PROMPT}` },
    { role: 'user', content: [
      { type: 'text', text: `拍摄模式：${context.mode}。风格：${context.style}，${CAMERA_STYLES[context.style]}\n镜头：${context.facing === 'front' ? '前置' : '后置'}，画面不镜像。当前数字放大倍率：${digitalZoomFactor(context.zoom).toFixed(2)} 倍，闪光灯：${context.flash}，图片已按此倍率裁切。本机参数能力：${JSON.stringify(context.capabilities ?? SYSTEM_CAMERA_CAPABILITIES)}。只选择能力列表中的参数。请一次返回最终构图目标与所需相机设置；客户端在本地对准后直接提示拍照，不会再次请求模型复核。` },
      { type: 'image_url', image_url: { url: sample.dataUrl } },
    ] },
  ];
  if (signal.aborted) throw new Error('AI 请求已取消。');
  onProgress?.(`正在分析本轮画面，请保持机位（最多 ${GUIDANCE_TIMEOUT_MS / 1000} 秒）`);
  // Local waiting feedback only: these timers never send or retry requests.
  const notices = onProgress ? [
    setTimeout(() => { if (!signal.aborted) onProgress('本轮请求已等待 10 秒，请保持机位，无需重复请求'); }, 10000),
    setTimeout(() => { if (!signal.aborted) onProgress('本轮请求已等待 25 秒，仍在等待服务返回，可关闭 AI 指导取消'); }, 25000),
  ] : [];
  const clearNotices = () => notices.forEach(clearTimeout);
  signal.addEventListener('abort', clearNotices);
  try {
    const result = await requestAICompletion(config.provider, config, messages, {
      signal, timeoutMs: GUIDANCE_TIMEOUT_MS, json: true,
      outputSchema: { name: 'camera_guidance_v3', schema: GUIDANCE_SCHEMA },
    });
    if (signal.aborted) throw new Error('AI 请求已取消。');
    onProgress?.('正在校验本轮执行方案');
    return parseGuidance(result.content);
  } finally {
    clearNotices();
    signal.removeEventListener('abort', clearNotices);
  }
}
