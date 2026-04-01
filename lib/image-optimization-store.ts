import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ImageOptimizationSettings {
  /** Whether optimization is enabled */
  enabled: boolean;
  /** Output format */
  format: 'jpeg' | 'png' | 'webp' | 'avif' | 'gif';
  /** Quality (1-100) */
  quality: number;
  /** Maximum width */
  maxWidth: number;
  /** Maximum height */
  maxHeight: number;
  /** Preserve aspect ratio */
  preserveAspectRatio: boolean;
  /** Progressive loading */
  progressive: boolean;
}

interface ImageOptimizationStore {
  settings: ImageOptimizationSettings;
  setEnabled: (enabled: boolean) => void;
  setFormat: (format: ImageOptimizationSettings['format']) => void;
  setQuality: (quality: number) => void;
  setMaxWidth: (maxWidth: number) => void;
  setMaxHeight: (maxHeight: number) => void;
  setPreserveAspectRatio: (preserve: boolean) => void;
  setProgressive: (progressive: boolean) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: ImageOptimizationSettings = {
  enabled: true,
  format: 'webp',
  quality: 80,
  maxWidth: 1200,
  maxHeight: 1200,
  preserveAspectRatio: true,
  progressive: true,
};

export const useImageOptimizationStore = create<ImageOptimizationStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      setEnabled: (enabled) =>
        set((state) => ({
          settings: { ...state.settings, enabled },
        })),

      setFormat: (format) =>
        set((state) => ({
          settings: { ...state.settings, format },
        })),

      setQuality: (quality) =>
        set((state) => ({
          settings: { ...state.settings, quality },
        })),

      setMaxWidth: (maxWidth) =>
        set((state) => ({
          settings: { ...state.settings, maxWidth },
        })),

      setMaxHeight: (maxHeight) =>
        set((state) => ({
          settings: { ...state.settings, maxHeight },
        })),

      setPreserveAspectRatio: (preserveAspectRatio) =>
        set((state) => ({
          settings: { ...state.settings, preserveAspectRatio },
        })),

      setProgressive: (progressive) =>
        set((state) => ({
          settings: { ...state.settings, progressive },
        })),

      resetToDefaults: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'image-optimization-settings',
    },
  ),
);
