import type { CameraRatio } from '../types/guidance';

// Use the same digital crop for preview, analysis and saved photos. Expo SDK 52
// maps native zoom differently on Android and iOS and exposes no maxZoom query.
export function digitalZoomFactor(zoom: number) {
  return 1 + Math.max(0, Math.min(1, zoom)) * 3;
}

// Width / height of the framing rectangle for each capture ratio.
export const RATIO_VALUES: Record<CameraRatio, number> = { '4:3': 3 / 4, '16:9': 9 / 16, '1:1': 1 };

export function ratioAspect(ratio: CameraRatio) {
  return RATIO_VALUES[ratio] ?? RATIO_VALUES['4:3'];
}

// Letterbox a framing rectangle inside the viewfinder card. The native preview
// is always "cover"-cropped to this rect, so the preview matches the capture.
export function frameSize(containerWidth: number, containerHeight: number, ratio: CameraRatio) {
  if (!Number.isFinite(containerWidth) || !Number.isFinite(containerHeight) || containerWidth < 1 || containerHeight < 1) {
    return { width: 0, height: 0 };
  }
  const aspect = ratioAspect(ratio);
  const width = Math.max(0, Math.min(containerWidth, containerHeight * aspect));
  return { width, height: aspect > 0 ? width / aspect : 0 };
}

// This viewport never grows with zoom. Native camera surfaces can paint outside
// transformed parents, so CameraCapture also masks everything outside this rect.
export function getCameraViewport(width: number, height: number, topInset: number, bottomInset: number) {
  const availableHeight = Math.max(0, height - topInset - bottomInset);
  const previewWidth = Math.max(0, Math.min(width, availableHeight * 3 / 4));
  const previewHeight = previewWidth * 4 / 3;
  return {
    width: previewWidth, height: previewHeight,
    left: (width - previewWidth) / 2,
    top: topInset + (availableHeight - previewHeight) / 2,
  };
}

export function getPhotoCrop(width: number, height: number, zoom: number, aspect: number = RATIO_VALUES['4:3']) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) throw new Error('相机图片尺寸无效。');
  if (!Number.isFinite(aspect) || aspect <= 0) throw new Error('画幅比例无效。');
  const baseWidth = Math.min(width, height * aspect);
  const baseHeight = baseWidth / aspect;
  const factor = digitalZoomFactor(zoom);
  const cropWidth = Math.max(1, Math.floor(baseWidth / factor));
  const cropHeight = Math.max(1, Math.floor(baseHeight / factor));
  return {
    originX: Math.floor((width - cropWidth) / 2), originY: Math.floor((height - cropHeight) / 2),
    width: cropWidth, height: cropHeight,
  };
}
