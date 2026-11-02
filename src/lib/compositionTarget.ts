import type { GuidanceResult } from '../types/guidance';
import { isFreshResult } from './guidanceRules';

export type CompositionTarget = { x: number; y: number; phase: 'aiming' | 'verifying' | 'ready' };
export const TARGET_TOLERANCE = 0.035;
export function isTargetAligned(x: number, y: number) {
  // Normalize vertical distance into the same units as horizontal on a 3:4 preview.
  return Math.hypot(x - 0.5, (y - 0.5) * 4 / 3) <= TARGET_TOLERANCE;
}

export function targetFromResult(result: GuidanceResult, now: number): CompositionTarget | null {
  const advice = result.advice;
  if (!['aim', 'ready'].includes(advice.state) || !isFreshResult(result.capturedAt, now) || advice.confidence < 0.6
    || [advice.horizontal, advice.vertical, advice.tilt, advice.distance, advice.zoom].some(action => action !== 'hold')) return null;
  const point = advice.aimPoint;
  if (!point || ![point.x, point.y].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) return null;
  const aligned = isTargetAligned(point.x, point.y);
  return { ...point, phase: aligned ? advice.state === 'ready' && advice.readyToShoot === true && advice.confidence >= 0.8 ? 'ready' : 'verifying' : 'aiming' };
}

// Short-lived angular estimate, NOT visual tracking or measured translation.
// Expo exposes no lens FOV: assume a 60-degree horizontal FOV and let fresh AI
// samples correct drift. Sensor alignment alone can never set phase to 'ready'.
export function moveCompositionTarget(target: CompositionTarget, rotation: { x: number; y: number; z: number }, dt: number, facing: 'front' | 'back', zoomFactor: number): CompositionTarget {
  if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25 || ![rotation.x, rotation.y, rotation.z].every(Number.isFinite)) return target;
  if (Math.hypot(rotation.x, rotation.y, rotation.z) < 0.035) return target;
  // Portrait, unmirrored preview: yaw has the same image-space sign for both
  // lenses (front camera's image-right axis is device-left); pitch reverses.
  const pitchSign = facing === 'front' ? -1 : 1;
  const gain = zoomFactor / (2 * Math.tan(Math.PI / 6));
  const x = Math.max(-0.5, Math.min(1.5, target.x + rotation.y * dt * gain));
  const y = Math.max(-0.5, Math.min(1.5, target.y + pitchSign * rotation.x * dt * gain * 3 / 4));
  return { x, y, phase: isTargetAligned(x, y) ? 'verifying' : 'aiming' };
}
