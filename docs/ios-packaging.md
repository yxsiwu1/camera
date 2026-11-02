# Drama相机 · iOS 打包说明（TrollStore / 巨魔 免签名方案优先）

> 结论先说：**iOS 的 `.ipa` 只能在 macOS 上编译**（`xcodebuild` 属于 Xcode）。
> 本机 Windows 已经把原生 iOS 工程、iOS 配置、CI 出包流水线全部做好并验证，
> 你要的「**不签名 + 巨魔安装 + iOS 16**」已经做成默认流水线：
> **推 GitHub → Actions → 下载 `Drama-trollstore.ipa` → TrollStore 点 Install**，全程不碰 Apple 账号。

| 路线 | 需要什么 | 产出 | 说明 |
| :-- | :-- | :-- | :-- |
| **A. TrollStore（巨魔）** ← 默认 | GitHub 仓库 | `Drama-trollstore.ipa`（ldid ad-hoc 签名） | 免签名、永久有效、不 7 天掉证书 |
| B. EAS 云构建 | Expo 账号 | 模拟器包 / App Store 包 | 要上架才用 |
| C. 本地 Mac | macOS + Xcode | 调试直装 / Archive | 长期维护 |

## ✅ 已经构建完成（2026-11-02）

- 流水线：<https://github.com/yxsiwu1/camera/actions/runs/41417163509>（SUCCESS，Xcode 15.4，约 10 分钟）
- 现成 ipa：<https://github.com/yxsiwu1/camera/releases/download/ios-1.3.0/Drama-trollstore.ipa>（16.58 MB）
- 发布页：<https://github.com/yxsiwu1/camera/releases/tag/ios-1.3.0>
- 产物实测：主程序 `arm64`、`LC_CODE_SIGNATURE` 存在、`CSMAGIC_EMBEDDED_SIGNATURE` 存在、
  entitlements 含 `keychain-access-groups` / `application-identifier`、
  `hermes.framework` 已签名、`Info.plist` 的 `MinimumOSVersion = 15.1`、无 `NSMicrophoneUsageDescription`。
- 手机上直接点上面那条 ipa 链接下载 → 用 TrollStore 打开 → Install。

## 🔧 v1.3.1：修掉「快门按不动 / 参数不能微调 / 比例不能调」

1.3.0 那版在 iOS 上三个症状其实是同一个根因 + 一个缺失功能：

| 症状 | 根因 | 修法 |
| :-- | :-- | :-- |
| 拍摄按钮按不动 | 快门 `disabled` 绑在 `guide.ready` 上，而 `ready` 只由 expo-camera 的 `onCameraReady` 回调置位；iOS 上 `startSession()` 里若相机权限判定时机晚于首帧（或权限刚授予就挂载），回调就不来，`ready` 永远 false → 快门永久禁用（`capture()` 内部还有一层 `!readyRef.current` 直接 return） | 快门改绑新的 `canCapture`（只要 `active && !capturing && !adjustingParameters` 就能按）；`capture()` 去掉 `ready` 硬门控，改为「相机没挂载才提示」；再补一个 1600ms 兜底：过了时间还没收到 `onCameraReady` 且没有 `onMountError`，就当已就绪 |
| 相机参数无法微调 | 「微调」按钮和面板共用 `blocked`，而 `blocked` 里含 `!guide.ready`，同样被卡死；另外 iOS 侧本来没有 `camera-tuning` 原生模块，`capabilities.native = false`，白平衡/对比度全被判定为不可用 | `blocked` 去掉 `ready`/`sampling`；新增 iOS 原生模块 `modules/camera-tuning/ios/CameraTuningModule.swift`（白平衡 daylight/cloudy/tungsten/fluorescent + auto，走 `AVCaptureDevice` 的锁白平衡增益），`expo-module.config.json` 加 `ios` 平台 |
| 比例无法调整 | 源码里根本没有比例 UI，取景框和裁切都写死 3:4；`<CameraView ratio="4:3">` 在 iOS 端 expo-camera 根本不实现（死 prop） | 新增「画幅」行：`4:3 / 16:9 / 1:1`；取景框按比例做信箱化（`frameSize()` 计算框内尺寸并居中），拍照裁切按同一比例走 `getPhotoCrop(w,h,zoom,aspect)`，AI 提示词里也带上画幅 |

另外：相机权限改用 `useCameraPermissions()` 显式请求，授予后通过 `cameraKey` 重挂 `CameraView`，避免「权限弹窗与挂载竞态」；
取景页长按左上角标题可弹出「相机诊断」（平台 / 权限 / active·ready·capturing / mountError / 画幅 / 能力 JSON），实机再出问题直接截图回报即可。

App 身份（已写死，可按需改）：

| 项 | 值 |
| :-- | :-- |
| 显示名 | `Drama相机` |
| Bundle ID | `com.warmlens.app` |
| URL Scheme | `warm-lens` |
| 版本 / 构建号 | `1.3.1` / `2` |
| 最低系统 | iOS 15.1（**所以 iOS 16 全系可装可跑**） |
| 架构 | arm64 |
| 设备 | iPhone + iPad（`TARGETED_DEVICE_FAMILY = 1,2`） |
| Xcode 工程 | `ios/Drama.xcodeproj`（已生成）；`ios/Drama.xcworkspace` 由 `pod install` 产出，打开用后者，scheme `Drama` |

