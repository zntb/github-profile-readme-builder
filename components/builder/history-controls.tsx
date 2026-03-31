'use client';

import { RotateCcw, RotateCw } from 'lucide-react';

import { useBuilderStore } from '@/lib/store';

export function HistoryControls() {
  const canUndo = useBuilderStore((s) => s.canUndo());
  const canRedo = useBuilderStore((s) => s.canRedo());
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        title="Redo (Ctrl+Y)"
      >
        <RotateCw className="w-4 h-4" />
      </button>
    </div>
  );
}
