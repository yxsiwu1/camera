import { GUIDANCE_SAMPLE_MAX_AGE_MS, GUIDANCE_SETTLE_MS } from '../constants/guidance';
import { isFreshResult } from './guidanceRules';
import type { Guidance, GuidanceResult, GuidanceSample, GuidanceStatus } from '../types/guidance';

type Dependencies = {
  canSample: () => boolean;
  waitingMessage?: () => string;
  sample: (signal: AbortSignal) => Promise<GuidanceSample>;
  analyze: (sample: GuidanceSample, signal: AbortSignal, onProgress: (message: string) => void) => Promise<Guidance>;
  onResult: (result: GuidanceResult | null) => void;
  onStatus: (status: GuidanceStatus) => void;
  onFatal: () => void;
  now?: () => number;
  schedule?: typeof setTimeout;
  unschedule?: typeof clearTimeout;
};

// Demand-driven requests: success/error never schedule another model call.
export class GuidanceLoop {
  private enabled = false;
  private running = false;
  private pending = false;
  private revision = 0;
  private controller: AbortController | null = null;
  private timer?: ReturnType<typeof setTimeout>;
  private now: () => number;
  private schedule: (handler: () => void, timeout?: number) => ReturnType<typeof setTimeout>;
  private unschedule: (timer?: ReturnType<typeof setTimeout>) => void;
  constructor(private deps: Dependencies) {
    this.now = deps.now ?? Date.now;
    // Keep the globals unbound from the class instance: browsers throw
    // "Illegal invocation" when setTimeout/clearTimeout run with another `this`.
    this.schedule = deps.schedule ?? ((handler, timeout) => setTimeout(handler, timeout));
    this.unschedule = deps.unschedule ?? ((timer) => clearTimeout(timer));
  }
  start() {
    if (this.enabled) return;
    this.enabled = true;
    this.invalidate('准备获取本轮调整方案');
  }
  stop() {
    this.enabled = false; this.pending = false; this.revision++;
    this.controller?.abort(); this.unschedule(this.timer);
    this.deps.onResult(null);
    this.deps.onStatus({ phase: 'off', message: 'AI 指导已关闭' });
  }
  // Explicit replan: changed lens/style or a user action, not sensor polling.
  invalidate(message = '正在重新规划当前画面') {
    this.revision++; this.controller?.abort(); this.unschedule(this.timer);
    this.deps.onResult(null);
    if (!this.enabled) return;
    this.pending = true;
    this.deps.onStatus({ phase: 'waiting', message });
    this.enqueue(GUIDANCE_SETTLE_MS);
  }
  // Large motion during a request discards it but does not create a new request.
  pause(message: string) {
    if (!this.enabled) return;
    this.revision++; this.pending = false; this.controller?.abort(); this.unschedule(this.timer);
    this.deps.onResult(null);
    this.deps.onStatus({ phase: 'waiting', message });
  }
  private enqueue(delay: number) {
    this.unschedule(this.timer);
    if (this.enabled && this.pending && !this.running) this.timer = this.schedule(() => { void this.tick(); }, delay);
  }
  private async tick() {
    if (!this.enabled || !this.pending || this.running) return;
    if (!this.deps.canSample()) {
      this.deps.onStatus({ phase: 'waiting', message: this.deps.waitingMessage?.() ?? '正在等待相机就绪' });
      this.enqueue(250); return;
    }
    this.running = true; this.pending = false;
    const revision = this.revision;
    const controller = new AbortController(); this.controller = controller;
    const current = () => this.enabled && this.revision === revision && !controller.signal.aborted;
    try {
      this.deps.onStatus({ phase: 'sampling', message: '正在获取本轮画面' });
      const sample = await this.deps.sample(controller.signal);
      if (!current()) return;
      if (!isFreshResult(sample.capturedAt, this.now(), GUIDANCE_SAMPLE_MAX_AGE_MS)) throw new Error('取样耗时过长，请点击重新规划。');
      this.deps.onStatus({ phase: 'analyzing', message: '正在获取移动路线与相机参数…' });
      const advice = await this.deps.analyze(sample, controller.signal, message => {
        if (current()) this.deps.onStatus({ phase: 'analyzing', message });
      });
      if (!current()) return;
      if (!isFreshResult(sample.capturedAt, this.now())) throw new Error('返回画面已过期，请点击重新规划。');
      const receivedAt = this.now();
      this.deps.onStatus({ phase: 'ready', message: `方案已收到 · ${((receivedAt - sample.capturedAt) / 1000).toFixed(1)} 秒` });
      this.deps.onResult({ advice, capturedAt: sample.capturedAt, receivedAt });
    } catch (error) {
      if (!current()) return;
      this.deps.onResult(null);
      this.deps.onStatus({ phase: 'error', message: `${error instanceof Error ? error.message : '分析失败。'} 请点击重新规划重试。` });
      if ((error as { fatal?: boolean })?.fatal) { this.enabled = false; this.deps.onFatal(); }
    } finally {
      this.running = false;
      if (this.controller === controller) this.controller = null;
      // Only an explicit invalidate received while busy may enqueue a new call.
      if (this.pending) this.enqueue(GUIDANCE_SETTLE_MS);
    }
  }
}
