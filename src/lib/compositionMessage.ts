import type { CompositionTarget } from './compositionTarget';
import type { GuidanceResult, GuidanceStatus } from '../types/guidance';
import { getDirectionCue } from './guidanceDirection';
import type { ExecutionPhase } from './guidanceExecution';

export function getCompositionMessage(enabled: boolean, target: CompositionTarget | null, result: GuidanceResult | null, adjustingZoom: boolean, autoZoom: boolean, status?: GuidanceStatus, phase?: ExecutionPhase) {
  if (status?.phase === 'error') return '指导暂未更新，请查看下方原因';
  if (!enabled) return '开启 AI 指导，获取构图终点';
  if (adjustingZoom) return '正在微调缩放，请稳住手机';
  if (phase === 'parameters') return !autoZoom && result?.advice.camera.zoomFactor != null ? `请调到 ${result.advice.camera.zoomFactor.toFixed(2)}×，或开启自动变焦` : '正在应用相机参数，请稍候';
  if (phase === 'settling') return '已到位，稳住 0.8 秒即可拍照';
  if (phase === 'ready') return '可以拍照了';
  if (phase === 'manual') return target ? '传感器不可用，请对准后手动确认到位' : `${result?.advice.summary ?? '请完成调整'}，完成后手动确认到位`;
  if (phase === 'unavailable') return result?.advice.summary ?? '无法判断当前画面，请改善后重新规划';
  if (target?.phase === 'ready') return '可以拍照了';
  if (target?.phase === 'verifying') return '已对准，请稳住手机';
  if (target) return '沿虚线调整手机，让中心点进入目标圈';
  if (!result) return status?.message ?? '请稳住手机，正在寻找构图终点';
  if (result.advice.state === 'uncertain') return result.advice.summary;
  const cue = getDirectionCue(result.advice);
  if (cue.kind === 'hold') return '请保持，等待构图确认';
  if (cue.kind === 'zoom') return autoZoom ? '请稳住，正在确认缩放' : `${cue.label}，请用 ＋ / − 调整`;
  return cue.label;
}
