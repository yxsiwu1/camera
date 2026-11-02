import type { Guidance } from '../types/guidance';

export type DirectionCue = {
  kind: 'move' | 'tilt' | 'distance' | 'zoom' | 'hold' | 'uncertain';
  x: number;
  y: number;
  label: string;
};

// Directions describe the phone's movement, not the subject's movement in the frame.
export function getDirectionCue(advice: Guidance): DirectionCue {
  if (advice.confidence < 0.6) return { kind: 'uncertain', x: 0, y: 0, label: '稳住手机，等待清晰画面' };
  const x = advice.horizontal === 'left' ? -1 : advice.horizontal === 'right' ? 1 : 0;
  const y = advice.vertical === 'raise' ? -1 : advice.vertical === 'lower' ? 1 : 0;
  if (x || y) {
    const direction = `${x < 0 ? '左' : x > 0 ? '右' : ''}${y < 0 ? '上' : y > 0 ? '下' : ''}`;
    return { kind: 'move', x, y, label: `向${direction}方移动手机` };
  }
  if (advice.tilt !== 'hold') return { kind: 'tilt', x: 0, y: advice.tilt === 'up' ? -1 : 1, label: advice.tilt === 'up' ? '镜头稍向上仰' : '镜头稍向下俯' };
  if (advice.distance !== 'hold') return { kind: 'distance', x: 0, y: advice.distance === 'closer' ? -1 : 1, label: advice.distance === 'closer' ? '向前稍靠近主体' : '向后稍远离主体' };
  if (advice.zoom !== 'hold') return { kind: 'zoom', x: 0, y: 0, label: advice.zoom === 'in' ? '建议小幅拉近画面' : '建议小幅拉远画面' };
  return { kind: 'hold', x: 0, y: 0, label: '保持当前构图' };
}
