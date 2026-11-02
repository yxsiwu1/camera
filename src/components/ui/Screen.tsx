import React from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export function Screen({ children, ...props }: ViewProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View {...props} style={[styles.content, props.style]}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    position: 'relative',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { height: '100%' as any } : {}),
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
