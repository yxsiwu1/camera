import React from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

export default function RootLayout() {
  // Explicitly preload the font files bundled in assets. This keeps every
  // navigation/action icon available offline instead of relying on a remote font.
  const [fontsLoaded] = useFonts({
    ionicons: require('../../assets/fonts/Ionicons.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }} /></SafeAreaProvider>;
}
