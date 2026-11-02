# 摄影模式提示词与研究依据

更新：2026-10-10。现有三个摄影模式分别接入独立提示词；清透、奶杏、薄荷、胶片继续作为风格偏好叠加。

完整可编辑提示词在 [photographyPrompts.ts](../src/constants/photographyPrompts.ts)，通用协议提示词在 [guidance.ts](../src/constants/guidance.ts)。每次请求只发送当前选中模式，避免其他模式的摄影目标相互干扰。

## 模式目标

| 模式 | 优先检查 | 达标依据 |
| --- | --- | --- |
| 人像 | 人物遮挡与裁切、脸部可辨识、头部背景干扰、主体大小和视线留白 | 人物自然、主要主体完整、背景不抢眼、没有必要的下一步动作 |
| 风景 | 景物完整性、视觉中心、边缘干扰、天空比例、引导线与空间层次 | 重点明确、环境关系协调、无明显干扰；不强制三分法 |
| 夜景 | 主体可见度、重要亮部与眩光、光线和倒影、持机稳定 | 保留夜间氛围，主体可辨，无明显妨碍观看的模糊；不追求消灭所有暗部或噪点 |

每份提示词都包含目标、检查顺序、构图经验、相机能力限制和结束条件。一次只选最有价值的一步；本地达标就停止，无二次请求，不为了“更专业”持续改变目标。单张缩略图无法确定的细节不能编造。

## 摄影资料与采用方式

以下内容为结合当前手机应用能力的归纳与改写，不是原文照搬，也不是这些网站对提示词效果的认证。

- [Nikon：Take Better Portraits](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/take-better-portraits)：简化背景、避免头部与背景线条重叠，让主体占据合适空间。转成“先检查主体，再消除背景干扰”的单步优先级。
- [Nikon：Quick Tips for Taking Better Portraits](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/quick-tips-for-taking-better-portraits)：关注眼睛与人像比例。应用只能判断缩略图中明显的清晰度，不下发手动对焦、光圈或镜头焦距指令。
- [Nikon：When Center Composition can Elevate a Portrait](https://www.nikonusa.com/learn-and-explore/c/tips-and-techniques/when-center-composition-can-elevate-a-portrait)：居中构图可以有效突出人物。用于约束模型不要把三分法当成所有照片的硬指标。
- [Canon SNAPSHOT：The Ultimate Cheat Sheet For Taking Landscape Photos](https://snapshot.asia.canon/en/article/the-ultimate-cheat-sheet-for-taking-landscape-photos)：明确视觉焦点、利用引导线、观察视角与人物尺度。转成根据当前可见景物整理画面的规则，不要求用户换时段或添置设备才算达标。
- [Canon：Urban photography tips](https://www.canon-emirates.ae/get-inspired/tips-and-techniques/composition-tips-urban-cityscapes/)：建筑线条、对称、留白及光线参与构图。用于风景和夜景的空间组织；当前应用未提供长曝光，不能把光轨拍摄参数照搬进协议。
- [Canon SNAPSHOT：3 Ways to Light Your Portraits When Shooting at Night](https://snapshot.asia.canon/in/en/article/3-ways-to-light-your-portraits-when-shooting-at-night-with-the-eos-r)：利用现场光源组织夜间人像。只在画面确有对应光源时提出建议，不假定画外一定有灯。
- [Amateur Photographer / Matt Parry：6 night photo tips for shooting better cityscapes](https://amateurphotographer.com/technique/expert_advice/6-night-photography-tips/)：夜间拍摄重视稳定、亮暗细节和现场准备。保留稳定拍摄建议，不自动套用长曝光、HDR合成或外部附件操作。

主体完整性、每步行动选择、停止条件和保守退回uncertain，是本项目为交互与能力边界制定的规则，不是外部教程给出的数值评分标准。夜景模式本身不代表启用了原生多帧夜景算法。

## JSON 约束

模式提示词 → 通用设备与协议规则 → 当前模式、风格、真实图片、设备参数能力。通用规则优先于模式审美建议。

响应仍为 [camera_guidance_v3](camera-guidance-protocol.md) 的单个 JSON 对象，完整机器可读模板见 [camera-guidance-v3.schema.json](camera-guidance-v3.schema.json)。HTTP响应中，该对象的序列化文本位于 `choices[0].message.content`；不能返回下载链接、Markdown代码块、文件路径或新增外层包装。

- 所有字段必填，禁止多余字段，数字与布尔值不得写成字符串。
- 四个状态固定为aim、adjust、ready、uncertain，必须符合已有跨字段校验。
- aimPoint是手机下一步对准的画面位置，不是人脸检测中心；summary必须与方向一致。
- 只允许数字变焦、闪光灯，以及设备支持的对比度、白平衡预设；光圈继续系统管理。禁止脚本、ISO、快门。
- ready时无未完成动作，summary要求为“可以拍照了”。看不清或无法可靠表达动作时保守返回uncertain。
- 提示词之外，保留请求端JSON/Schema约束、TS字段与语义校验，以及执行器的变焦幅度和镜头能力校验；不合规输出报错，不执行、不自动重试。

摄影审美与图像理解质量不能只靠Schema保证。代码回归测试检查三个模式的选择、图片与协议传递；仍需用真实人像、风景、夜景样片对实际配置的视觉模型验收。

建议真机重点检查：人像模式对准无人桌面应提示纳入人物；合格的居中人像不应被强行移到三分线；对称倒影不应被破坏；夜景不能下发ISO或长曝光；本地达标后不再请求模型。
