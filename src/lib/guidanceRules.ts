import { GUIDANCE_MAX_AGE_MS } from '../constants/guidance';
export { parseGuidanceProtocol as parseGuidance } from './guidanceProtocol';
export function isFreshResult(capturedAt: number, now: number, maxAgeMs = GUIDANCE_MAX_AGE_MS) { return now >= capturedAt && now - capturedAt < maxAgeMs; }

// One physical camera capture at a time, shared by sampling and the shutter.
export class CameraShotQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const next = this.tail.then(() => {
      if (signal?.aborted) throw new Error('取样已取消');
      return task();
    });
    this.tail = next.catch(() => undefined);
    return next;
  }
}
