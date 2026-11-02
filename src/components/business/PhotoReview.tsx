import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, shadows } from '../../constants/theme';
import { IconButton } from '../ui/IconButton';
import { PrimaryButton } from '../ui/PrimaryButton';

type Props = { uri: string; onRetake: () => void; onSave: () => void; saving: boolean };

export function PhotoReview({ uri, onRetake, onSave, saving }: Props) {
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <IconButton icon="chevron-back" onPress={saving ? undefined : onRetake} />
        <Text style={styles.headerTitle}>拍摄完成</Text>
        <IconButton icon="ellipsis-horizontal" onPress={() => undefined} />
      </View>

      <View style={styles.imageWrap}>
        <Image source={{ uri }} style={styles.image} />
        <LinearGradient
          colors={['transparent', 'rgba(20,30,38,0.2)']}
          style={styles.imageOverlay}
          pointerEvents="none"
        />
        <View pointerEvents="none" style={styles.imageBorder} />
      </View>

      {/* Apple 雾态卡片 */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          <BlurView
            intensity={65}
            tint="light"
            style={[
              StyleSheet.absoluteFill,
              styles.blurLayer,
            ]}
          />
          <View style={[StyleSheet.absoluteFill, styles.cardBg]} />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={[StyleSheet.absoluteFill, styles.sheen]}
            pointerEvents="none"
          />
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.cardBorder]} />

          <View style={styles.cardContent}>
            <View style={styles.score}>
              <View style={styles.checkWrapper}>
                <LinearGradient
                  colors={[colors.primary, colors.mistBlue]}
                  style={styles.check}
                >
                  <Ionicons name="checkmark" size={17} color={colors.whiteWarm} />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.scoreTitle}>照片已拍摄</Text>
                <Text style={styles.meta}>原图预览 · 相机自动参数</Text>
              </View>
            </View>

            <Text style={styles.note}>保存到相册后将自动继续拍摄，也可以重拍一次。</Text>

            <View style={styles.actions}>
              {/* 重拍：雾态玻璃按钮 */}
              <View style={styles.retakeButton}>
                <PrimaryButton
                  label="重拍"
                  onPress={onRetake}
                  disabled={saving}
                  variant="glass"
                  compact
                  icon="refresh-outline"
                />
              </View>

              {/* 保存：雾态玻璃主按钮 */}
              <View style={styles.saveButton}>
                <PrimaryButton
                  label="保存到相册"
                  onPress={onSave}
                  loading={saving}
                  variant="primary"
                  compact
                  icon="download-outline"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    color: colors.ink,
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '600',
  },
  imageWrap: {
    width: '100%',
    height: '56%',
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: colors.paleMist,
    position: 'relative',
    ...shadows.glassMd,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  imageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.75)',
  },
  cardWrapper: {
    marginTop: -20,
    borderRadius: 26,
    ...shadows.glassMd,
  },
  card: {
    borderRadius: 26,
    position: 'relative',
    overflow: 'hidden',
    padding: 20,
  },
  blurLayer: {
    borderRadius: 26,
  },
  cardBg: {
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  sheen: {
    borderRadius: 26,
    maxHeight: 36,
  },
  cardBorder: {
    borderRadius: 26,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardContent: {
    zIndex: 2,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkWrapper: {
    ...shadows.glassSm,
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  scoreTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
  },
  note: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  retakeButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1.4,
  },
});
