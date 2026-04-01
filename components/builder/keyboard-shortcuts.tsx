'use client';

import { ArrowDown, ArrowUp, Keyboard, MoveDown, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProfileStore } from '@/lib/profiles';
import { useBuilderStore } from '@/lib/store';

interface KeyboardShortcut {
  key: string;
  modifiers: ('Ctrl' | 'Shift' | 'Alt' | 'Meta')[];
  description: string;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  // Navigation
  {
    key: '↑',
    modifiers: [],
    description: 'Select previous block',
    category: 'Navigation',
  },
  {
    key: '↓',
    modifiers: [],
    description: 'Select next block',
    category: 'Navigation',
  },
  {
    key: 'Escape',
    modifiers: [],
    description: 'Deselect block / Close dialog',
    category: 'Navigation',
  },
  // Block Actions
  {
    key: 'Delete',
    modifiers: [],
    description: 'Delete selected block',
    category: 'Block Actions',
  },
  {
    key: 'Backspace',
    modifiers: [],
    description: 'Delete selected block',
    category: 'Block Actions',
  },
  {
    key: 'D',
    modifiers: ['Ctrl'],
    description: 'Duplicate selected block',
    category: 'Block Actions',
  },
  // Reordering
  {
    key: '↑',
    modifiers: ['Ctrl'],
    description: 'Move block up',
    category: 'Reordering',
  },
  {
    key: '↓',
    modifiers: ['Ctrl'],
    description: 'Move block down',
    category: 'Reordering',
  },
  // History
  {
    key: 'Z',
    modifiers: ['Ctrl'],
    description: 'Undo last change',
    category: 'History',
  },
  {
    key: 'Y',
    modifiers: ['Ctrl'],
    description: 'Redo last change',
    category: 'History',
  },
  {
    key: 'Z',
    modifiers: ['Ctrl', 'Shift'],
    description: 'Redo last change',
    category: 'History',
  },
  // Help
  {
    key: '?',
    modifiers: [],
    description: 'Show keyboard shortcuts',
    category: 'Help',
  },
  // Profiles
  {
    key: '1',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 1',
    category: 'Profiles',
  },
  {
    key: '2',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 2',
    category: 'Profiles',
  },
  {
    key: '3',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 3',
    category: 'Profiles',
  },
  {
    key: '4',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 4',
    category: 'Profiles',
  },
  {
    key: '5',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 5',
    category: 'Profiles',
  },
  {
    key: '6',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 6',
    category: 'Profiles',
  },
  {
    key: '7',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 7',
    category: 'Profiles',
  },
  {
    key: '8',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 8',
    category: 'Profiles',
  },
  {
    key: '9',
    modifiers: ['Ctrl'],
    description: 'Switch to profile 9',
    category: 'Profiles',
  },
  {
    key: 'S',
    modifiers: ['Ctrl', 'Shift'],
    description: 'Save current state as new profile',
    category: 'Profiles',
  },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Navigation: ArrowDown,
  'Block Actions': Trash2,
  Reordering: MoveDown,
  History: ArrowUp,
  Help: Keyboard,
  Profiles: ArrowDown,
};

function formatKey(key: string, modifiers: string[]): string {
  const parts: string[] = [];

  // Add modifier keys
  if (modifiers.includes('Ctrl')) {
    parts.push('Ctrl');
  }
  if (modifiers.includes('Meta')) {
    parts.push('⌘');
  }
  if (modifiers.includes('Shift')) {
    parts.push('⇧');
  }
  if (modifiers.includes('Alt')) {
    parts.push('⌥');
  }

  // Add the main key
  if (key === 'ArrowUp') {
    parts.push('↑');
  } else if (key === 'ArrowDown') {
    parts.push('↓');
  } else if (key === ' ') {
    parts.push('Space');
  } else {
    parts.push(key);
  }

  return parts.join(' + ');
}

