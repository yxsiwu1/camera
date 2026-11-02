import React, { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraHome } from '../../components/business/CameraHome';
import { PhotoReview } from '../../components/business/PhotoReview';
import { Screen } from '../../components/ui/Screen';
import { useCameraFlow } from '../../hooks/useCameraFlow';
import { saveImageToLibrary } from '../../lib/media';
import { useCaptureStore } from '../../store/captureStore';

export default function CameraRoute() {
  const router = useRouter();
  const camera = useCameraFlow();
  const capturedUri = useCaptureStore((state) => state.capturedUri);
  const clearCapturedUri = useCaptureStore((state) => state.clearCapturedUri);
  const addSavedUri = useCaptureStore((state) => state.addSavedUri);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const savedPhotoRef = useRef<{ source: string; uri: string } | null>(null);

  const openCamera = async () => {
    const granted = await camera.open();
    if (granted) router.push('/capture');
  };

  const retake = async () => {
    if (savingRef.current) return;
    clearCapturedUri();
    const granted = await camera.open();
    if (granted) router.push('/capture');
  };

  const save = async () => {
    if (!capturedUri || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const result = savedPhotoRef.current?.source === capturedUri
        ? { saved: true as const, uri: savedPhotoRef.current.uri }
        : await saveImageToLibrary(capturedUri);
      if (!result.saved) {
        Alert.alert('需要相册权限', '请允许Drama相机访问相册，以便保存你的作品。');
        return;
      }
      // Retain a successful file save across record-write retries without duplicating it.
      savedPhotoRef.current = { source: capturedUri, uri: result.uri };
      await addSavedUri(result.uri);
      clearCapturedUri();
      try {
        const granted = await camera.open();
        if (granted) router.push('/capture');
        else Alert.alert('照片已保存', '允许相机权限后即可继续拍摄。');
      } catch {
        Alert.alert('照片已保存', '暂时无法打开相机，请重新打开拍摄。');
      }
    } catch {
      Alert.alert('保存失败', '照片仍保留在预览中，请检查存储空间后重试。');
      return;
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  return (
    <Screen>
      {capturedUri ? (
        <PhotoReview uri={capturedUri} onRetake={retake} onSave={save} saving={saving} />
      ) : (
        <CameraHome permissionGranted={camera.permissionGranted} onOpenCamera={openCamera} />
      )}
    </Screen>
  );
}
