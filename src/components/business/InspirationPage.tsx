import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, shadows } from '../../constants/theme';
import { inspirationImages } from '../../constants/data';
import type { InspirationCategory, InspirationItem } from '../../types';
import { PageHeader } from '../ui/PageHeader';

type Props = { onStartCamera: () => void };

export function InspirationPage({ onStartCamera }: Props) {
  const [category, setCategory] = useState<InspirationCategory | '全部'>('全部');
  const [previewItem, setPreviewItem] = useState<InspirationItem | null>(null);
  const closePreview = () => setPreviewItem(null);
  const filteredImages = inspirationImages.filter(item => category === '全部' || item.category === category);
  const columns = [
    filteredImages.filter((_, index) => index % 2 === 0),
    filteredImages.filter((_, index) => index % 2 === 1),
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.fixedHeader}>
        <PageHeader title="灵感" icon="camera-outline" onPress={onStartCamera} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>别急着按下快门，先看看光想把你带到哪里。</Text>

        <View style={styles.segmentRow}>
          {(['全部', '人像', '风景', '夜景'] as const).map((item) => {
            const active = category === item;
            return (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategory(item)}
                style={({ pressed }) => [
                  styles.segment,
                  active ? styles.segmentActive : styles.segmentIdle,
                  { transform: [{ scale: pressed ? 0.95 : 1 }] },
                ]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.collectionNote}>{category} · {filteredImages.length} 张灵感 · AI 生成</Text>
        <View style={styles.grid}>
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={styles.column}>
              {column.map((item) => (
                <Pressable
                  key={item.title}
                  style={({ pressed }) => [
                    styles.cardWrapper,
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`预览${item.title}`}
                  onPress={() => setPreviewItem(item)}
                >
                  <View style={styles.card}>
                    <Image source={item.source} resizeMode="contain" style={styles.image} />
                    <LinearGradient
                      colors={['transparent', 'rgba(24, 22, 18, 0.52)']}
                      style={styles.overlay}
                      pointerEvents="none"
                    />
                    <View pointerEvents="none" style={styles.cardBorder} />

                    <View style={styles.labelContainer}>
                      <Text style={styles.title}>{item.title}</Text>
                      <View style={styles.tagRow}>
                        <View style={styles.tagDot} />
                        <Text style={styles.tag}>{item.tag}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={previewItem !== null}
        animationType="fade"
        transparent
        statusBarTranslucent
        onRequestClose={closePreview}
      >
        {previewItem && (
          <SafeAreaView style={styles.preview} edges={['top', 'bottom']} accessibilityViewIsModal>
            <View style={styles.previewHeader}>
              <View style={styles.previewCaption}>
                <Text style={styles.previewTitle} numberOfLines={1}>{previewItem.title}</Text>
                <Text style={styles.previewTag}>{previewItem.tag} · AI 生成</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭预览"
                onPress={closePreview}
                style={styles.previewClose}
              >
                <Ionicons name="close" size={24} color={colors.whiteWarm} />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="关闭图片预览"
              onPress={closePreview}
              style={styles.previewImageWrap}
            >
              <Image
                source={previewItem.source}
                accessibilityLabel={previewItem.title}
                resizeMode="contain"
                style={styles.previewImage}
              />
            </Pressable>
            <Text style={styles.previewHint}>轻点图片返回灵感</Text>
          </SafeAreaView>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    backgroundColor: '#181612',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 16,
  },
  previewCaption: {
    flex: 1,
  },
  previewTitle: {
    color: colors.whiteWarm,
    fontSize: 17,
    fontWeight: '600',
  },
  previewTag: {
    color: 'rgba(251, 249, 246, 0.65)',
    fontSize: 12,
    marginTop: 5,
  },
  previewClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImageWrap: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewHint: {
    color: 'rgba(251, 249, 246, 0.65)',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
  },
  screen: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  fixedHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: 'rgba(251, 249, 246, 0.92)',
    zIndex: 100,
    borderBottomWidth: 1,
    borderColor: 'rgba(45, 42, 38, 0.04)',
  },
  container: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  lead: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  segment: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 999,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    ...shadows.glassSm,
  },
  segmentIdle: {
    backgroundColor: colors.surfaceContainer,
  },
  segmentText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
  segmentTextActive: {
    color: colors.whiteWarm,
  },

  grid: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  collectionNote: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
    // All bundled inspiration photos are 1024 × 1536. Follow their full frame.
    aspectRatio: 2 / 3,
    borderRadius: 24,
    ...shadows.glassMd,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.80)',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  title: {
    color: colors.whiteWarm,
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.butter,
  },
  tag: {
    color: 'rgba(251, 249, 246, 0.86)',
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
