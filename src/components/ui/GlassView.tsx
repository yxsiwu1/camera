import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { BlurView, BlurTint } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { glass, shadows, radii } from '../../constants/theme';

export type GlassVariant = 'light' | 'card' | 'primary' | 'almond' | 'butter' | 'dark' | 'pill';

export interface GlassViewProps extends ViewProps {
  variant?: GlassVariant;
  intensity?: number;
  tint?: BlurTint;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  showSheen?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function GlassView({
  children,
  variant = 'card',
  intensity,
  tint,
  borderRadius,
  borderWidth = 1,
  borderColor,
  showSheen = true,
  style,
  contentContainerStyle,
  ...restProps
}: GlassViewProps) {
  const config = getVariantConfig(variant);
  const effectiveRadius = borderRadius ?? config.borderRadius;
  const effectiveBorderColor = borderColor ?? config.borderColor;
  const effectiveIntensity = intensity ?? config.intensity;
  const effectiveTint = tint ?? config.tint;

  return (
    <View
      {...restProps}
      style={[
        styles.outerContainer,
        config.shadow,
        { borderRadius: effectiveRadius },
        style,
      ]}
    >
      <BlurView
        intensity={effectiveIntensity}
        tint={effectiveTint}
        experimentalBlurMethod="dimezisBlurView"
        style={[
          StyleSheet.absoluteFill,
          styles.blurFill,
          {
            borderRadius: effectiveRadius,
            backgroundColor: config.fallbackBg,
          },
        ]}
      />

      {/* 渐变底色/光泽层 */}
      {config.gradientColors && (
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: effectiveRadius },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Apple 玻璃顶端微光泽高光 (Specular Top Sheen) */}
      {showSheen && variant !== 'dark' && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.7 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: effectiveRadius, maxHeight: 40 },
          ]}
          pointerEvents="none"
        />
      )}

      {/* 边缘微光描边 */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: effectiveRadius,
            borderWidth,
            borderColor: effectiveBorderColor,
          },
        ]}
      />

      {/* 内容层 */}
      <View style={[styles.content, contentContainerStyle]}>{children}</View>
    </View>
  );
}

function getVariantConfig(variant: GlassVariant): {
  tint: BlurTint;
  intensity: number;
  borderRadius: number;
  borderColor: string;
  fallbackBg: string;
  shadow: object;
  gradientColors?: [string, string, ...string[]];
} {
  switch (variant) {
    case 'primary':
      return {
        tint: 'light',
        intensity: 55,
        borderRadius: radii.full,
        borderColor: glass.primaryBorder,
        fallbackBg: glass.primaryBg,
        shadow: shadows.glassPrimaryGlow,
        gradientColors: [
          'rgba(126, 155, 178, 0.90)',
          'rgba(184, 201, 214, 0.82)',
          'rgba(243, 223, 181, 0.78)',
        ],
      };
    case 'almond':
    case 'butter':
      return {
        tint: 'light',
        intensity: 50,
        borderRadius: radii.lg,
        borderColor: glass.butterBorder,
        fallbackBg: glass.butterBg,
        shadow: shadows.glassSm,
        gradientColors: [
          'rgba(243, 223, 181, 0.45)',
          'rgba(255, 255, 255, 0.65)',
        ],
      };
    case 'dark':
      return {
        tint: 'dark',
        intensity: 65,
        borderRadius: radii.lg,
        borderColor: glass.darkBorder,
        fallbackBg: glass.darkBg,
        shadow: shadows.glassDark,
      };
    case 'pill':
      return {
        tint: 'light',
        intensity: 60,
        borderRadius: radii.full,
        borderColor: glass.pillBorder,
        fallbackBg: glass.pillBg,
        shadow: shadows.glassSm,
      };
    case 'light':
      return {
        tint: 'light',
        intensity: 45,
        borderRadius: radii.md,
        borderColor: glass.lightBorder,
        fallbackBg: glass.lightBg,
        shadow: shadows.glassSm,
      };
    case 'card':
    default:
      return {
        tint: 'light',
        intensity: 55,
        borderRadius: radii.xl,
        borderColor: glass.cardBorder,
        fallbackBg: glass.cardBg,
        shadow: shadows.glassMd,
      };
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
  },
  blurFill: {
    overflow: 'hidden',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
