import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Drama相机',
  slug: 'warm-lens',
  scheme: 'warm-lens',
  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
  ios: {
    ...(config.ios ?? {}),
    supportsTablet: true,
    bundleIdentifier: 'com.warmlens.app',
  },
  // @expo/config-plugins 的 mod 链是「后注册先执行」：
  // 想真正最后写入 Info.plist 的插件，必须排在这个数组的第一位。
  plugins: [
    './plugins/withIosHardening',
    'expo-router',
    'expo-secure-store',
    ['expo-sensors', { motionPermission: '允许Drama相机检测手机移动，以及时更新拍摄建议。' }],
    ['expo-camera', { cameraPermission: '允许Drama相机使用相机，实时给你温柔的构图提示。' }],
    ['expo-media-library', {
      photosPermission: '允许Drama相机读取你的相册。',
      savePhotosPermission: '允许Drama相机保存照片到相册。',
    }],
    ['expo-splash-screen', {
      image: './assets/icon.png',
      imageWidth: 168,
      resizeMode: 'contain',
      backgroundColor: '#FBF9F6',
    }],
  ],
});
