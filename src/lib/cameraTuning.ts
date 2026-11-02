import { requireOptionalNativeModule } from 'expo-modules-core';
import type { CameraCapabilities, CameraStyle, Guidance } from '../types/guidance';
import { CAMERA_STYLE_PRESETS } from '../constants/guidance';

type TuningModule = {
  capabilities(facing: string): Promise<CameraCapabilities>;
  apply(facing: string, cameraId: string, aperture: number | null, contrast: number | null, whiteBalance: string): Promise<void>;
  reset(facing: string): Promise<void>;
};
const native = requireOptionalNativeModule<TuningModule>('CameraTuning');
import { SYSTEM_CAMERA_CAPABILITIES } from '../constants/cameraCapabilities';

async function bounded<T>(work: Promise<T>): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('相机参数设置超时，请重新规划')), 5000);
    })]);
  } finally { clearTimeout(timeout!); }
}
export async function readCameraCapabilities(facing: string) {
  if (!native) return SYSTEM_CAMERA_CAPABILITIES;
  // Fail visibly on a broken native session; do not advertise false capabilities.
  return bounded(native.capabilities(facing));
}
export function validateCameraTuning(camera: Guidance['camera'], capabilities: CameraCapabilities) {
  if (camera.aperture !== null && (!capabilities.native || capabilities.apertures.length < 2 || !capabilities.apertures.some(value => Math.abs(value - camera.aperture!) < 0.01))) throw new Error('当前镜头不支持该光圈值，请重新规划');
  if (camera.contrast !== null && !capabilities.contrast) throw new Error('当前设备不支持对比度曲线，请重新规划');
  if (camera.whiteBalance !== 'keep' && !capabilities.whiteBalance.includes(camera.whiteBalance)) throw new Error('当前设备不支持该白平衡预设，请重新规划');
}
export function needsCameraTuning(camera: Guidance['camera']) {
  return camera.aperture !== null || camera.contrast !== null || camera.whiteBalance !== 'keep';
}
export function styleTuning(style: CameraStyle, capabilities: CameraCapabilities): Guidance['camera'] | null {
  const preset = CAMERA_STYLE_PRESETS[style];
  if (!capabilities.native) return null;
  const whiteBalance = capabilities.whiteBalance.includes(preset.whiteBalance)
    ? preset.whiteBalance
    : capabilities.whiteBalance.includes('auto') ? 'auto' : 'keep';
  const contrast = capabilities.contrast ? preset.contrast : null;
  if (whiteBalance === 'keep' && contrast === null) return null;
  return { zoomFactor: null, flash: 'keep', aperture: null, contrast, whiteBalance };
}
export async function applyCameraTuning(facing: string, camera: Guidance['camera'], capabilities: CameraCapabilities) {
  validateCameraTuning(camera, capabilities);
  if (!needsCameraTuning(camera)) return;
  if (!native) throw new Error('此安装包未包含相机参数模块，请安装新版 APK');
  await bounded(native.apply(facing, capabilities.cameraId, camera.aperture, camera.contrast, camera.whiteBalance));
}
export async function resetCameraTuning(facing: string) {
  if (native) await bounded(native.reset(facing));
}
