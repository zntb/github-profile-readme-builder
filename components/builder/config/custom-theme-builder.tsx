'use client';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { SimpleColorPicker } from './gradient-color-picker';

export interface CustomThemeColors {
  bg: string;
  title: string;
  text: string;
  icon: string;
  border: string;
}

// Default custom theme colors
const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  bg: '1a1b27',
  title: '70a5fd',
  text: 'c9d1d9',
  icon: 'bf91f3',
  border: '30363d',
};

// Parse custom theme string format: "custom:bg_title_text_icon_border"
function parseCustomTheme(themeValue: string): CustomThemeColors | null {
  if (!themeValue.startsWith('custom:')) {
    return null;
  }

  const colors = themeValue.replace('custom:', '');
  const parts = colors.split('_');

  if (parts.length >= 5) {
    return {
      bg: parts[0] || DEFAULT_CUSTOM_COLORS.bg,
      title: parts[1] || DEFAULT_CUSTOM_COLORS.title,
      text: parts[2] || DEFAULT_CUSTOM_COLORS.text,
      icon: parts[3] || DEFAULT_CUSTOM_COLORS.icon,
      border: parts[4] || DEFAULT_CUSTOM_COLORS.border,
    };
  }

  return null;
}

// Convert custom colors to theme string
function toCustomThemeString(colors: CustomThemeColors): string {
  return `custom:${colors.bg}_${colors.title}_${colors.text}_${colors.icon}_${colors.border}`;
}

// Check if current theme is a custom theme
export function isCustomTheme(themeValue: string): boolean {
  return themeValue.startsWith('custom:');
}

// Get custom colors from theme value
export function getCustomColorsFromTheme(themeValue: string): CustomThemeColors {
  const parsed = parseCustomTheme(themeValue);
  return parsed || DEFAULT_CUSTOM_COLORS;
}

interface CustomThemeBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomThemeBuilder({ value, onChange }: CustomThemeBuilderProps) {
  // Get colors from current value
  const currentColors = getCustomColorsFromTheme(value);

  const handleColorChange = (colorKey: keyof CustomThemeColors, newColor: string) => {
    const updatedColors: CustomThemeColors = {
      ...currentColors,
      [colorKey]: newColor,
    };
    onChange(toCustomThemeString(updatedColors));
  };

  const handleReset = () => {
    onChange(toCustomThemeString(DEFAULT_CUSTOM_COLORS));
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Custom Colors</Label>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Theme Preview */}
      <div
        className="rounded-lg border-2 p-4 transition-all"
        style={{
          backgroundColor: `#${currentColors.bg}`,
          borderColor: `#${currentColors.border}`,
          borderRadius: 8,
        }}
      >
        <div className="space-y-2">
          <div className="text-sm font-semibold" style={{ color: `#${currentColors.title}` }}>
            Title Text
          </div>
          <div className="text-xs" style={{ color: `#${currentColors.text}` }}>
            Description text with some content
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: `#${currentColors.icon}` }}
            />
            <span className="text-xs" style={{ color: `#${currentColors.icon}` }}>
              Icon
            </span>
          </div>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-3">
        <SimpleColorPicker
          label="Background"
          value={currentColors.bg}
          onChange={(color) => handleColorChange('bg', color)}
          placeholder="#1a1b27"
        />
        <SimpleColorPicker
          label="Border"
          value={currentColors.border}
          onChange={(color) => handleColorChange('border', color)}
          placeholder="#30363d"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SimpleColorPicker
          label="Title"
          value={currentColors.title}
          onChange={(color) => handleColorChange('title', color)}
          placeholder="#70a5fd"
        />
        <SimpleColorPicker
          label="Text"
          value={currentColors.text}
          onChange={(color) => handleColorChange('text', color)}
          placeholder="#c9d1d9"
        />
      </div>

      <SimpleColorPicker
        label="Icon"
        value={currentColors.icon}
        onChange={(color) => handleColorChange('icon', color)}
        placeholder="#bf91f3"
      />
    </div>
  );
}
