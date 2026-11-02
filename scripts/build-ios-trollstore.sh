#!/usr/bin/env bash
# 产出 TrollStore（巨魔）可直接安装的 ipa。
#   · 设备架构：arm64（iphoneos）
#   · 不需要 Apple 账号、不需要描述文件、不需要签名证书：用 ldid 做 ad-hoc 签名
#     （iOS 内核要求可执行文件至少带 LC_CODE_SIGNATURE，完全没签名的 Mach-O 会被 amfi 杀掉，
#      所以 xcodebuild 的 CODE_SIGNING_ALLOWED=NO 产物必须先 ad-hoc 签一遍才能被巨魔装上运行）
#   · 最低系统版本取 ios/Drama/Info.plist 的 MinimumOSVersion（当前 15.1），iOS 15.1–18 都能跑
#
# 用法： bash scripts/build-ios-trollstore.sh [输出 ipa 路径]
# 依赖： macOS + Xcode + CocoaPods + ldid（brew install ldid）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

APP_NAME="Drama"
SCHEME="Drama"
CONFIG="Release"
WORKSPACE="$ROOT/ios/$APP_NAME.xcworkspace"
ENT="$ROOT/trollstore/entitlements.plist"
OUT="${1:-$ROOT/build/Drama-trollstore.ipa}"

need() { command -v "$1" >/dev/null 2>&1 || { echo "缺少依赖：$1"; exit 1; }; }
need xcodebuild
need ldid

[ -d "$WORKSPACE" ] || { echo "找不到 $WORKSPACE，先跑：npm run prebuild:ios && (cd ios && pod install)"; exit 1; }
[ -f "$ENT" ] || { echo "找不到 entitlements：$ENT"; exit 1; }

DERIVED="$ROOT/build/trollstore-derived"
rm -rf "$DERIVED"
mkdir -p "$(dirname "$OUT")"

echo "==> xcodebuild（$CONFIG / iphoneos / 不签名）"
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIG" \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$DERIVED" \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGN_IDENTITY="" \
  build

APP="$DERIVED/Build/Products/${CONFIG}-iphoneos/${APP_NAME}.app"
[ -d "$APP" ] || { echo "构建产物缺失：$APP"; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp -R "$APP" "$WORK/$APP_NAME.app"
STAGE="$WORK/$APP_NAME.app"
rm -rf "$STAGE/_CodeSignature"

EXEC_NAME="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$STAGE/Info.plist")"
MAIN_BIN="$STAGE/$EXEC_NAME"
[ -f "$MAIN_BIN" ] || { echo "找不到主可执行文件：$MAIN_BIN"; exit 1; }

echo "==> ad-hoc 签名嵌套二进制（frameworks / dylibs / appex）"
count=0
while IFS= read -r -d '' f; do
  [ "$f" = "$MAIN_BIN" ] && continue
  if file -b "$f" 2>/dev/null | grep -q 'Mach-O'; then
    ldid -S "$f"
    count=$((count + 1))
  fi
done < <(find "$STAGE" -type f -print0)
echo "    已签名：$count 个"

echo "==> ad-hoc 签名主程序（带 Keychain entitlements）"
ldid -S"$ENT" "$MAIN_BIN"
ldid -e "$MAIN_BIN"

echo "==> 校验"
sig_count="$(otool -l "$MAIN_BIN" | grep -c 'LC_CODE_SIGNATURE' || true)"
[ "$sig_count" -ge 1 ] || { echo "主程序缺少 LC_CODE_SIGNATURE，签名失败"; exit 1; }
archs="$(lipo -archs "$MAIN_BIN")"
echo "    主程序架构：$archs"
echo "    最低系统：$(/usr/libexec/PlistBuddy -c 'Print :MinimumOSVersion' "$STAGE/Info.plist" 2>/dev/null || echo '未知')"

echo "==> 打包 ipa"
mkdir -p "$WORK/Payload"
mv "$STAGE" "$WORK/Payload/$APP_NAME.app"
rm -f "$OUT"
( cd "$WORK" && zip -qry "$OUT" Payload )

echo "==> 完成：$OUT"
ls -lh "$OUT"
echo "    安装：把 ipa 传到 iPhone（隔空投送 / iCloud 云盘 / Filza），用 TrollStore 打开 → Install"
