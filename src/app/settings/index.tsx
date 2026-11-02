import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';
import { Screen } from '../../components/ui/Screen';
import { GlassView } from '../../components/ui/GlassView';
import { PageHeader } from '../../components/ui/PageHeader';

export default function SettingsRoute() {
  return (
    <Screen style={styles.container}>
      <PageHeader title="相机设置" />
      <GlassView variant="card" style={styles.card} contentContainerStyle={styles.cardContent}>
        <Text style={styles.title}>自动参数与辅助</Text>
        <Text style={styles.body}>
          自动白平衡、构图网格与保存偏好会在这里集中管理，配合柔和光线为每次创作提供最佳建议。
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
