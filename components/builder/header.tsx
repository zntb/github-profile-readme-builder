'use client';

import { Download, GitBranch, Keyboard, Menu, RotateCcw, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { renderMarkdown } from '@/lib/markdown';
import { useBuilderStore } from '@/lib/store';

import { ModeToggle } from '../mode-toggle';

import { AutoSaveIndicator } from './auto-save-indicator';
import { HistoryControls } from './history-controls';
import { KeyboardShortcutsDialog } from './keyboard-shortcuts';
import { ProfileSelector } from './profile-manager';
import { SaveToGist } from './save-to-gist';
import { ShareButton } from './share-button';
import { TemplatesDialog } from './templates-dialog';

export function BuilderHeader() {
  const blocks = useBuilderStore((s) => s.blocks);
  const clearBlocks = useBuilderStore((s) => s.clearBlocks);
  const username = useBuilderStore((s) => s.username);
  const setUsername = useBuilderStore((s) => s.setUsername);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const handleExportFromMenu = () => {
    handleExport();
    setMobileMenuOpen(false);
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between p-4 sm:px-6 sticky top-0 z-50">
      <KeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
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

      <div className="hidden sm:flex items-center gap-2 sm:gap-3">
        <AutoSaveIndicator />
        <ProfileSelector />
        <HistoryControls />
        <button
          onClick={() => setShowShortcuts(true)}
          className="p-2 rounded-lg hover:bg-muted/50 transition-all duration-200"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>
        <ModeToggle />
        <TemplatesDialog />
        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={blocks.length === 0}
              className="hidden sm:flex gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear all blocks from your canvas? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  clearBlocks();
                  toast.success('Canvas cleared');
                  setMobileMenuOpen(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          size="sm"
          onClick={handleExport}
          disabled={blocks.length === 0}
          className="hidden sm:flex gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        <SaveToGist />
        <ShareButton />
      </div>

      <div className="sm:hidden flex items-center gap-2">
        <ModeToggle />
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open mobile navigation menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle>Quick actions</SheetTitle>
              <SheetDescription>
                Set your GitHub username, manage templates, and export your README.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-border/60 p-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    GitHub Username
                  </Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your GitHub username"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Templates
                </p>
                <TemplatesDialog />
              </div>

              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Profiles
                </p>
                <ProfileSelector />
              </div>

              <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-11"
                    disabled={blocks.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear canvas
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all blocks from your canvas? This action cannot
                      be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearBlocks();
                        toast.success('Canvas cleared');
                        setMobileMenuOpen(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                className="w-full justify-start gap-2 h-11 bg-gradient-to-r from-primary to-primary/90"
                onClick={handleExportFromMenu}
                disabled={blocks.length === 0}
              >
                <Download className="w-4 h-4" />
                Export README.md
              </Button>

              <SaveToGist />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
