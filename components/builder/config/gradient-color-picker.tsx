'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { FieldGroup } from './field-group';

// Simple button component for type selection

// Animation types for animated backgrounds
export type AnimationType = 'none' | 'gradient' | 'pulse' | 'wave' | 'bounce' | 'shimmer';

// Gradient direction types
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal' | 'radial' | 'conic';

// Background type
export type BackgroundType = 'solid' | 'gradient' | 'animated';

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

// Generate CSS gradient from colors and direction
export function generateGradientCSS(
  startColor: string,
  endColor: string,
  direction: GradientDirection,
): string {
  const start = startColor.replace('#', '');
  const end = endColor.replace('#', '');

  switch (direction) {
    case 'horizontal':
      return `linear-gradient(to right, #${start}, #${end})`;
    case 'vertical':
      return `linear-gradient(to bottom, #${start}, #${end})`;
    case 'diagonal':
      return `linear-gradient(135deg, #${start}, #${end})`;
    case 'radial':
      return `radial-gradient(circle, #${start}, #${end})`;
    case 'conic':
      return `conic-gradient(from 0deg, #${start}, #${end})`;
    default:
      return `linear-gradient(to right, #${start}, #${end})`;
  }
}

// Generate animated CSS
export function generateAnimatedCSS(
  startColor: string,
  endColor: string,
  animation: AnimationType,
): string {
  const start = startColor.replace('#', '');
  const end = endColor.replace('#', '');

  switch (animation) {
    case 'gradient':
      return `linear-gradient(45deg, #${start}, #${end}, #${start}, #${end})`;
    case 'pulse':
      return `linear-gradient(to right, #${start}, #${end})`;
    case 'wave':
      return `linear-gradient(90deg, #${start}, #${end})`;
    case 'bounce':
      return `linear-gradient(180deg, #${start}, #${end})`;
    case 'shimmer':
      return `linear-gradient(90deg, #${start}, #${end}, #${start})`;
    default:
      return `linear-gradient(to right, #${start}, #${end})`;
  }
}

interface GradientColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  enableAnimation?: boolean;
}

export function GradientColorPicker({
  label,
  value,
  onChange,
  enableAnimation = true,
}: GradientColorPickerProps) {
  // Parse the current gradient string to get individual colors
  const { startColor, endColor } = parseGradientColor(value);

  // Parse background type, direction, and animation from extended value
  // Format: "type:direction:animation:start:end"
  const parseExtendedValue = () => {
    const parts = value.split(':');
    if (parts.length >= 5) {
      return {
        bgType: (parts[0] as BackgroundType) || 'gradient',
        direction: (parts[1] as GradientDirection) || 'horizontal',
        animation: (parts[2] || 'none') as AnimationType,
        startColor: '#' + (parts[3] || '00ff00'),
        endColor: '#' + (parts[4] || '0000ff'),
      };
    }
    return {
      bgType: 'gradient' as BackgroundType,
      direction: 'horizontal' as GradientDirection,
      animation: 'none' as AnimationType,
      startColor,
      endColor,
    };
  };

  const {
    bgType,
    direction,
    animation,
    startColor: currentStart,
    endColor: currentEnd,
  } = parseExtendedValue();

  // Ensure bgType is properly extracted - handle the case when value is legacy format
  const resolvedBgType =
    bgType === 'gradient' || bgType === 'animated' || bgType === 'solid' ? bgType : 'gradient';

  const handleStartColorChange = (newStartColor: string) => {
    if (enableAnimation) {
      onChange(
        `${resolvedBgType}:${direction}:${animation}:${newStartColor.replace('#', '')}:${currentEnd.replace('#', '')}`,
      );
    } else {
      onChange(toGradientString(newStartColor, currentEnd));
    }
  };

  const handleEndColorChange = (newEndColor: string) => {
    if (enableAnimation) {
      onChange(
        `${resolvedBgType}:${direction}:${animation}:${currentStart.replace('#', '')}:${newEndColor.replace('#', '')}`,
      );
    } else {
      onChange(toGradientString(currentStart, newEndColor));
    }
  };

  const handleBgTypeChange = (newType: BackgroundType) => {
    onChange(
      `${newType}:${direction}:${animation}:${currentStart.replace('#', '')}:${currentEnd.replace('#', '')}`,
    );
  };

  const handleDirectionChange = (newDirection: GradientDirection) => {
    onChange(
      `${resolvedBgType}:${newDirection}:${animation}:${currentStart.replace('#', '')}:${currentEnd.replace('#', '')}`,
    );
  };

  const handleAnimationChange = (newAnimation: AnimationType) => {
    onChange(
      `${resolvedBgType}:${direction}:${newAnimation}:${currentStart.replace('#', '')}:${currentEnd.replace('#', '')}`,
    );
  };

  return (
    <FieldGroup>
      <Label>{label}</Label>

      {/* Background Type Selection */}
      {enableAnimation && (
        <div className="mb-3">
          <Label className="text-sm text-muted-foreground mb-2 block">Background Type</Label>
          <div className="flex gap-2">
            <Button
              variant={resolvedBgType === 'solid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBgTypeChange('solid')}
              className="flex-1"
            >
              Solid
            </Button>
            <Button
              variant={resolvedBgType === 'gradient' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBgTypeChange('gradient')}
              className="flex-1"
            >
              Gradient
            </Button>
            <Button
              variant={resolvedBgType === 'animated' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleBgTypeChange('animated')}
              className="flex-1"
            >
              Animated
            </Button>
          </div>
        </div>
      )}

      {/* Direction Selection for Gradient/Animated */}
      {(bgType === 'gradient' || bgType === 'animated') && (
        <div className="mb-3">
          <Label className="text-sm text-muted-foreground mb-2 block">Direction</Label>
          <Select value={direction} onValueChange={handleDirectionChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="horizontal">Horizontal →</SelectItem>
              <SelectItem value="vertical">Vertical ↓</SelectItem>
              <SelectItem value="diagonal">Diagonal ↘</SelectItem>
              <SelectItem value="radial">Radial ◉</SelectItem>
              <SelectItem value="conic">Conic ◐</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Animation Selection for Animated */}
      {bgType === 'animated' && (
        <div className="mb-3">
          <Label className="text-sm text-muted-foreground mb-2 block">Animation Style</Label>
          <Select value={animation} onValueChange={handleAnimationChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="gradient">Gradient Flow</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
              <SelectItem value="wave">Wave</SelectItem>
              <SelectItem value="shimmer">Shimmer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Color Pickers */}
      {bgType === 'solid' ? (
        // Single color picker for solid type
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Color</Label>
            <input
              type="color"
              value={currentStart}
              onChange={(e) => handleStartColorChange(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
            />
          </div>
        </div>
      ) : (
        // Two color pickers for gradient/animated types
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Start</Label>
            <input
              type="color"
              value={currentStart}
              onChange={(e) => handleStartColorChange(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">End</Label>
            <input
              type="color"
              value={currentEnd}
              onChange={(e) => handleEndColorChange(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {bgType !== 'solid' && (
        <div className="mt-3">
          <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
          <div
            className={`h-12 rounded-lg border ${bgType === 'animated' ? 'animate-pulse' : ''}`}
            style={{
              background: generateGradientCSS(currentStart, currentEnd, direction),
            }}
          />
        </div>
      )}
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
