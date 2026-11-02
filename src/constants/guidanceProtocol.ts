// The prompt, server response_format and runtime validator share this contract.
export const GUIDANCE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['version', 'state', 'summary', 'horizontal', 'vertical', 'tilt', 'distance', 'zoom', 'light', 'confidence', 'aimPoint', 'readyToShoot', 'route', 'camera'],
  properties: {
    version: { type: 'integer', enum: [3] },
    state: { type: 'string', enum: ['aim', 'adjust', 'ready', 'uncertain'] },
    summary: { type: 'string', minLength: 1, maxLength: 36 },
    horizontal: { type: 'string', enum: ['left', 'right', 'hold'] },
    vertical: { type: 'string', enum: ['raise', 'lower', 'hold'] },
    tilt: { type: 'string', enum: ['up', 'down', 'hold'] },
    distance: { type: 'string', enum: ['closer', 'farther', 'hold'] },
    zoom: { type: 'string', enum: ['in', 'out', 'hold'] },
    light: { type: 'string', minLength: 1, maxLength: 30 },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    aimPoint: { anyOf: [
      { type: 'object', additionalProperties: false, required: ['x', 'y'], properties: {
        x: { type: 'number', minimum: 0, maximum: 1 }, y: { type: 'number', minimum: 0, maximum: 1 },
      } },
      { type: 'null' },
    ] },
    readyToShoot: { type: 'boolean' },
    route: { type: 'object', additionalProperties: false, required: ['path', 'holdMs'], properties: {
      path: { type: 'string', enum: ['straight', 'none'] }, holdMs: { type: 'integer', enum: [800] },
    } },
    camera: { type: 'object', additionalProperties: false, required: ['zoomFactor', 'flash', 'aperture', 'contrast', 'whiteBalance'], properties: {
      zoomFactor: { anyOf: [{ type: 'number', minimum: 1, maximum: 1.9 }, { type: 'null' }] },
      flash: { type: 'string', enum: ['keep', 'off', 'on', 'auto'] },
      aperture: { anyOf: [{ type: 'number', minimum: 0.5, maximum: 32 }, { type: 'null' }] },
      contrast: { anyOf: [{ type: 'number', minimum: 0.8, maximum: 1.2 }, { type: 'null' }] },
      whiteBalance: { type: 'string', enum: ['keep', 'auto', 'daylight', 'cloudy', 'tungsten', 'fluorescent'] },
    } },
  },
} as const;

export const GUIDANCE_EXAMPLE = {
  version: 3, state: 'aim', summary: '稍向右上转动手机，对准目标圈',
  horizontal: 'hold', vertical: 'hold', tilt: 'hold', distance: 'hold', zoom: 'hold',
  light: '保持当前光线', confidence: 0.9, aimPoint: { x: 0.65, y: 0.4 }, readyToShoot: false,
  route: { path: 'straight', holdMs: 800 }, camera: { zoomFactor: null, flash: 'keep', aperture: null, contrast: null, whiteBalance: 'keep' },
} as const;
