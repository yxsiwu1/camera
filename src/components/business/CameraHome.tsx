import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../constants/theme';
import { editorialShots } from '../../constants/data';
import { PrimaryButton } from '../ui/PrimaryButton';
import { PageHeader } from '../ui/PageHeader';

type Props = {
  permissionGranted: boolean;
  onOpenCamera: () => void;
};

export function CameraHome({ permissionGranted, onOpenCamera }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.fixedBrandHeader}>
        <PageHeader
          title="AI 电影画质"
          icon="sparkles-outline"
          onPress={() => Alert.alert('今日光影提示', '慢一点按下快门，先观察光线如何拂过被摄物的轮廓。')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ── 取景器主卡片 ── */}
        <View style={styles.heroCardWrapper}>
          <View style={styles.heroCard}>
            <View style={styles.viewfinderFrame}>
              <Image
                source={require('../../../assets/drama-mobile-feature-banner.gif')}
                style={styles.heroBanner}
                resizeMode="cover"
                accessible
                accessibilityLabel="Drama相机功能展示"
              />

              <View pointerEvents="none" style={styles.viewfinderOverlay}>
                <View style={styles.scenePill}>
                  <Ionicons name="sunny-outline" size={13} color={colors.secondary} />
                  <Text style={styles.scenePillText}>黄金时刻</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroActionArea}>
              <Text style={styles.heroKicker}>NATURAL LIGHT & COMPOSITION</Text>
              <Text style={styles.heroTitle}>
                让日常随拍，拥有电影般的<Text style={styles.heroTitleHighlight}>呼吸感</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                AI 实时机位指引 · 胶片预设色调 · 细腻光影感知
              </Text>

              <View style={styles.heroButtonWrapper}>
                <PrimaryButton
                  label={permissionGranted ? '进入取景器' : '开启相机'}
                  onPress={onOpenCamera}
                  variant="primary"
                  icon={permissionGranted ? 'camera-outline' : 'sparkles-outline'}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── 特性卡片 ── */}
        <View style={styles.featureRow}>
          <FeatureCard
            icon="compass-outline"
            title="实时指导"
            body="机位 · 焦段 · 光线"
            accent="rgba(255, 224, 142, 0.44)"
            iconColor={colors.ink}
          />
          <FeatureCard
            icon="color-palette-outline"
            title="一键风格"
            body="4 种暖调预设"
            accent={colors.surfaceContainer}
            iconColor={colors.ink}
          />
          <FeatureCard
            icon="albums-outline"
            title="本地保存"
            body="每份灵感都留住"
            accent="rgba(215, 197, 152, 0.30)"
            iconColor={colors.ink}
          />
        </View>

        {/* ── 今日光影灵感 ── */}
        <View style={styles.editorialSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="star" size={18} color={colors.secondary} />
              <Text style={styles.sectionTitle}>今日光影灵感</Text>
            </View>
            <Text style={styles.sectionSubtitle}>滑动探索构图预设</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.editorialScroll}
            decelerationRate="fast"
            snapToInterval={284}
            snapToAlignment="start"
          >
            {editorialShots.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.editorialCardWrapper,
                  { transform: [{ scale: pressed ? 0.985 : 1 }] },
                ]}
                onPress={onOpenCamera}
              >
                <View style={styles.editorialCard}>
                  <Image source={item.image} style={styles.editorialImage} />
                  <View pointerEvents="none" style={styles.cardBorderOverlay} />

                  <View style={styles.minimalGlassTag}>
                    <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={styles.tagGlassBg} />
                    <View pointerEvents="none" style={styles.tagBorder} />
                    <Text style={styles.tagTitleText}>{item.title}</Text>
                    <Text style={styles.tagMetaText}>· {item.meta}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  accent: string;
  iconColor?: string;
}) {
  return (
    <View style={styles.featureItemWrapper}>
      <View style={styles.featureItem}>
        <View style={[styles.featureIconBg, { backgroundColor: accent }]}>
          <Ionicons name={icon} size={19} color={iconColor ?? colors.ink} />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureBody}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  fixedBrandHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: 'rgba(251, 249, 246, 0.92)',
    zIndex: 100,
    borderBottomWidth: 1,
    borderColor: 'rgba(45, 42, 38, 0.04)',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
  },
  heroCardWrapper: {
    ...shadows.glassMd,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: colors.surfaceLowest,
    padding: 10,
    overflow: 'hidden',
  },
  viewfinderFrame: {
    width: '100%',
    aspectRatio: 2,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceHigh,
  },
  heroBanner: {
    width: '100%',
    height: '100%',
  },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
  },
  scenePill: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(251, 249, 246, 0.90)',
  },
  scenePillText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  heroActionArea: {
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  heroKicker: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.primary,
    fontSize: 21,
    lineHeight: 29,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginTop: 6,
  },
  heroTitleHighlight: {
    color: colors.secondary,
    fontWeight: '600',
  },
  heroSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  heroButtonWrapper: {
    width: '100%',
    marginTop: 16,
  },

  /* feature cards */
  featureRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  featureItemWrapper: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.surfaceLowest,
    ...shadows.glassSm,
  },
  featureItem: {
    flexGrow: 1,
    padding: 12,
    paddingTop: 13,
    minHeight: 112,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: -0.05,
  },
  featureBody: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
    letterSpacing: 0.2,
  },

  /* editorial */
  editorialSection: {
    marginTop: 24,
    marginHorizontal: -16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  sectionSubtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  editorialScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 14,
  },
  editorialCardWrapper: {
    width: 270,
    height: 350,
    borderRadius: 24,
    ...shadows.glassMd,
  },
  editorialCard: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceHigh,
  },
  editorialImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  minimalGlassTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    overflow: 'hidden',
    ...shadows.glassSm,
  },
  tagGlassBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 249, 246, 0.80)',
  },
  tagBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  tagTitleText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tagMetaText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 3,
  },
});
