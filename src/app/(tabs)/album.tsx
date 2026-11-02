import React from 'react';
import { AlbumPage } from '../../components/business/AlbumPage';
import { Screen } from '../../components/ui/Screen';
import { useCaptureStore } from '../../store/captureStore';

export default function AlbumRoute() {
  const capturedUri = useCaptureStore((state) => state.capturedUri);
  const savedUris = useCaptureStore((state) => state.savedUris);
  return <Screen><AlbumPage capturedUri={capturedUri} savedUris={savedUris} /></Screen>;
}
