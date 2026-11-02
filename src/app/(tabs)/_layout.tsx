import React from 'react';
import { Tabs } from 'expo-router';
import { BottomNav } from '../../components/navigation/BottomNav';

export default function TabsLayout() {
  return <Tabs tabBar={(props) => <BottomNav {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}>
    <Tabs.Screen name="camera" options={{ title: '相机' }} />
    <Tabs.Screen name="inspiration" options={{ title: '灵感' }} />
    <Tabs.Screen name="album" options={{ title: '相册' }} />
    <Tabs.Screen name="profile" options={{ title: '我的' }} />
  </Tabs>;
}
