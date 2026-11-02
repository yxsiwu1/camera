import { useCameraPermissions } from 'expo-camera';

export function useCameraFlow() {
  const [permission, requestPermission] = useCameraPermissions();

  const open = async () => {
    if (permission?.granted) return true;
    const nextPermission = await requestPermission();
    return nextPermission.granted;
  };

  return {
    permissionGranted: permission?.granted ?? false,
    open,
  };
}
