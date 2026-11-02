import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  dark?: boolean;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
};

export function IconButton({
  icon,
  onPress,
  dark = false,
  size = 42,
  iconSize = 20,
  style,
  color,
}: Props) {
  const borderRadius = size / 2;
  const iconColor = color ?? (dark ? colors.whiteWarm : colors.ink);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
        dark ? shadows.glassDark : shadows.glassSm,
        style,
      ]}
    >
      {({ pressed }) => (
        <View style={[styles.inner, { borderRadius }]}>
          {/* Apple 雾态毛玻璃模糊 */}
          <BlurView
            intensity={dark ? 65 : 45}
            tint={dark ? 'dark' : 'light'}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius },
            ]}
          />

          {/* 半透底色 */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                backgroundColor: dark
                  ? pressed
                    ? 'rgba(25, 45, 42, 0.75)'
                    : 'rgba(15, 40, 37, 0.52)'
                  : pressed
                  ? 'rgba(255, 255, 255, 0.88)'
                  : 'rgba(255, 255, 255, 0.62)',
              },
            ]}
          />

          {/* 玻璃顶端微光泽 (Specular Sheen) */}
          {!dark && (
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.0)']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.7 }}
              style={[
                StyleSheet.absoluteFill,
                { borderRadius, maxHeight: size * 0.55 },
              ]}
              pointerEvents="none"
            />
          )}

          {/* 边缘发光描边 */}
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                borderWidth: 1.1,
                borderColor: dark
                  ? 'rgba(255, 255, 255, 0.22)'
                  : 'rgba(255, 255, 255, 0.78)',
              },
            ]}
          />

          {/* 图标 */}
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={iconSize} color={iconColor} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'visible',
  },
  inner: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
