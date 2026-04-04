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

interface CornerRadii {
  tl: number;
  tr: number;
  br: number;
  bl: number;
}

interface FooterBannerConfigProps {
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
  borderRadiusTL?: number;
  borderRadiusTR?: number;
  borderRadiusBR?: number;
  borderRadiusBL?: number;
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
  onBorderRadiusTLChange?: (value: number) => void;
  onBorderRadiusTRChange?: (value: number) => void;
  onBorderRadiusBRChange?: (value: number) => void;
  onBorderRadiusBLChange?: (value: number) => void;
}

/** Compute default corner radii from type + section (mirrors the API logic). */
function defaultRadii(type: string, section: string, height: number): CornerRadii {
  const maxR = Math.floor(height / 2);
  if (type === 'rect') return { tl: 8, tr: 8, br: 8, bl: 8 };
  if (type === 'cylinder') return { tl: maxR, tr: maxR, br: maxR, bl: maxR };
  if (type === 'soft') return { tl: 36, tr: 36, br: 36, bl: 36 };
  if (type === 'waving') {
    // Footer banner always uses rounded bottom corners (like Capsule Header header section)
    return { tl: 0, tr: 0, br: 24, bl: 24 };
  }
  return { tl: 0, tr: 0, br: 0, bl: 0 };
}

interface CornerInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}

function CornerInput({ label, value, onChange, max }: CornerInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide text-center">
        {label}
      </span>
      <Input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(0, v)));
        }}
        className="h-8 text-center px-1 text-sm"
      />
    </div>
  );
}

