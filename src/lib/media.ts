import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export async function saveImageToLibrary(uri: string) {
  // Web camera captures are data URLs and can be retained in the app's store.
  if (Platform.OS === 'web') return { saved: true as const, uri };
  const permission = await MediaLibrary.requestPermissionsAsync();
  if (!permission.granted) return { saved: false as const, reason: 'permission' as const };
  if (!FileSystem.documentDirectory) throw new Error('照片存储目录不可用');
  const directory = `${FileSystem.documentDirectory}captures/`;
  // Re-saving a photo already retained by this app must not create duplicates.
  if (uri.startsWith(directory)) return { saved: true as const, uri };
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const savedUri = `${directory}${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: savedUri });
  try {
    await MediaLibrary.createAssetAsync(savedUri);
  } catch (error) {
    await FileSystem.deleteAsync(savedUri, { idempotent: true }).catch(() => undefined);
    throw error;
  }
  return { saved: true as const, uri: savedUri };
}
