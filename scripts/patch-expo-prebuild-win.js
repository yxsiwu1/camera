#!/usr/bin/env node
/**
 * Allow `npx expo prebuild -p ios` to run on Windows.
 *
 * @expo/cli hard-skips iOS prebuild when process.platform === 'win32'
 * (node_modules/@expo/cli/build/src/prebuild/resolveOptions.js -> ensureValidPlatforms).
 * The generation itself is pure JS (template copy + config plugins + pbxproj edit),
 * CocoaPods is the only macOS-only step and it is skipped with --no-install.
 *
 * Idempotent: safe to run after every `npm install`.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'prebuild',
  'resolveOptions.js'
);

if (!fs.existsSync(target)) {
  console.error('[patch] resolveOptions.js not found, run npm install first');
  process.exit(1);
}

const original = fs.readFileSync(target, 'utf8');
const needle = `    if (process.platform === "win32" && platforms.includes("ios")) {`;
const patched = original.replace(
  needle,
  `    if (false && process.platform === "win32" && platforms.includes("ios")) {`
);

if (original !== patched) {
  fs.writeFileSync(target, patched, 'utf8');
  console.log('[patch] iOS prebuild allowed on win32 (resolveOptions.js)');
} else if (patched === original && original.includes('if (false && process.platform === "win32"')) {
  console.log('[patch] already applied');
} else {
  console.error('[patch] pattern not matched - check @expo/cli version');
  process.exit(2);
}
