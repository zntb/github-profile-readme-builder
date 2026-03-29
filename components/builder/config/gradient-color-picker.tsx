'use client';

import { Label } from '@/components/ui/label';

import { FieldGroup } from './field-group';

// Parse gradient color string like "0:EEFF00,100:a82DA" to get start and end colors
function parseGradientColor(gradientStr: string): { startColor: string; endColor: string } {
  if (!gradientStr) {
    return { startColor: '#00ff00', endColor: '#0000ff' };
  }

  const parts = gradientStr.split(',');
  if (parts.length >= 2) {
    const startMatch = parts[0].match(/\d+:([0-9a-fA-F]+)/);
    const endMatch = parts[1].match(/\d+:([0-9a-fA-F]+)/);

    return {
      startColor: startMatch ? `#${startMatch[1].toUpperCase()}` : '#00ff00',
      endColor: endMatch ? `#${endMatch[1].toUpperCase()}` : '#0000ff',
    };
  }

  // Single color provided - use it as start color
  const singleMatch = gradientStr.match(/^([0-9a-fA-F]+)$/);
  if (singleMatch) {
    return { startColor: `#${singleMatch[1].toUpperCase()}`, endColor: '#0000ff' };
  }

  return { startColor: '#00ff00', endColor: '#0000ff' };
}

// Convert start and end colors to gradient string format
function toGradientString(startColor: string, endColor: string): string {
  const start = startColor.replace('#', '').toUpperCase();
  const end = endColor.replace('#', '').toUpperCase();
  return `0:${start},100:${end}`;
}

interface GradientColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function GradientColorPicker({ label, value, onChange }: GradientColorPickerProps) {
  // Parse the current gradient string to get individual colors
  const { startColor, endColor } = parseGradientColor(value);

  const handleStartColorChange = (newStartColor: string) => {
    onChange(toGradientString(newStartColor, endColor));
  };

  const handleEndColorChange = (newEndColor: string) => {
    onChange(toGradientString(startColor, newEndColor));
  };

  return (
    <FieldGroup>
      <Label>{label}</Label>
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Start</Label>
          <input
            type="color"
            value={startColor}
            onChange={(e) => handleStartColorChange(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">End</Label>
          <input
            type="color"
            value={endColor}
            onChange={(e) => handleEndColorChange(e.target.value)}
            className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
          />
        </div>
      </div>
    </FieldGroup>
  );
}

// Simple color picker for single color (non-gradient)
interface SimpleColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SimpleColorPicker({
  label,
  value,
  onChange,
  placeholder = '#ffffff',
}: SimpleColorPickerProps) {
  // Ensure value is a valid hex color
  const normalizedValue = value
    ? value.startsWith('#')
      ? value.toUpperCase()
      : `#${value.toUpperCase()}`
    : placeholder;

  const handleColorChange = (newColor: string) => {
    // Remove the # and convert to the format expected (without #)
    onChange(newColor.replace('#', '').toUpperCase());
  };

  return (
    <FieldGroup>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normalizedValue}
          onChange={(e) => handleColorChange(e.target.value)}
          className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.replace('#', '').toUpperCase())}
          placeholder={placeholder.replace('#', '')}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
        />
      </div>
    </FieldGroup>
  );
}
