import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../constants/theme';

const labels: Record<string, string> = {
  camera: 'AI 相机',
  inspiration: '灵感',
  album: '相册',
  profile: '我的',
};

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  camera: 'camera-outline',
  inspiration: 'compass-outline',
  album: 'images-outline',
  profile: 'person-outline',
};

const iconsFilled: Record<string, keyof typeof Ionicons.glyphMap> = {
  camera: 'camera',
  inspiration: 'compass',
  album: 'images',
  profile: 'person',
};

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'web' ? 12 : Math.max(insets.bottom, 10);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <View style={styles.dock} pointerEvents="auto">
        <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, styles.dockTint]} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dockBorder]} />

        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                style={({ pressed }) => [
                  styles.tabItem,
                  { transform: [{ scale: pressed ? 0.94 : 1 }] },
                ]}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
              >
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={
                      focused
                        ? iconsFilled[route.name] ?? 'ellipse'
                        : icons[route.name] ?? 'ellipse-outline'
                    }
                    size={23}
                    color={focused ? colors.primary : colors.onSurfaceVariant}
                  />
                  {focused && <View style={styles.activeDot} />}
                </View>
                <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                  {labels[route.name] ?? route.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  dock: {
    width: '100%',
    maxWidth: 448,
    borderRadius: 18,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...shadows.glassLg,
  },
  dockTint: {
    borderRadius: 18,
    backgroundColor: 'rgba(251, 249, 246, 0.88)',
  },
  dockBorder: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
    minWidth: 56,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    position: 'absolute',
    bottom: -3,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.secondaryFixedDim,
  },
  tabLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