export function FooterBannerConfig({
  text,
  type,
  section = 'footer',
  height,
  fontSize = 24,
  fontColor = 'ffffff',
  bgType = 'gradient',
  bgGradientDirection = 'horizontal',
  bgAnimation = 'none',
  bgStartColor = '3B82F6',
  bgEndColor = '8B5CF6',
  bgSolidColor = '3B82F6',
  borderRadiusTL,
  borderRadiusTR,
  borderRadiusBR,
  borderRadiusBL,
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
  onBorderRadiusTLChange,
  onBorderRadiusTRChange,
  onBorderRadiusBRChange,
  onBorderRadiusBLChange,
}: FooterBannerConfigProps) {
  const defaults = defaultRadii(type, section, height);
  const maxR = Math.floor(height / 2);

  const tl = borderRadiusTL ?? defaults.tl;
  const tr = borderRadiusTR ?? defaults.tr;
  const br = borderRadiusBR ?? defaults.br;
  const bl = borderRadiusBL ?? defaults.bl;

  // Build gradient value for the color picker
  const startColor = bgType === 'solid' ? bgSolidColor : bgStartColor;
  const gradientValue = `${bgType}:${bgGradientDirection}:${bgAnimation}:${startColor}:${bgEndColor}`;

  const handleGradientChange = (value: string) => {
    const parts = value.split(':');
    if (parts.length >= 5) {
      const newBgType = parts[0] as BackgroundType;
      onBgTypeChange?.(newBgType);
      onBgGradientDirectionChange?.(parts[1] as GradientDirection);
      onBgAnimationChange?.(parts[2] as AnimationType);
      onBgStartColorChange?.(parts[3]);
      onBgEndColorChange?.(parts[4]);
      if (newBgType === 'solid') onBgSolidColorChange?.(parts[3]);
    }
  };

  // Reset corner radii to defaults for the current type+section
  const handleTypeChange = (newType: string) => {
    onTypeChange(newType);
    const d = defaultRadii(newType, section, height);
    onBorderRadiusTLChange?.(d.tl);
    onBorderRadiusTRChange?.(d.tr);
    onBorderRadiusBRChange?.(d.br);
    onBorderRadiusBLChange?.(d.bl);
  };

  const handleHeightChange = (newHeight: number) => {
    onHeightChange(newHeight);
    // Adjust border radii if they exceed the new maximum
    const newMaxR = Math.floor(newHeight / 2);
    if (tl > newMaxR) onBorderRadiusTLChange?.(newMaxR);
    if (tr > newMaxR) onBorderRadiusTRChange?.(newMaxR);
    if (br > newMaxR) onBorderRadiusBRChange?.(newMaxR);
    if (bl > newMaxR) onBorderRadiusBLChange?.(newMaxR);
  };

  return (
    <>
      <FieldGroup>
        <Label>Text</Label>
        <Input value={text} onChange={(e) => onTextChange(e.target.value)} />
      </FieldGroup>

      <FieldGroup>
        <Label>Shape</Label>
        <Select value={type} onValueChange={handleTypeChange}>
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
            <SelectItem value="header">Header (rounded bottom)</SelectItem>
            <SelectItem value="footer">Footer (rounded top)</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      {/* Background Settings */}
      <div className="border-t pt-4 mt-1">
        <Label className="text-sm font-semibold mb-3 block">Background</Label>
        <GradientColorPicker
          label="Colors"
          value={gradientValue}
          onChange={handleGradientChange}
          enableAnimation
        />
      </div>

      <FieldGroup>
        <Label>Height (px)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={height}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) handleHeightChange(v);
            }}
            min={50}
            max={500}
            className="w-24"
          />
          <span className="flex items-center text-sm text-muted-foreground">px</span>
        </div>
      </FieldGroup>

      {/* ── Per-corner Border Radius ─────────────────────────── */}
      {type !== 'slice' && (
        <FieldGroup>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-semibold">Corner Radii (px)</Label>
            <button
              type="button"
              onClick={() => {
                const d = defaultRadii(type, section, height);
                onBorderRadiusTLChange?.(d.tl);
                onBorderRadiusTRChange?.(d.tr);
                onBorderRadiusBRChange?.(d.br);
                onBorderRadiusBLChange?.(d.bl);
              }}
              className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Reset to defaults
            </button>
          </div>

          {/* Visual corner layout */}
          <div className="relative rounded-lg border border-border/50 bg-muted/20 p-3">
            {/* Corner preview shape */}
            <div
              className="mx-auto mb-3 w-24 h-14 bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] text-muted-foreground"
              style={{
                borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
              }}
            >
              preview
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {/* Top row */}
              <CornerInput
                label="↖ Top-left"
                value={tl}
                max={maxR}
                onChange={(v) => onBorderRadiusTLChange?.(v)}
              />
              <CornerInput
                label="Top-right ↗"
                value={tr}
                max={maxR}
                onChange={(v) => onBorderRadiusTRChange?.(v)}
              />
              {/* Bottom row */}
              <CornerInput
                label="↙ Bottom-left"
                value={bl}
                max={maxR}
                onChange={(v) => onBorderRadiusBLChange?.(v)}
              />
              <CornerInput
                label="Bottom-right ↘"
                value={br}
                max={maxR}
                onChange={(v) => onBorderRadiusBRChange?.(v)}
              />
            </div>

            {/* Link all corners button */}
            <button
              type="button"
              onClick={() => {
                onBorderRadiusTLChange?.(tl);
                onBorderRadiusTRChange?.(tl);
                onBorderRadiusBRChange?.(tl);
                onBorderRadiusBLChange?.(tl);
              }}
              className="mt-3 w-full text-[11px] text-muted-foreground hover:text-foreground border border-dashed border-border/60 rounded-md py-1 hover:border-primary/40 transition-colors"
            >
              Set all corners to top-left value ({tl}px)
            </button>
          </div>
        </FieldGroup>
      )}

      <FieldGroup>
        <Label>Font Size (px)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={fontSize}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v > 0) onFontSizeChange?.(v);
            }}
            min={10}
            max={100}
            className="w-24"
          />
          <span className="flex items-center text-sm text-muted-foreground">px</span>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label>Font Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={`#${fontColor}`}
            onChange={(e) => onFontColorChange?.(e.target.value.replace('#', ''))}
            className="w-10 h-10 rounded border cursor-pointer bg-transparent"
          />
          <Input
            value={fontColor}
            onChange={(e) => onFontColorChange?.(e.target.value.replace('#', ''))}
            className="w-28"
            maxLength={6}
          />
        </div>
      </FieldGroup>
    </>
  );
}
