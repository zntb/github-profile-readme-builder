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

interface CapsuleHeaderConfigProps {
  text: string;
  type: string;
  section: string;
  height: number;
  fontSize?: number;
  fontColor?: string;
  bgType?: BackgroundType;
  bgGradientDirection?: GradientDirection;
  bgAnimation?: AnimationType;
  bgStartColor?: string;
  bgEndColor?: string;
  bgSolidColor?: string;
  onTextChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onHeightChange: (value: number) => void;
  onFontSizeChange?: (value: number) => void;
  onFontColorChange?: (value: string) => void;
  onBgTypeChange?: (value: BackgroundType) => void;
  onBgGradientDirectionChange?: (value: GradientDirection) => void;
  onBgAnimationChange?: (value: AnimationType) => void;
  onBgStartColorChange?: (value: string) => void;
  onBgEndColorChange?: (value: string) => void;
  onBgSolidColorChange?: (value: string) => void;
}

export function CapsuleHeaderConfig({
  text,
  type,
  section,
  height,
  fontSize = 30,
  fontColor = 'ffffff',
  bgType = 'gradient',
  bgGradientDirection = 'horizontal',
  bgAnimation = 'none',
  bgStartColor = 'EEFF00',
  bgEndColor = 'a82DA',
  // bgSolidColor = 'transparent',
  onTextChange,
  onTypeChange,
  onSectionChange,
  onHeightChange,
  onFontSizeChange,
  onFontColorChange,
  onBgTypeChange,
  onBgGradientDirectionChange,
  onBgAnimationChange,
  onBgStartColorChange,
  onBgEndColorChange,
  onBgSolidColorChange,
}: CapsuleHeaderConfigProps) {
  // Build gradient value for the color picker - always use full format for GradientColorPicker
  const gradientValue = `${bgType}:${bgGradientDirection}:${bgAnimation}:${bgStartColor}:${bgEndColor}`;

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
        const newBgType = parts[0] as BackgroundType;
        onBgTypeChange(newBgType);
        onBgGradientDirectionChange(parts[1] as GradientDirection);
        onBgAnimationChange(parts[2] as AnimationType);
        onBgStartColorChange(parts[3]);
        onBgEndColorChange(parts[4]);

        // Handle solid color change
        if (newBgType === 'solid' && onBgSolidColorChange) {
          onBgSolidColorChange(parts[3]);
        }
      }
    }
  };

  return (
    <>
      <FieldGroup>
        <Label>Text</Label>
        <Input value={text} onChange={(e) => onTextChange(e.target.value)} />
      </FieldGroup>
      <FieldGroup>
        <Label>Animation Type</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="waving">Waving</SelectItem>
            <SelectItem value="typing">Typing</SelectItem>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="cylinder">Cylinder</SelectItem>
            <SelectItem value="rect">Rectangle</SelectItem>
            <SelectItem value="soft">Soft</SelectItem>
            <SelectItem value="slice">Slice</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Section</Label>
        <Select value={section} onValueChange={onSectionChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="header">Header</SelectItem>
            <SelectItem value="footer">Footer</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      {/* Background Settings */}
      <div className="border-t pt-4 mt-4">
        <Label className="text-sm font-semibold mb-3 block">Background</Label>

        <GradientColorPicker
          label="Colors"
          value={gradientValue}
          onChange={handleGradientChange}
          enableAnimation={true}
        />
      </div>

      <FieldGroup>
        <Label>Height</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={height}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                onHeightChange(val);
              }
            }}
            min={50}
            max={500}
            className="w-20"
          />
          <span className="flex items-center text-sm text-muted-foreground">px</span>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label>Font Size</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                onFontSizeChange?.(val);
              }
            }}
            min={10}
            max={100}
            className="w-20"
          />
          <span className="flex items-center text-sm text-muted-foreground">px</span>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label>Font Color</Label>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={`#${fontColor}`}
              onChange={(e) => {
                onFontColorChange?.(e.target.value.replace('#', ''));
              }}
              className="w-10 h-10 rounded border cursor-pointer bg-transparent"
            />
            <Input
              value={fontColor}
              onChange={(e) => {
                onFontColorChange?.(e.target.value.replace('#', ''));
              }}
              className="w-28"
              maxLength={6}
            />
          </div>
        </div>
      </FieldGroup>
    </>
  );
}
