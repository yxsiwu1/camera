import { capturePersistence } from '../lib/capturePersistence';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type CaptureState = {
  capturedUri: string | null;
  savedUris: string[];
  favoriteUris: string[];
  setCapturedUri: (uri: string | null) => void;
  addSavedUri: (uri: string) => Promise<void>;
  clearCapturedUri: () => void;
  toggleFavorite: (uri: string) => void;
  isFavorite: (uri: string) => boolean;
};

export const useCaptureStore = create<CaptureState>()(
  persist(
    (set, get) => ({
      capturedUri: null,
      savedUris: [],
      favoriteUris: [],
      setCapturedUri: (capturedUri) => set({ capturedUri }),
      // The persist middleware returns the storage write promise from set().
      addSavedUri: async (uri) => { await set((state) => ({ savedUris: [uri, ...state.savedUris.filter((item) => item !== uri)] })); },
      clearCapturedUri: () => set({ capturedUri: null }),
      toggleFavorite: (uri) => set((state) => {
        const list = state.favoriteUris || [];
        const exists = list.includes(uri);
        return {
          favoriteUris: exists ? list.filter((item) => item !== uri) : [uri, ...list],
        };
      }),
      isFavorite: (uri) => (get().favoriteUris || []).includes(uri),
    }),
    {
      name: 'warm-lens-captures',
      storage: createJSONStorage(() => capturePersistence),
      partialize: (state) => ({ savedUris: state.savedUris, favoriteUris: state.favoriteUris || [] }),
    },
  ),
);
