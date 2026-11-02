import React from 'react';
import { useRouter } from 'expo-router';
import { InspirationPage } from '../../components/business/InspirationPage';
import { Screen } from '../../components/ui/Screen';

export default function InspirationRoute() {
  const router = useRouter();
  return <Screen><InspirationPage onStartCamera={() => router.navigate('/camera')} /></Screen>;
}
