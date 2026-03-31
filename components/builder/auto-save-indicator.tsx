'use client';

import { CheckCircle, Loader2 } from 'lucide-react';

import { useBuilderStore } from '@/lib/store';

export function AutoSaveIndicator() {
  const isSaving = useBuilderStore((s) => s.isSaving);
  const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {isSaving ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSavedAt ? (
        <>
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Saved {formatTime(lastSavedAt)}</span>
        </>
      ) : null}
    </div>
  );
}
