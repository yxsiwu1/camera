const { withInfoPlist } = require('expo/config-plugins');

/**
 * iOS hardening for Drama相机:
 * - App Store 出口合规：声明不使用非豁免加密（避免每次上传都被追问）。
 * - 删除模板默认写入、但本项目并未使用的麦克风权限说明。
 * - 统一中文权限文案（相机 / 相册读取 / 相册写入 / 运动 / Face ID）。
 */
module.exports = function withIosHardening(config) {
  return withInfoPlist(config, (cfg) => {
    const plist = cfg.modResults;

    plist.ITSAppUsesNonExemptEncryption = false;

    delete plist.NSMicrophoneUsageDescription;

    plist.NSCameraUsageDescription =
      'Drama相机需要使用相机，实时给你温柔的构图提示。';
    plist.NSPhotoLibraryUsageDescription =
      'Drama相机需要读取本地相册，方便你回看作品。';
    plist.NSPhotoLibraryAddUsageDescription =
      'Drama相机需要将你的照片保存到相册。';
    plist.NSMotionUsageDescription =
      'Drama相机需要检测手机移动，以及时更新拍摄建议。';
    plist.NSFaceIDUsageDescription =
      'Drama相机使用面容 ID 保护你保存在本机的模型 API Key。';

    return cfg;
  });
};