export function useKeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false);
  const blocks = useBuilderStore((s) => s.blocks);
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const moveBlock = useBuilderStore((s) => s.moveBlock);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const canUndo = useBuilderStore((s) => s.canUndo());
  const canRedo = useBuilderStore((s) => s.canRedo());
  const setBlocks = useBuilderStore((s) => s.setBlocks);
  const setUsername = useBuilderStore((s) => s.setUsername);
  const username = useBuilderStore((s) => s.username);

  // Profile store actions
  const profiles = useProfileStore((s) => s.profiles);
  const createProfile = useProfileStore((s) => s.createProfile);
  const loadProfile = useProfileStore((s) => s.loadProfile);

  // Note: showSaveProfile and getActiveProfile are intentionally unused
  // showSaveProfile would be used to show a save dialog (future enhancement)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Show help dialog with ? or / (works with Shift+/ or Ctrl+/)
      if ((e.key === '/' || e.key === '?') && !isInput) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Escape to deselect or close dialogs
      if (e.key === 'Escape') {
        // If help dialog is open, close it
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        // Otherwise deselect block
        if (selectedBlockId) {
          e.preventDefault();
          selectBlock(null);
        }
        return;
      }

      // Don't process other shortcuts if in input
      if (isInput) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // Delete selected block
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isCtrl && selectedBlockId) {
        e.preventDefault();
        removeBlock(selectedBlockId);
        return;
      }

      // Duplicate block (Ctrl+D)
      if (e.key === 'd' && isCtrl && selectedBlockId) {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
        return;
      }

      // Undo (Ctrl+Z)
      if (e.key === 'z' && isCtrl && !isShift && canUndo) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if ((e.key === 'y' && isCtrl) || (e.key === 'z' && isCtrl && isShift)) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Navigation with arrow keys
      if (!isCtrl && blocks.length > 0) {
        if (e.key === 'ArrowUp' && selectedBlockId) {
          e.preventDefault();
          const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);
          if (currentIndex > 0) {
            selectBlock(blocks[currentIndex - 1].id);
          } else if (!selectedBlockId) {
            selectBlock(blocks[0].id);
          }
          return;
        }

        if (e.key === 'ArrowDown' && selectedBlockId) {
          e.preventDefault();
          const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);
          if (currentIndex < blocks.length - 1) {
            selectBlock(blocks[currentIndex + 1].id);
          } else if (!selectedBlockId) {
            selectBlock(blocks[0].id);
          }
          return;
        }
      }

      // Move block up/down with Ctrl+Arrow
      if (isCtrl && selectedBlockId) {
        const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);

        if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          moveBlock(currentIndex, currentIndex - 1);
          return;
        }

        if (e.key === 'ArrowDown' && currentIndex < blocks.length - 1) {
          e.preventDefault();
          moveBlock(currentIndex, currentIndex + 1);
          return;
        }
      }

      // Profile switching (Ctrl+1-9)
      if (isCtrl && !isShift) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
          const profileIndex = num - 1;
          if (profiles[profileIndex]) {
            e.preventDefault();
            const profile = profiles[profileIndex];
            loadProfile(profile.id);
            setBlocks(profile.blocks);
            setUsername(profile.username);
            toast.success(`Switched to "${profile.name}"`);
            return;
          }
        }
      }

      // Save as new profile (Ctrl+Shift+S)
      if (isCtrl && isShift && e.key === 's') {
        e.preventDefault();
        const defaultName = `Profile ${profiles.length + 1}`;
        createProfile(defaultName, blocks, username);
        return;
      }
    },
    [
      showHelp,
      blocks,
      selectedBlockId,
      canUndo,
      canRedo,
      selectBlock,
      removeBlock,
      duplicateBlock,
      moveBlock,
      undo,
      redo,
      profiles,
      loadProfile,
      setBlocks,
      setUsername,
      username,
      createProfile,
    ],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use keyboard shortcuts to work faster with your GitHub Profile README.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
              const Icon = categoryIcons[category] || Keyboard;
              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div
                        key={`${shortcut.category}-${index}`}
                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2 py-1 rounded-md border">
                          {formatKey(shortcut.key, shortcut.modifiers)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
