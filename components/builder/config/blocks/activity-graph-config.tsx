'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { FieldGroup } from '../field-group';
import { SimpleColorPicker } from '../gradient-color-picker';
import { ThemeField } from '../theme-field';

interface ActivityGraphConfigProps {
  theme: string;
  hideBorder: boolean;
  bgColor: string | undefined;
  color: string | undefined;
  lineColor: string | undefined;
  pointColor: string | undefined;
  areaColor: string | undefined;
  onThemeChange: (value: string) => void;
  onHideBorderChange: (value: boolean) => void;
  onBgColorChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onLineColorChange: (value: string) => void;
  onPointColorChange: (value: string) => void;
  onAreaColorChange: (value: string) => void;
}

export function ActivityGraphConfig({
  theme,
  hideBorder,
  bgColor,
  color,
  lineColor,
  pointColor,
  areaColor,
  onThemeChange,
  onHideBorderChange,
  onBgColorChange,
  onColorChange,
  onLineColorChange,
  onPointColorChange,
  onAreaColorChange,
}: ActivityGraphConfigProps) {
  return (
    <>
      <ThemeField value={theme} onChange={onThemeChange} />
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Border</Label>
          <Switch
            checked={Boolean(hideBorder)}
            onCheckedChange={(checked) => onHideBorderChange(checked)}
          />
        </div>
      </FieldGroup>
      <SimpleColorPicker
        label="Background Color"
        value={bgColor ?? ''}
        onChange={onBgColorChange}
        placeholder="Transparent"
      />
      <SimpleColorPicker
        label="Line Color"
        value={color ?? ''}
        onChange={onColorChange}
        placeholder="39D353"
      />
      <SimpleColorPicker
        label="Point Color"
        value={lineColor ?? ''}
        onChange={onLineColorChange}
        placeholder="39D353"
      />
      <SimpleColorPicker
        label="Point Border Color"
        value={pointColor ?? ''}
        onChange={onPointColorChange}
        placeholder="39D353"
      />
      <SimpleColorPicker
        label="Area Color"
        value={areaColor ?? ''}
        onChange={onAreaColorChange}
        placeholder="39D353"
      />
    </>
  );
}
