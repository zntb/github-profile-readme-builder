'use client';

import { Download, Save, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SavedTheme,
  deleteThemeFromLocalStorage,
  exportThemesToFile,
  getSavedThemes,
  importThemesFromFile,
  saveThemeToLocalStorage,
} from '@/lib/saved-themes';

import { CustomThemeColors, getCustomColorsFromTheme } from './custom-theme-builder';

interface ThemeSaveDialogProps {
  /** The current theme value (theme string like "custom:1a1b27_...") */
  currentTheme: string;
  /** Callback when a saved theme is selected */
  onThemeSelect: (themeValue: string) => void;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
}

/** Convert custom colors to theme string */
function toThemeString(colors: CustomThemeColors): string {
  return `custom:${colors.bg}_${colors.title}_${colors.text}_${colors.icon}_${colors.border}`;
}

export function ThemeSaveDialog({
  currentTheme,
  onThemeSelect,
  open,
  onOpenChange,
}: ThemeSaveDialogProps) {
  const [themeName, setThemeName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved themes - use useMemo to load on first render
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => {
    if (typeof window === 'undefined') return [];
    return getSavedThemes();
  });

  // Handle saving a new theme
  const handleSave = async () => {
    if (!themeName.trim()) return;

    setIsSaving(true);
    const colors = getCustomColorsFromTheme(currentTheme);
    saveThemeToLocalStorage(themeName.trim(), colors);
    setSavedThemes(getSavedThemes());
    setThemeName('');
    setIsSaving(false);
  };

  // Handle deleting a theme
  const handleDelete = (id: string) => {
    deleteThemeFromLocalStorage(id);
    setSavedThemes(getSavedThemes());
    setShowDeleteConfirm(null);
  };

  // Handle applying a saved theme
  const handleApply = (theme: SavedTheme) => {
    const themeValue = toThemeString(theme.colors);
    onThemeSelect(themeValue);
  };

  // Handle exporting themes to file
  const handleExport = () => {
    if (savedThemes.length === 0) return;
    exportThemesToFile(savedThemes);
  };

  // Handle importing themes from file
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importThemesFromFile(file);
      setSavedThemes(getSavedThemes());
    } catch (error) {
      console.error('Failed to import themes:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] sm:w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save & Load Custom Themes
          </DialogTitle>
          <DialogDescription>
            Save your custom themes to reuse later, or load previously saved themes. You can also
            export themes to a file for backup.
          </DialogDescription>
        </DialogHeader>

        {/* Save New Theme Section */}
        <div className="space-y-4 py-4 border-b">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label htmlFor="theme-name" className="mb-1.5 block text-xs">
                Theme Name
              </Label>
              <Input
                id="theme-name"
                placeholder="My Custom Theme"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="sm:self-end">
              <Label className="mb-1.5 block text-xs">&nbsp;</Label>
              <Button
                onClick={handleSave}
                disabled={!themeName.trim() || isSaving}
                className="h-9 w-full sm:w-auto"
                size="sm"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Saved Themes List */}
        <div className="flex-1 min-h-0 py-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Saved Themes ({savedThemes.length})
            </Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={handleExport}
                disabled={savedThemes.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="ml-1 hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="ml-1 hidden sm:inline">Import</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          {savedThemes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No saved themes yet.</p>
              <p className="text-muted-foreground text-xs mt-1">
                Create a custom theme and save it to see it here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {savedThemes.map((theme) => (
                  <Card
                    key={theme.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0" onClick={() => handleApply(theme)}>
                          <div className="flex items-center gap-2">
                            {/* Theme Preview Colors */}
                            <div className="flex -space-x-1.5">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor: `#${theme.colors.bg}`,
                                  borderColor: `#${theme.colors.border}`,
                                }}
                                title={`BG: #${theme.colors.bg}`}
                              />
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor: `#${theme.colors.title}`,
                                  borderColor: `#${theme.colors.border}`,
                                }}
                                title={`Title: #${theme.colors.title}`}
                              />
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor: `#${theme.colors.text}`,
                                  borderColor: `#${theme.colors.border}`,
                                }}
                                title={`Text: #${theme.colors.text}`}
                              />
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor: `#${theme.colors.icon}`,
                                  borderColor: `#${theme.colors.border}`,
                                }}
                                title={`Icon: #${theme.colors.icon}`}
                              />
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{
                                  backgroundColor: `#${theme.colors.border}`,
                                  borderColor: `#${theme.colors.border}`,
                                }}
                                title={`Border: #${theme.colors.border}`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm truncate">{theme.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(theme.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(theme.id);
                          }}
                          aria-label="Delete theme"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) setShowDeleteConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this theme? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