---

## 1. 巨魔 TrollStore 方案（推荐）

### 1.1 版本前提

| 项 | 要求 |
| :-- | :-- |
| TrollStore 支持的系统 | iOS **14.0 – 16.6.1**、17.0（`arm64` / `arm64e`） |
| 你的场景 | iOS 16.x → 只要 **≤ 16.6.1** 就能装；16.7 / 16.7.1 不在 CoreTrust 漏洞范围，装不了（也降不回去） |
| App 最低系统 | 15.1 → iOS 16 上正常安装运行 |
| 编译 SDK | CI 固定 **Xcode 15.4 / iOS 17.5 SDK**，产物对 iOS 16 真机最稳（避开 iOS 18 SDK 新符号） |

### 1.2 出包（Windows 上可完成，需要 GitHub 账号）

```bash
cd G:\工作区\拍照\Drama
git init && git add -A && git commit -m "ios: trollstore build pipeline"
git remote add origin https://github.com/<你的账号>/Drama.git
git push -u origin main
```

→ GitHub 网页 **Actions → iOS Build → Run workflow** → `artifact` 保持默认 `trollstore` → 等待约 15–25 分钟
→ 下载 artifact **`Drama-trollstore-ipa`**，解压得到 `Drama-trollstore.ipa`。

流水线做的事：

```
npm ci → expo prebuild -p ios → pod install → brew install ldid
      → xcodebuild -sdk iphoneos CODE_SIGNING_ALLOWED=NO
      → ldid -S 逐个签 Frameworks/*.framework、*.dylib、PlugIns/*.appex
      → ldid -S<trollstore/entitlements.plist> 签主程序（注入 Keychain 权限）
      → 校验 LC_CODE_SIGNATURE / 架构 / MinimumOSVersion
      → Payload/Drama.app → zip → Drama-trollstore.ipa
```

### 1.3 装到 iPhone

1. 把 `Drama-trollstore.ipa` 传到手机：隔空投送 / iCloud 云盘 / 微信文件 / Filza 都行；
2. 在「文件」里点 ipa → 分享 → **TrollStore**（或直接 TrollStore → `+` → 选 ipa）；
3. TrollStore 弹窗点 **Install**，几秒后桌面出现「Drama相机」；
4. 首次打开允许相机、相册权限。

> 不需要电脑、不需要信任证书、**重启不掉、永不过期**。
> 覆盖升级：重新出包（记得把 `app.json` 的 `ios.buildNumber` 加 1），在 TrollStore 里对同一个 App 再 Install 一次即覆盖，数据保留。

### 1.4 为什么还要 ldid 签一下（关键，别省）

- iOS 内核（amfi）要求可执行文件至少带 `LC_CODE_SIGNATURE`，**完全没有签名的 Mach-O 会被直接杀掉**（表现为装上了点开闪退）。
- TrollStore 的 CoreTrust 漏洞只是**跳过描述文件与证书校验**，它不会替你签名。
- 所以 `CODE_SIGNING_ALLOWED=NO` 的产物必须用 `ldid -S` 做 **ad-hoc 伪签名**，TrollStore 才认。
- 更进一步：`src/lib/aiSecrets.ts:10-11` 用 `expo-secure-store` 存模型 API Key
  （`SecureStore.setItemAsync(... keychainAccessible: WHEN_UNLOCKED_THIS_DEVICE_ONLY)`），
  Keychain 需要 **`keychain-access-groups` entitlement**，否则写入直接报 `-34018 errSecMissingEntitlement`。
  已写进 `trollstore/entitlements.plist`（`application-identifier` + `keychain-access-groups` = `com.warmlens.app`）。

### 1.5 不想用 GitHub？本机/任意 Mac 一条命令

```bash
npm ci
npm run prebuild:ios
cd ios && pod install && cd ..
brew install ldid
bash scripts/build-ios-trollstore.sh            # 产物 build/Drama-trollstore.ipa
```

脚本会打印签名数量、主程序架构、`MinimumOSVersion`，任何一步不对直接报错退出。

---

## 2. 路线 B：EAS 云构建（要上架时才用）

```bash
npm i -g eas-cli          # 不要装进项目依赖，expo-doctor 会报错
eas login
eas init                 # 绑定你自己的 Expo 项目，写回新的 projectId
eas build -p ios --profile production
eas submit -p ios --profile production
```

- `preview-simulator` → `.tar.gz` 里的 `Drama.app`，**只能装进 Mac 模拟器**；
- `preview`（真机 ad-hoc）需要 `eas device:create` 收集 UDID + **付费开发者账号（99 美元/年）**；
- 免签名场景不用 EAS，走上面的 TrollStore。

---

## 3. 路线 C：本地 Mac 调试

