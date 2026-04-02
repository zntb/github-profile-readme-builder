'use client';

import {
  Download,
  GitBranch,
  Keyboard,
  Link,
  Menu,
  MoreHorizontal,
  RotateCcw,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  LazyImageOptimizationSettings,
  LazyKeyboardShortcutsDialog,
  LazyProfileSelector,
  LazySaveToGist,
  LazyShareButton,
  LazyTemplatesDialog,
} from '@/lib/lazy-components';
import { renderMarkdown } from '@/lib/markdown';
import { useBuilderStore } from '@/lib/store';
import { generateShareUrl } from '@/lib/url-state';

import { ModeToggle } from '../mode-toggle';

import { AutoSaveIndicator } from './auto-save-indicator';
import { HistoryControls } from './history-controls';

export function BuilderHeader() {
  const blocks = useBuilderStore((s) => s.blocks);
  const clearBlocks = useBuilderStore((s) => s.clearBlocks);
  const username = useBuilderStore((s) => s.username);
  const setUsername = useBuilderStore((s) => s.setUsername);
  const setGistDialogOpen = useBuilderStore((s) => s.setGistDialogOpen);

  // Handle opening the Gist dialog from the dropdown menu
  // Direct call without setTimeout to avoid race conditions
  const handleGistClick = () => {
    console.log('[Header] handleGistClick called, calling setGistDialogOpen(true)');
    setGistDialogOpen(true);
    console.log('[Header] setGistDialogOpen called');
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Generate share URL
  const getShareUrl = (): string => {
    if (blocks.length > 0) {
      return generateShareUrl(blocks, username);
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://github-profile-maker.vercel.app';
  };

  const getShareText = (): string => {
    if (username) {
      return `Check out my GitHub profile README I made with GitHub Profile Maker!`;
    }
    return `Create an amazing GitHub profile README with GitHub Profile Maker!`;
  };

  const handleShareToTwitter = () => {
    const url = new URL('https://twitter.com/intent/tweet');
    url.searchParams.set('text', getShareText());
    url.searchParams.set('url', getShareUrl());
    window.open(url.toString(), '_blank');
    toast.success('Opening Twitter...');
  };

  const handleShareToLinkedIn = () => {
    const url = new URL('https://www.linkedin.com/sharing/share-offsite/');
    url.searchParams.set('url', getShareUrl());
    window.open(url.toString(), '_blank');
    toast.success('Opening LinkedIn...');
  };

  const handleShareToFacebook = () => {
    const url = new URL('https://www.facebook.com/sharer/sharer.php');
    url.searchParams.set('u', getShareUrl());
    window.open(url.toString(), '_blank');
    toast.success('Opening Facebook...');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between p-4 sm:px-6 sticky top-0 z-50">
      <LazyKeyboardShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
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

      <div className="hidden md:flex items-center gap-2 sm:gap-3">
        <AutoSaveIndicator />
        <HistoryControls />
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
        {/* Image Optimization Settings Sheet */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm overflow-y-auto overflow-x-hidden px-3 box-border"
          >
            <SheetHeader>
              <SheetTitle>Image Optimization</SheetTitle>
              <SheetDescription>
                Configure automatic image compression and format conversion before uploading to your
                profile.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <LazyImageOptimizationSettings />
            </div>
          </SheetContent>
        </Sheet>
        {/* Actions dropdown - consolidates secondary actions including Share */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-muted/50"
              aria-label="Open actions menu"
            >
              <MoreHorizontal className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 z-[100]">
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Image Optimization Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowShortcuts(true)}>
              <Keyboard className="w-4 h-4 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExport} disabled={blocks.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </DropdownMenuItem>
            {/* Share to Gist - render trigger directly to avoid nested dropdown issues */}
            <DropdownMenuItem className="cursor-pointer" onClick={handleGistClick}>
              <GitBranch className="w-4 h-4 mr-2" />
              Share to Gist
            </DropdownMenuItem>
            {/* Share - nested submenu with Twitter, LinkedIn, Facebook, Copy Link */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <Link className="w-4 h-4 mr-2" />
                <span>Share</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48 z-[100]">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareToTwitter();
                  }}
                >
                  <span className="text-[#1DA1F2]">🐦</span>
                  <span className="ml-2">Twitter / X</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareToLinkedIn();
                  }}
                >
                  <span className="text-[#0A66C2]">💼</span>
                  <span className="ml-2">LinkedIn</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShareToFacebook();
                  }}
                >
                  <span className="text-[#1877F2]">📘</span>
                  <span className="ml-2">Facebook</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyLink();
                  }}
                >
                  <span>🔗</span>
                  <span className="ml-2">Copy Link</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
        <LazyProfileSelector />
        <LazyTemplatesDialog />
        <ModeToggle />
        {/* SaveToGist component - no desktop button, only dialog triggered from dropdown */}
        <LazySaveToGist showDesktopButton={false} />
      </div>

      <div className="sm:hidden flex items-center gap-1">
        <HistoryControls />
        <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={blocks.length === 0}
              className="hover:bg-destructive/10 hover:text-destructive"
              aria-label="Clear canvas"
            >
              <Trash2 className="w-4 h-4" />
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
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
                <LazyTemplatesDialog />
              </div>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-11 px-3"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
                Image Optimization
              </Button>

              <LazyShareButton />

              <div className="rounded-xl border border-border/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  Profiles
                </p>
                <LazyProfileSelector />
              </div>

              <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-11 px-3"
                    disabled={blocks.length === 0}
                  >
                    <Trash2 className="w-4 h-4" />
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
                className="w-full justify-start gap-2 h-11 px-3 bg-gradient-to-r from-primary to-primary/90"
                onClick={handleExportFromMenu}
                disabled={blocks.length === 0}
              >
                <Download className="w-4 h-4" />
                Export README.md
              </Button>

              <LazySaveToGist />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
