'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FieldGroup } from '../field-group';

interface AvatarConfigProps {
  imageUrl: string;
  size: number;
  borderRadius: number;
  borderColor?: string;
  onImageUrlChange: (value: string) => void;
  onSizeChange: (value: number) => void;
  onBorderRadiusChange: (value: number) => void;
  onBorderColorChange: (value: string) => void;
}

export function AvatarConfig({
  imageUrl,
  size,
  borderRadius,
  borderColor,
  onImageUrlChange,
  onSizeChange,
  onBorderRadiusChange,
  onBorderColorChange,
}: AvatarConfigProps) {
  return (
    <>
      <FieldGroup>
        <Label>Image URL</Label>
        <Input value={imageUrl} onChange={(e) => onImageUrlChange(e.target.value)} />
      </FieldGroup>
      <FieldGroup>
        <Label>Size</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={size}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) {
                onSizeChange(val);
              }
            }}
            min={50}
            max={300}
            className="w-20"
          />
          <span className="flex items-center text-sm text-muted-foreground">px</span>
        </div>
      </FieldGroup>
      <FieldGroup>
        <Label>Border Radius</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={borderRadius}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) {
                onBorderRadiusChange(Math.min(50, val));
              }
            }}
            min={0}
            max={50}
            className="w-20"
          />
          <span className="flex items-center text-sm text-muted-foreground">%</span>
        </div>
      </FieldGroup>
      <FieldGroup>
        <Label>Border Color</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="color"
            value={borderColor || '#000000'}
            onChange={(e) => onBorderColorChange(e.target.value)}
            className="w-10 h-10 p-1 cursor-pointer"
          />
          <Input
            value={borderColor || ''}
            onChange={(e) => onBorderColorChange(e.target.value)}
            placeholder="#000000"
            className="w-24"
          />
        </div>
      </FieldGroup>
    </>
  );
}
