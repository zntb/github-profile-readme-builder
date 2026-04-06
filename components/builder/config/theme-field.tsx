'use client';

import { FolderOpen } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { STATS_THEMES } from '@/lib/types';

import { CustomThemeBuilder, isCustomTheme } from './custom-theme-builder';
import { FieldGroup } from './field-group';
import { ThemeSaveDialog } from './theme-save-dialog';

interface ThemeFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ThemeField({ value, onChange, label = 'Theme' }: ThemeFieldProps) {
  const isCustom = isCustomTheme(value);

  // Track whether user has opened the custom theme builder
  const [showCustomBuilder, setShowCustomBuilder] = useState(isCustom);
  // Track save dialog open state
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Handle selecting a preset theme
  const handlePresetChange = (newValue: string) => {
    if (newValue === 'custom') {
      // When "Custom Theme..." is selected, show the builder
      setShowCustomBuilder(true);
      // Initialize with default custom colors if not already custom
      if (!isCustom) {
        onChange('custom:1a1b27_70a5fd_c9d1d9_bf91f3_30363d');
      }
    } else {
      setShowCustomBuilder(false);
      onChange(newValue);
    }
  };

  return (
    <FieldGroup>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <FolderOpen className="h-3 w-3 mr-1" />
          Saved Themes
        </Button>
      </div>
      <div className="space-y-2">
        <Select value={isCustom ? 'custom' : value || 'default'} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {STATS_THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {theme}
              </SelectItem>
            ))}
            <SelectItem value="custom">🎨 Custom Theme...</SelectItem>
          </SelectContent>
        </Select>

        {/* Show custom theme builder when custom is selected or when user clicks Create Custom */}
        {(showCustomBuilder || isCustom) && (
          <CustomThemeBuilder value={value} onChange={onChange} />
        )}

        {/* Save/Load Theme Dialog */}
        <ThemeSaveDialog
          currentTheme={value}
          onThemeSelect={onChange}
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
        />
      </div>
    </FieldGroup>
  );
}
