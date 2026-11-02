import type { AIProfile, AIProvider } from './ai';

export type CameraStyle = '清透' | '奶杏' | '薄荷' | '胶片';
export type CameraMode = '人像' | '风景' | '夜景';
export type WhiteBalance = 'auto' | 'daylight' | 'cloudy' | 'tungsten' | 'fluorescent';
export type CameraCapabilities = { native: boolean; cameraId: string; apertures: number[]; contrast: boolean; whiteBalance: WhiteBalance[] };
export type GuidanceContext = {
  style: CameraStyle;
  mode: CameraMode;
  facing: 'front' | 'back';
  zoom: number;
  flash: 'off' | 'on' | 'auto';
  capabilities?: CameraCapabilities;
};
export type GuidanceConfig = AIProfile & { provider: AIProvider };
export type Guidance = {
  version: 3;
  state: 'aim' | 'adjust' | 'ready' | 'uncertain';
  summary: string;
  horizontal: 'left' | 'right' | 'hold';
  vertical: 'raise' | 'lower' | 'hold';
  tilt: 'up' | 'down' | 'hold';
  distance: 'closer' | 'farther' | 'hold';
  zoom: 'in' | 'out' | 'hold';
  light: string;
  confidence: number;
  // Point in the current, unmirrored image to bring to the viewfinder center.
  aimPoint: { x: number; y: number } | null;
  readyToShoot: boolean;
  route: { path: 'straight' | 'none'; holdMs: 800 };
  camera: { zoomFactor: number | null; flash: 'keep' | 'off' | 'on' | 'auto'; aperture: number | null; contrast: number | null; whiteBalance: WhiteBalance | 'keep' };
};
export type GuidanceSample = { dataUrl: string; capturedAt: number };
export type GuidanceResult = { advice: Guidance; capturedAt: number; receivedAt: number };
export type GuidanceStatus = { phase: 'off' | 'waiting' | 'sampling' | 'analyzing' | 'ready' | 'error'; message: string };
