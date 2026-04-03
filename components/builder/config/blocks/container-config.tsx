'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { FieldGroup } from '../field-group';
import {
  GradientColorPicker,
  type AnimationType,
  type BackgroundType,
  type GradientDirection,
} from '../gradient-color-picker';

interface ContainerConfigProps {
  alignment: string;
  direction: string;
  gap: number;
  bgType?: BackgroundType;
  bgGradientDirection?: GradientDirection;
  bgAnimation?: AnimationType;
  bgStartColor?: string;
  bgEndColor?: string;
  bgSolidColor?: string;
  onAlignmentChange: (value: string) => void;
  onDirectionChange: (value: string) => void;
  onGapChange: (value: number) => void;
  onBgTypeChange?: (value: BackgroundType) => void;
  onBgGradientDirectionChange?: (value: GradientDirection) => void;
  onBgAnimationChange?: (value: AnimationType) => void;
  onBgStartColorChange?: (value: string) => void;
  onBgEndColorChange?: (value: string) => void;
  onBgSolidColorChange?: (value: string) => void;
}

export function ContainerConfig({
  alignment,
  direction,
  gap,
  bgType = 'solid',
  bgGradientDirection = 'horizontal',
  bgAnimation = 'none',
  bgStartColor = 'EEFF00',
  bgEndColor = 'a82DA',
  bgSolidColor = 'transparent',
  onAlignmentChange,
  onDirectionChange,
  onGapChange,
  onBgTypeChange,
  onBgGradientDirectionChange,
  onBgAnimationChange,
  onBgStartColorChange,
  onBgEndColorChange,
  onBgSolidColorChange,
}: ContainerConfigProps) {
  // Build gradient value for the color picker
  const gradientValue =
    bgType === 'solid'
      ? bgSolidColor
      : `${bgType}:${bgGradientDirection}:${bgAnimation}:${bgStartColor}:${bgEndColor}`;

  const handleGradientChange = (value: string) => {
    if (
      onBgTypeChange &&
      onBgGradientDirectionChange &&
      onBgAnimationChange &&
      onBgStartColorChange &&
      onBgEndColorChange
    ) {
      const parts = value.split(':');
      if (parts.length >= 5) {
        onBgTypeChange(parts[0] as BackgroundType);
        onBgGradientDirectionChange(parts[1] as GradientDirection);
        onBgAnimationChange(parts[2] as AnimationType);
        onBgStartColorChange(parts[3]);
        onBgEndColorChange(parts[4]);
      }
    }
  };

  const handleSolidColorChange = (value: string) => {
    if (onBgSolidColorChange) {
      onBgSolidColorChange(value);
    }
  };

  return (
    <>
      <FieldGroup>
        <Label>Alignment</Label>
        <Select value={alignment} onValueChange={onAlignmentChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Direction</Label>
        <Select value={direction} onValueChange={onDirectionChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="column">Column</SelectItem>
            <SelectItem value="row">Row</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Gap ({gap}px)</Label>
        <Input
          type="number"
          min={0}
          max={48}
          step={4}
          value={gap}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              onGapChange(Math.min(48, Math.max(0, val)));
            }
          }}
        />
      </FieldGroup>

      {/* Background Settings */}
      <div className="border-t pt-4 mt-4">
        <Label className="text-sm font-semibold mb-3 block">Background</Label>

        {bgType === 'solid' ? (
          <FieldGroup>
            <Label className="text-sm text-muted-foreground">Solid Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={
                  bgSolidColor === 'transparent'
                    ? '#ffffff'
                    : bgSolidColor.startsWith('#')
                      ? bgSolidColor
                      : `#${bgSolidColor}`
                }
                onChange={(e) => handleSolidColorChange(e.target.value.replace('#', ''))}
                className="h-9 w-14 cursor-pointer rounded border border-input bg-background p-1"
              />
              <Select value={bgSolidColor} onValueChange={handleSolidColorChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="ffffff">White</SelectItem>
                  <SelectItem value="f8f9fa">Light Gray</SelectItem>
                  <SelectItem value="e9ecef">Gray</SelectItem>
                  <SelectItem value="dee2e6">Dark Gray</SelectItem>
                  <SelectItem value="000000">Black</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FieldGroup>
        ) : (
          <GradientColorPicker
            label="Colors"
            value={gradientValue}
            onChange={handleGradientChange}
            enableAnimation={bgType === 'animated'}
          />
        )}
      </div>
    </>
  );
}
