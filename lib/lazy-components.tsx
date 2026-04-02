/**
 * Lazy-loaded component definitions using Next.js dynamic imports.
 *
 * This module centralizes all dynamic imports for heavy components that are
 * not needed on initial page load, reducing the initial bundle size and
 * improving time-to-interactive (TTI).
 *
 * ## Strategy
 * - Components used only on user interaction (dialogs, panels) are lazy-loaded
 * - Components visible on initial render (Canvas, BlockSidebar) are NOT lazy-loaded
 * - Each lazy component has a lightweight skeleton fallback for smooth UX
 *
 * ## Bundle Chunks Created
 * - `command-palette` — Ctrl+K command palette with template data
 * - `keyboard-shortcuts` — keyboard shortcut handler + help dialog
 * - `templates-dialog` — template browser (heavy: 56KB templates.ts)
 * - `share-button` — share dialog with social platform icons
 * - `save-to-gist` — GitHub Gist save dialog
 * - `profile-manager` — profile selector dropdown
 * - `live-preview` — rendered markdown preview with image fetching
 * - `config-panel` — block configuration panel
 * - `profile-quality` — profile completeness score panel
 * - `image-optimization-settings` — image optimization settings dialog
 */

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/skeleton';

// ---------------------------------------------------------------------------
// Skeleton fallbacks for lazy-loaded components
// ---------------------------------------------------------------------------

/** Minimal inline skeleton for dialog-type components */
function DialogSkeleton() {
  return (
    <div className="flex items-center justify-center p-4">
      <Skeleton className="h-8 w-32 rounded-md" />
    </div>
  );
}

/** Skeleton for the live preview panel */
function LivePreviewSkeleton() {
  return (
    <div className="p-3 sm:p-6 space-y-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-border/50 bg-card/50 p-4 space-y-4">
        <Skeleton className="h-24 w-24 rounded-full mx-auto" />
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3">
          <Skeleton className="h-[195px] w-[49%]" />
          <Skeleton className="h-[195px] w-[49%]" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the config panel */
function ConfigPanelSkeleton() {
  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-sidebar">
      <div className="border-b border-border p-4">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

/** Skeleton for the profile quality panel */
function ProfileQualitySkeleton() {
  return (
    <div className="p-3 border-b border-border/50">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lazy-loaded components
// ---------------------------------------------------------------------------

/**
 * CommandPalette — triggered by Ctrl+K, not needed on initial render.
 * Heavy due to command list, fuzzy search, and template data.
 */
export const LazyCommandPalette = dynamic(
  () => import('@/components/builder/command-palette').then((m) => ({ default: m.CommandPalette })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * KeyboardShortcutsProvider — registers keyboard shortcuts and renders the help dialog.
 * Wraps both `useKeyboardShortcuts` hook and `KeyboardShortcutsDialog` in a single
 * lazy-loaded unit so the entire feature is deferred until after initial render.
 */
export const LazyKeyboardShortcutsProvider = dynamic(
  () =>
    import('@/components/builder/keyboard-shortcuts').then((m) => ({
      default: m.KeyboardShortcutsProvider,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * KeyboardShortcutsDialog — standalone dialog for showing shortcuts.
 * Used when the dialog needs to be controlled externally.
 */
export const LazyKeyboardShortcutsDialog = dynamic(
  () =>
    import('@/components/builder/keyboard-shortcuts').then((m) => ({
      default: m.KeyboardShortcutsDialog,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * TemplatesDialog — opened via button click, not needed on initial render.
 * Heavy due to template data (56KB templates.ts).
 */
export const LazyTemplatesDialog = dynamic(
  () =>
    import('@/components/builder/templates-dialog').then((m) => ({
      default: m.TemplatesDialog,
    })),
  {
    ssr: false,
    loading: () => <DialogSkeleton />,
  },
);

/**
 * ShareButton — opened via button click, not needed on initial render.
 */
export const LazyShareButton = dynamic(
  () => import('@/components/builder/share-button').then((m) => ({ default: m.ShareButton })),
  {
    ssr: false,
    loading: () => <DialogSkeleton />,
  },
);

/**
 * SaveToGist — opened via store state, not needed on initial render.
 */
export const LazySaveToGist = dynamic(
  () => import('@/components/builder/save-to-gist').then((m) => ({ default: m.SaveToGist })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * ProfileSelector — dropdown for profile management, not needed on initial render.
 */
export const LazyProfileSelector = dynamic(
  () =>
    import('@/components/builder/profile-manager').then((m) => ({
      default: m.ProfileSelector,
    })),
  {
    ssr: false,
    loading: () => <DialogSkeleton />,
  },
);

/**
 * LivePreview — the rendered markdown preview panel.
 * Heavy due to image fetching and rendering logic.
 * Loaded after initial render to prioritize canvas interactivity.
 */
export const LazyLivePreview = dynamic(
  () => import('@/components/builder/live-preview').then((m) => ({ default: m.LivePreview })),
  {
    ssr: false,
    loading: LivePreviewSkeleton,
  },
);

/**
 * ConfigPanel — block configuration panel, only shown when a block is selected.
 * Heavy due to BlockConfigFields which imports all block config components.
 */
export const LazyConfigPanel = dynamic(
  () => import('@/components/builder/config-panel').then((m) => ({ default: m.ConfigPanel })),
  {
    ssr: false,
    loading: ConfigPanelSkeleton,
  },
);

/**
 * ProfileQuality — profile completeness score panel.
 * Not critical for initial render.
 */
export const LazyProfileQuality = dynamic(
  () => import('@/components/builder/profile-quality').then((m) => ({ default: m.ProfileQuality })),
  {
    ssr: false,
    loading: ProfileQualitySkeleton,
  },
);

/**
 * ImageOptimizationSettings — settings dialog for image optimization.
 * Only shown in header settings menu.
 */
export const LazyImageOptimizationSettings = dynamic(
  () =>
    import('@/components/builder/config/image-optimization-settings').then((m) => ({
      default: m.ImageOptimizationSettings,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);