```bash
npm ci && npm run prebuild:ios && (cd ios && pod install)
npx expo run:ios --device      # 真机调试（此时会真签名，需要 Xcode 里选 Team）
```

---

## 4. Windows 上已经做完/验证过的事

1. `ios/` 原生工程已生成：`Drama.xcodeproj`、`Podfile`、`AppDelegate.mm`、`Info.plist`、`Images.xcassets`、`SplashScreen.storyboard`、`Drama.entitlements`（共 25 个文件）。缺的只有 `pod install` 之后才有的 `Pods/` + `Drama.xcworkspace`（CocoaPods 仅 macOS 有）。
2. 修掉 Expo CLI 的 Windows 限制（`@expo/cli` 硬编码 win32 跳过 iOS）：`scripts/patch-expo-prebuild-win.js`。
3. iOS 加固插件 `plugins/withIosHardening.js`：`ITSAppUsesNonExemptEncryption=false`、删除多余的 `NSMicrophoneUsageDescription`、相机/相册/运动/面容 ID 中文文案。
   - **坑**：`@expo/config-plugins` 的 mod 链是「后注册先执行」，该插件必须排在 `plugins` 数组**第一位**才真正落地。
4. 启动屏：`expo-splash-screen`，米白 `#FBF9F6` + 168pt 图标（`SplashScreen.storyboard` 已生成）。
5. 图标：`AppIcon.appiconset` 内 PNG 为 RGB 无 alpha。
6. Info.plist 实测（已读文件核对）：`CFBundleDisplayName=Drama相机`、`CFBundleShortVersionString=1.3.0`、`CFBundleVersion=1`、`ITSAppUsesNonExemptEncryption=false`、无 `NSMicrophone`、ATS `NSAllowsArbitraryLoads=false`。
7. 已移除上游 `owner` / `extra.eas.projectId`（那是作者 tommycui 的项目）。
8. 出包流水线：`.github/workflows/ios-build.yml`（Xcode 15.4 + ldid + TrollStore ipa / 模拟器 app）。
9. 验证：`expo-doctor` 18/18、`tsc --noEmit` 0 错误、`expo export -p ios` 产出 Hermes 字节码约 3.2 MB、`npm ci --dry-run` 与 lock 一致。

---

## 5. iOS 与 Android 的功能差异（代码已降级，不是 bug）

| 能力 | Android | iOS（含 TrollStore 安装） |
| :-- | :-- | :-- |
| 相机参数微调（光圈/对比度/白平衡） | 自研原生模块 `modules/camera-tuning` | **不可用**：iOS 不允许改这些硬件参数；`readCameraCapabilities` 返回 `native:false`，界面提示「系统色彩 · 当前安装包不支持手动参数」 |
| APK 自更新 | `modules/app-installer` | **不可用**：`Platform.OS === 'android'` 才加载；TrollStore 版更新靠重装新 ipa |
| 拍照 / 数字变焦 / 闪光灯 / 存相册 | 支持 | 支持 |
| 构图引导 / AI 建议 / Keychain 存 Key | 支持 | 支持（Key 存 Keychain，需 1.4 的 entitlements） |

两个原生模块的 `expo-module.config.json` 只声明 `platforms: ["android"]`，iOS 不会 autolink，`requireOptionalNativeModule` 返回 `null`，不会崩。

---

## 6. 常见问题

| 现象 | 处理 |
| :-- | :-- |
| TrollStore 报 `The app is not signed` / 装好点开闪退 | ipa 里的 Mach-O 没签：确认走的是 `scripts/build-ios-trollstore.sh`（`ldid`），不是裸的 `CODE_SIGNING_ALLOWED=NO` 产物 |
| 保存 API Key 失败 / 提示 `-34018` | `trollstore/entitlements.plist` 没注入，检查脚本里 `ldid -S"$ENT" "$MAIN_BIN"` 那段 |
| TrollStore 覆盖安装被拒 | `app.json` 的 `ios.buildNumber`（`CFBundleVersion`）必须比已装的大 |
| iOS 16.7+ 装不了 TrollStore | CoreTrust 漏洞不覆盖，改走 Sideloadly + 免费 Apple ID（7 天重签）或付费账号 |
| `At least one platform must be enabled when syncing` | Windows 上没打补丁：`node scripts/patch-expo-prebuild-win.js` |
| `pod install` 超时 / CDN 失败 | `cd ios && pod install --repo-update` |
| 自建 API 地址连不上 | ATS 只放行 HTTPS（`NSAllowsArbitraryLoads=false`）；本地调试走 `NSAllowsLocalNetworking`（已开） |
| `expo-doctor` 报 `@expo/config-plugins` 冲突 | 别把 `eas-cli` 装进 devDependencies（已移除） |

---

## 7. 自检命令

```bash
node scripts/patch-expo-prebuild-win.js   # 仅 Windows 需要
npm run prebuild:ios                      # 重新生成 ios/
npm run bundle:ios                        # 验证 iOS JS bundle（Hermes .hbc）
npm run typecheck                         # tsc --noEmit
npx expo-doctor                           # 18 项体检
```
