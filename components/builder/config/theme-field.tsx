'use client';

import { useState } from 'react';

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

interface ThemeFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ThemeField({ value, onChange, label = 'Theme' }: ThemeFieldProps) {
  const isCustom = isCustomTheme(value);

  // Track whether user has opened the custom theme builder
  const [showCustomBuilder, setShowCustomBuilder] = useState(isCustom);

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
      <Label>{label}</Label>
      <div className="space-y-2">
        <Select value={isCustom ? 'custom' : value} onValueChange={handlePresetChange}>
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
      </div>
    </FieldGroup>
  );
}
