import React, { useRef } from 'react';
import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { CameraCapture } from '../components/business/CameraCapture';
import { useCaptureStore } from '../store/captureStore';

export default function CaptureRoute() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const setCapturedUri = useCaptureStore((state) => state.setCapturedUri);

  return (
    <CameraCapture
      cameraRef={cameraRef}
      onClose={() => router.back()}
      onCapture={(uri) => {
        setCapturedUri(uri);
        router.back();
      }}
      onOpenGallery={() => {
        router.back();
        setTimeout(() => router.navigate('/album'), 0);
      }}
      onConfigure={() => router.push('/settings/ai')}
    />
  );
}
