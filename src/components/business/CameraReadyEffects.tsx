import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/theme';

function useReadyPulse(active: boolean) {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduceMotion(value); }).catch(() => undefined);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { alive = false; listener.remove(); };
  }, []);
  useEffect(() => {
    pulse.setValue(0);
    if (!active || reduceMotion) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
      Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true, isInteraction: false }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [active, reduceMotion, pulse]);
  return pulse;
}

// Only thin strokes inside the viewfinder: no filled panels over the photograph.
export function CameraReadyFrame({ active, width, height }: { active: boolean; width: number; height: number }) {
  const pulse = useReadyPulse(active);
  if (!active) return null;
  return <View testID="camera-ready-frame" pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) }]}>
      {(['tl', 'tr', 'bl', 'br'] as const).map(corner => <View key={corner} style={[styles.corner, styles[corner]]} />)}
    </Animated.View>
    <Animated.View style={[styles.lockRing, { left: width / 2 - 25, top: height / 2 - 25,
      opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0.15] }),
      transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
    }]} />
  </View>;
}

export function CameraReadyNotice({ active, message, action }: { active: boolean; message: string; action?: React.ReactNode }) {
  useEffect(() => { if (active) Vibration.vibrate(25); }, [active]);
  return <View style={styles.banner}>
    {active ? (
      <View testID="camera-ready-notice" accessible accessibilityLabel="可以拍照了，已完成本地对准" accessibilityLiveRegion="polite" style={styles.bannerInner}>
        <View style={styles.check}>
          <Ionicons name="checkmark" size={17} color={colors.primary} />
        </View>
        <View style={styles.bannerTextBlock}>
          <Text style={styles.readyTitle}>可以拍照了</Text>
          <Text style={styles.readyDetail} numberOfLines={1}>构图已对准 · 按下快门定格</Text>
        </View>
        {action ? <View style={styles.actionSlot}>{action}</View> : null}
      </View>
    ) : (
      <View style={styles.bannerInner}>
        <View style={styles.bulb}>
          <Ionicons name="bulb-outline" size={15} color={colors.onSecondaryContainer} />
        </View>
        <Text accessibilityLiveRegion="polite" style={styles.message} numberOfLines={2}>{message}</Text>
        {action ? <View style={styles.actionSlot}>{action}</View> : null}
      </View>
    )}
  </View>;
}

export function CameraShutterHalo({ active }: { active: boolean }) {
  const pulse = useReadyPulse(active);
  if (!active) return null;
  return <Animated.View pointerEvents="none" style={[styles.shutterHalo, {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.8] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
  }]} />;
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(251, 249, 246, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    ...shadows.glassMd,
  },
  bannerInner: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 7,
  },
  bulb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(254, 221, 132, 0.78)',
    flexShrink: 0,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondaryFixed,
    flexShrink: 0,
  },
  bannerTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  message: {
    flex: 1,
    color: colors.primary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
  readyTitle: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  readyDetail: {
    color: colors.onSurfaceVariant,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  actionSlot: {
    flexShrink: 0,
  },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: colors.secondaryFixed, shadowColor: colors.secondaryFixedDim, shadowOpacity: 0.7, shadowRadius: 6 },
  tl: { top: 3, left: 3, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  tr: { top: 3, right: 3, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  bl: { bottom: 3, left: 3, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  br: { bottom: 3, right: 3, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  lockRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: colors.secondaryFixed },
  shutterHalo: { position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 1.5, borderColor: colors.secondaryFixed },
});
