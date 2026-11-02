import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'almond' | 'butter' | 'dark';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  compact?: boolean;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  shimmer?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  compact = false,
  variant = 'primary',
  icon,
  style,
  labelStyle,
  disabled = false,
  shimmer = true,
}: Props) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isButter = variant === 'butter' || variant === 'almond';
  const isDark = variant === 'dark';
  const isGlass = variant === 'glass';

  // 温暖炭黑质感渐变 (#34302B -> #181612)
  const primaryGradients: [string, string, string] = [
    'rgba(52, 48, 43, 0.98)',
    'rgba(45, 42, 38, 0.98)',
    'rgba(24, 22, 18, 1)',
  ];

  // ── 从左往右发光扫光动画 ──
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  // ── 字体与图标呼吸微动效（提示用户点击） ──
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!shimmer || disabled) return;

    // 1. 从左往右扫光循环 (每隔约2.6秒自动扫过一道灵动光束)
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1700,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    // 2. 字体与图标轻柔呼吸微动循环
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.035,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerLoop.start();
    pulseLoop.start();

    return () => {
      shimmerLoop.stop();
      pulseLoop.stop();
    };
  }, [shimmer, disabled, shimmerAnim, pulseAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 260],
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.outer,
        compact && styles.compactOuter,
        style,
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.buttonWrapper,
            compact && styles.compactWrapper,
            isPrimary && styles.primaryShadow,
            (isSecondary || isGlass) && styles.glassShadow,
            isButter && styles.butterShadow,
            isDark && styles.darkShadow,
          ]}
        >
          {/* Apple 磨砂模糊层 */}
          <BlurView
            intensity={isDark ? 60 : 45}
            tint={isDark ? 'dark' : 'light'}
            style={[
              StyleSheet.absoluteFill,
              styles.blurFill,
            ]}
          />

          {/* 背景填充与微质感渐变 */}
          {isPrimary && (
            <LinearGradient
              colors={primaryGradients}
              start={{ x: 0, y: 0.2 }}
              end={{ x: 1, y: 0.8 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {isSecondary && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: pressed ? 'rgba(45, 42, 38, 0.10)' : 'rgba(45, 42, 38, 0.05)' },
              ]}
            />
          )}

          {isGlass && (
            <LinearGradient
              colors={
                pressed
                  ? ['rgba(24, 22, 18, 0.98)', 'rgba(24, 22, 18, 0.98)']
                  : ['rgba(45, 42, 38, 0.96)', 'rgba(24, 22, 18, 0.96)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {isButter && (
            <LinearGradient
              colors={['rgba(245, 235, 218, 0.92)', 'rgba(250, 240, 225, 0.85)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {isDark && (
            <LinearGradient
              colors={pressed ? ['#283642', '#1E2932'] : ['#3C4E5C', '#2E3D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Apple 玻璃微反光顶层高光 (Top Specular Sheen) */}
          <LinearGradient
            colors={
              isDark
                ? ['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.0)']
                : isGlass
                ? ['rgba(255, 255, 255, 0.78)', 'rgba(255, 255, 255, 0.08)']
                : ['rgba(255, 255, 255, 0.52)', 'rgba(255, 255, 255, 0.05)']
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.75 }}
            style={[StyleSheet.absoluteFill, styles.sheen]}
            pointerEvents="none"
          />

          {/* ── 从左往右发光扫光条 (Left-to-Right Shimmer Beam) ── */}
          {shimmer && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmerBeam,
                {
                  transform: [{ translateX }, { skewX: '-22deg' }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.0)',
                  'rgba(255, 255, 255, 0.35)',
                  'rgba(255, 255, 255, 0.85)',
                  'rgba(255, 255, 255, 0.35)',
                  'rgba(255, 255, 255, 0.0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}

          {/* 雾态玻璃反光描边 (Crisp Glass Edge) */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.edgeBorder,
              {
                borderColor: isDark
                  ? 'rgba(255, 255, 255, 0.28)'
                  : isGlass
                  ? 'rgba(255, 255, 255, 0.96)'
                  : isPrimary
                  ? 'rgba(255, 255, 255, 0.85)'
                  : isButter
                  ? 'rgba(255, 255, 255, 0.88)'
                  : 'rgba(255, 255, 255, 0.75)',
              },
            ]}
          />

          {/* ── 按钮内容（带发光与轻柔呼吸微动效） ── */}
          <Animated.View
            style={[
              styles.contentRow,
              isGlass && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator
                color={isSecondary ? colors.primary : colors.whiteWarm}
                size="small"
              />
            ) : (
              <>
                {icon && (
                  <Ionicons
                    name={icon}
                    size={compact ? 16 : 18}
                    color={
                      isSecondary || isButter
                        ? colors.ink
                        : colors.whiteWarm
                    }
                    style={styles.icon}
                  />
                )}
                <Text
                  style={[
                    styles.text,
                    compact && styles.compactText,
                    isSecondary && styles.secondaryText,
                    isGlass && styles.glassGlowText,
                    isButter && styles.butterText,
                    isDark && styles.darkText,
                    labelStyle,
                  ]}
                >
                  {label}
                </Text>
              </>
            )}
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 28,
  },
  compactOuter: {
    borderRadius: 23,
  },
  buttonWrapper: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactWrapper: {
    height: 46,
    borderRadius: 23,
  },
  blurFill: {
    borderRadius: 26,
  },
  sheen: {
    maxHeight: 26,
  },
  edgeBorder: {
    borderRadius: 26,
    borderWidth: 1.2,
  },
  shimmerBeam: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 120,
    zIndex: 2,
  },
  primaryShadow: {
    ...shadows.glassPrimaryGlow,
  },
  glassShadow: {
    ...shadows.glassSm,
  },
  butterShadow: {
    shadowColor: '#E2CB96',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  darkShadow: {
    ...shadows.glassDark,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 3,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: colors.whiteWarm,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  compactText: {
    fontSize: 14,
  },
  secondaryText: {
    color: colors.ink,
  },
  glassGlowText: {
    color: colors.whiteWarm,
    textShadowColor: 'rgba(255, 255, 255, 0.50)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  butterText: {
    color: colors.ink,
  },
  darkText: {
    color: colors.whiteWarm,
  },
});
