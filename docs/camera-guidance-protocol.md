# 单次构图指导协议 v3

流程：**提交一次画面 → TS执行支持的相机参数 → 沿虚线对准 → 前端停稳800ms判定完成 → 显示可拍效果。到位后不请求后端。**

重新规划、更换镜头、拍摄模式或风格是显式的新请求。成功、失败、超时、本地到位和离开目标都不会自行联网。没有模型二次复核。

## 固定 JSON

响应是 `choices[0].message.content` 中的JSON对象文本。全部字段必填，不允许额外字段或Markdown。完整约束由 [camera-guidance-v3.schema.json](camera-guidance-v3.schema.json) 定义。提示词、请求和TS校验共用 `src/constants/guidanceProtocol.ts`。

```json
{
  "version": 3,
  "state": "aim",
  "summary": "稍向右上转动手机，对准目标圈",
  "horizontal": "hold",
  "vertical": "hold",
  "tilt": "hold",
  "distance": "hold",
  "zoom": "hold",
  "light": "保持当前光线",
  "confidence": 0.9,
  "aimPoint": { "x": 0.65, "y": 0.4 },
  "readyToShoot": false,
  "route": { "path": "straight", "holdMs": 800 },
  "camera": {
    "zoomFactor": null,
    "flash": "keep",
    "aperture": null,
    "contrast": null,
    "whiteBalance": "keep"
  }
}
```

| 字段 | 规则 |
| --- | --- |
| version | 固定3；拒绝旧版2 |
| state | aim / adjust / ready / uncertain |
| aimPoint | 当前非镜像3:4图片中的新取景中心，x/y均在0–1；不是人脸检测中心 |
| route | aim用straight，其他用none；holdMs固定800 |
| zoomFactor | null保留；绝对数字倍率1–1.9，每步相对当前不超过0.3 |
| flash | keep/off/on/auto；前置仅keep/off，拍照时生效 |
| aperture | null保留镜头/自动曝光管理；当前原生实现不提供可写光圈，能力列表为空 |
| contrast | null保留；0.8–1.2的保守色调曲线系数，仅设备报告支持时允许 |
| whiteBalance | keep保留，或设备支持列表中的auto/daylight/cloudy/tungsten/fluorescent |
| horizontal/vertical/tilt/distance | 平移、升降、俯仰、远近指令，hold表示无需调整；用户手动确认，不伪装成传感器测距 |
| confidence | 判断可靠性0–1；指导至少0.6，设置参数或ready至少0.8 |
| summary/light | 1–36字指导 / 1–30字光线建议，显示在取景框外 |

`aim`必须有终点且方向枚举全hold；`adjust`必须无终点且至少一项动作/参数变更；`ready`必须中心对准、所有动作与参数不变、readyToShoot=true；`uncertain`必须低置信度、无终点无动作且不可拍。前三种执行路径完成后均可本地就绪，uncertain绝不能通过点击确认或等待变为可拍。

模型ready表示原画面已合格；客户端仍等待停稳。模型aim/adjust的readyToShoot=false表示本轮动作尚未完成，前端完成后本地可拍，无需让模型再次返回true。

## 本地执行

- `GuidanceLoop`只处理明确触发的单次分析，已移除到位复核入口。
- `GuidanceExecution.finishIfStable()`要求参数完成、目标入圈、800ms连续稳定，再进入ready；再次移动撤回ready，重新入圈停稳可以再次ready，全程无网络请求。
- 无陀螺仪或纯平移/远近动作显示“已调整，确认到位”，这是用户手动确认。普通aim可自动完成；uncertain仅能改善画面后显式重新规划。
- 原生设置等待完成回执，最多5秒，失败/超时不亮可拍特效。关闭指导、换镜头或后台会使旧回调失效。新请求取样前清除上一轮原生覆盖设置。
- 变焦使用统一数字裁剪，预览、样本与最终照片一致。闪光灯仍由Expo Camera控制。
- 模型请求最多45秒，10/25秒等待提示为本地UI。取样超过10秒拒绝，网络照片超过60秒拒绝；已接受方案不按时间消失。

## Android参数模块

本地Expo模块位于 `modules/camera-tuning`，复用当前Expo Camera的CameraX会话，读取设备能力，并通过Camera2 interop设置白平衡预设与色调曲线，应用于相机会话。无第二个相机实例，不修改node_modules。

光圈保留硬件/系统控制：Android在自动曝光开启时会覆盖手动光圈，本版本保持自动曝光，不切换到手动快门和ISO。因此apertures始终为空，模型必须返回aperture=null。不支持色调曲线的机型同样返回contrast=null。

接口依据：[Android CaptureRequest](https://developer.android.com/reference/android/hardware/camera2/CaptureRequest#LENS_APERTURE)、[Camera2CameraControl](https://developer.android.com/reference/androidx/camera/camera2/interop/Camera2CameraControl)、[Expo本地模块](https://docs.expo.dev/modules/get-started/)。

**必须重新构建Android开发包或APK**；Expo Go和旧APK不含这个原生模块，会明确显示当前安装包不支持手动参数，使用系统色彩。JS更新不能把原生模块安装到已有APK。

## 可拍特效与限制

- 薄荷绿四角框、中心呼吸环、快门光圈与薄荷绿快门、框外大字“可以拍照了”和一次短振动。
- 不在图像上放实心提示卡；减少动态效果的系统设置会关闭呼吸动画。
- 固定提示区高度，避免可拍状态使取景区域跳动。
- 陀螺仪只估计短时角运动，使用约60°水平视角，不是视觉特征追踪或厘米级定位。没有后端复核后，不保证检测主体自行移动、光线变化或长时漂移；可拍表示原方案的本地执行条件达成。

## 验证

自动测试覆盖单次请求、本地对准、离开撤回再入圈、参数等待/失败/取消、无传感器手动确认、uncertain不误报、设备能力校验和镜头切换。

本环境没有Android SDK/真机，尚未编译原生模块或验证厂商ISP对色调曲线的实际表现。Expo autolinking已确认识别模块；需要在Android构建和真机中验证预览/成片色彩、前后镜头能力、失败回执和运动方向。
