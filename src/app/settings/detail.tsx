import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { PageHeader } from '../../components/ui/PageHeader';

export default function SettingsDetailRoute() {
  return (
    <Screen style={styles.container}>
      <PageHeader title="参数说明" />
      <GlassView variant="card" style={styles.card} contentContainerStyle={styles.cardContent}>
        <Text style={styles.title}>自动测光与光影算法</Text>
        <Text style={styles.body}>
          Drama相机会根据当前风格和画面光线，给出快门、ISO 与白平衡的柔和建议。
        </Text>
      </GlassView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    marginTop: 20,
  },
  cardContent: {
    padding: 22,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 12,
    fontSize: 14,
  },
});
