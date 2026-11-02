import type { Guidance, GuidanceContext, GuidanceResult } from '../types/guidance';
import { digitalZoomFactor } from './cameraGeometry';
import { isTargetAligned, moveCompositionTarget, targetFromResult, type CompositionTarget } from './compositionTarget';

export type ExecutionPhase = 'idle' | 'parameters' | 'moving' | 'manual' | 'settling' | 'unavailable' | 'ready';
export type CameraCommands = { zoom?: number; flash?: GuidanceContext['flash'] };

// Executes a validated, whitelisted plan as data. Never evaluates model code.
export class GuidanceExecution {
  target: CompositionTarget | null = null;
  advice: Guidance | null = null;
  private cameraDone = true;
  private movementConfirmed = false;
  private completed = false;
  private hardwareDone = true;
  private stableSince: number | null = null;
  private lastMotion = 0;
  private factor = 1;
  private sensors = false;

  reset() {
    this.target = null; this.advice = null; this.cameraDone = true;
    this.movementConfirmed = false; this.completed = false;
    this.hardwareDone = true; this.stableSince = null; this.lastMotion = 0;
  }
  setSensors(available: boolean) { this.sensors = available; }
  setHardwareDone(done: boolean, now: number) { this.hardwareDone = done; this.noteMotion(now); }
  load(result: GuidanceResult, context: GuidanceContext, now: number, autoZoom: boolean): CameraCommands {
    this.reset();
    const advice = result.advice;
    const factor = digitalZoomFactor(context.zoom);
    const requested = advice.camera.zoomFactor;
    if (context.facing === 'front' && !['keep', 'off'].includes(advice.camera.flash)) {
      throw new Error('前置镜头不支持本步闪光灯设置，请重新规划。');
    }
    // Check the whole plan before mutating any device setting.
    if (requested !== null && (requested < 1 || requested > 1.9 || Math.abs(requested - factor) > 0.3 + 1e-6)) {
      throw new Error('本步变焦超过允许幅度（最多0.3倍），请重新规划。');
    }
    if (requested !== null && ((advice.zoom === 'in' && requested < factor) || (advice.zoom === 'out' && requested > factor))) {
      throw new Error('变焦方向与目标倍率矛盾，请重新规划。');
    }
    this.advice = advice; this.factor = factor; this.lastMotion = now;
    this.target = targetFromResult(result, now);
    if (this.target?.phase === 'ready') this.target = { ...this.target, phase: 'verifying' };
    this.observeCamera(context, now);
    const commands: CameraCommands = {};
    if (autoZoom && requested !== null && Math.abs(requested - factor) > 0.005) commands.zoom = (requested - 1) / 3;
    if (advice.camera.flash !== 'keep' && advice.camera.flash !== context.flash) commands.flash = advice.camera.flash;
    return commands;
  }
  observeCamera(context: GuidanceContext, now: number) {
    if (!this.advice) return;
    const factor = digitalZoomFactor(context.zoom);
    if (Math.abs(factor - this.factor) > 0.0001) {
      if (this.target) this.target = { ...this.target, x: 0.5 + (this.target.x - 0.5) * factor / this.factor, y: 0.5 + (this.target.y - 0.5) * factor / this.factor };
      this.factor = factor;
      this.noteMotion(now);
    }
    const camera = this.advice.camera;
    const done = (camera.zoomFactor === null || Math.abs(factor - camera.zoomFactor) <= 0.005)
      && (camera.flash === 'keep' || camera.flash === context.flash);
    if (!this.cameraDone && done) this.noteMotion(now);
    this.cameraDone = done;
  }
  rotate(rotation: { x: number; y: number; z: number }, dt: number, facing: 'front' | 'back', now: number) {
    if (!this.advice) return;
    const moving = Math.hypot(rotation.x, rotation.y, rotation.z) > 0.06;
    if (moving) this.noteMotion(now);
    if (this.target && this.sensors) {
      const next = moveCompositionTarget(this.target, rotation, dt, facing, this.factor);
      if (next !== this.target) {
        // Tiny hand tremor inside the circle must not flicker/re-vibrate ready.
        const staysReady = this.completed && !moving && isTargetAligned(next.x, next.y);
        this.target = staysReady ? { ...next, phase: 'ready' } : next;
        if (this.completed && !staysReady) this.noteMotion(now);
      }
    }
  }
  noteMotion(now: number) {
    this.lastMotion = now; this.stableSince = null;
    this.completed = false;
    this.movementConfirmed = false;
    if (this.target) this.target = { ...this.target, phase: isTargetAligned(this.target.x, this.target.y) ? 'verifying' : 'aiming' };
  }
  confirmManual(now: number) {
    if (!this.advice || this.advice.state === 'uncertain' || this.completed || this.movementConfirmed || !this.cameraDone || !this.hardwareDone) return false;
    this.movementConfirmed = true; this.lastMotion = now;
    this.stableSince = null; return true;
  }
  get phase(): ExecutionPhase {
    if (!this.advice) return 'idle';
    if (this.advice.state === 'uncertain') return 'unavailable';
    if (!this.cameraDone || !this.hardwareDone) return 'parameters';
    if (this.completed) return 'ready';
    const physical = [this.advice.horizontal, this.advice.vertical, this.advice.tilt, this.advice.distance].some(x => x !== 'hold');
    if (!this.movementConfirmed) {
      if (physical || (this.target && !this.sensors)) return 'manual';
      if (this.target && !isTargetAligned(this.target.x, this.target.y)) return 'moving';
    }
    return 'settling';
  }
  finishIfStable(now: number): boolean {
    if (this.phase !== 'settling') { this.stableSince = null; return false; }
    this.beginSettling(now);
    if (now - this.stableSince! < (this.advice?.route.holdMs ?? 800)) return false;
    this.completed = true;
    if (this.target) this.target = { ...this.target, phase: 'ready' };
    return true;
  }
  beginSettling(now: number) {
    if (this.phase === 'settling' && this.stableSince === null) this.stableSince = Math.max(now, this.lastMotion);
  }
}
