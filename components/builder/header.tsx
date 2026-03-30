'use client';

import { Download, GitBranch, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { renderMarkdown } from '@/lib/markdown';
import { useBuilderStore } from '@/lib/store';

import { ModeToggle } from '../mode-toggle';

import { TemplatesDialog } from './templates-dialog';

export function BuilderHeader() {
  const blocks = useBuilderStore((s) => s.blocks);
  const clearBlocks = useBuilderStore((s) => s.clearBlocks);

  const handleExport = () => {
    const markdown = renderMarkdown(blocks, window.location.origin);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('README.md downloaded!');
  };

  const handleClear = () => {
    if (blocks.length === 0) return;
    clearBlocks();
    toast.success('Canvas cleared');
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between p-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20 group">
            <GitBranch className="w-5 h-5 text-primary-foreground group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-foreground text-base tracking-tight">
              README Builder
            </h1>
            <p className="text-xs text-muted-foreground -mt-0.5">Craft your profile</p>
          </div>
          <h1 className="sm:hidden font-semibold text-foreground text-base">Builder</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ModeToggle />
        <TemplatesDialog />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={blocks.length === 0}
          className="hidden sm:flex gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          disabled={blocks.length === 0}
          className="sm:hidden hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={handleExport}
          disabled={blocks.length === 0}
          className="hidden sm:flex gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button
          size="icon"
          onClick={handleExport}
          disabled={blocks.length === 0}
          className="sm:hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
