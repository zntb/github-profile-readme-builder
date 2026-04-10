'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { CardWidthField } from '../card-width-field';
import { FieldGroup } from '../field-group';
import { SimpleColorPicker } from '../gradient-color-picker';
import { ThemeField } from '../theme-field';

interface StreakStatsConfigProps {
  layoutWidth: string;
  width: string;
  theme: string;
  hideBorder: boolean;
  borderRadius: number;
  bgColor: string | undefined;
  fireColor: string | undefined;
  ringColor: string | undefined;
  currStreakColor: string | undefined;
  sideNumColor: string | undefined;
  sideLabelColor: string | undefined;
  datesColor: string | undefined;
  onLayoutWidthChange: (value: string) => void;
  onWidthChange: (value: string | undefined) => void;
  onThemeChange: (value: string) => void;
  onHideBorderChange: (value: boolean) => void;
  onBorderRadiusChange: (value: number) => void;
  onBgColorChange: (value: string) => void;
  onFireColorChange: (value: string) => void;
  onRingColorChange: (value: string) => void;
  onCurrStreakColorChange: (value: string) => void;
  onSideNumColorChange: (value: string) => void;
  onSideLabelColorChange: (value: string) => void;
  onDatesColorChange: (value: string) => void;
}

export function StreakStatsConfig({
  layoutWidth,
  width,
  theme,
  hideBorder,
  borderRadius,
  bgColor,
  fireColor,
  ringColor,
  currStreakColor,
  sideNumColor,
  sideLabelColor,
  datesColor,
  onLayoutWidthChange,
  onWidthChange,
  onThemeChange,
  onHideBorderChange,
  onBorderRadiusChange,
  onBgColorChange,
  onFireColorChange,
  onRingColorChange,
  onCurrStreakColorChange,
  onSideNumColorChange,
  onSideLabelColorChange,
  onDatesColorChange,
}: StreakStatsConfigProps) {
  return (
    <>
      <CardWidthField
        layoutWidth={layoutWidth}
        width={width}
        onLayoutWidthChange={onLayoutWidthChange}
        onWidthChange={onWidthChange}
      />
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
      <FieldGroup>
        <Label>Border Radius ({borderRadius}px)</Label>
        <Input
          type="number"
          value={borderRadius}
          onChange={(e) => onBorderRadiusChange(parseInt(e.target.value) || 10)}
          min={0}
          max={20}
        />
      </FieldGroup>
      <SimpleColorPicker
        label="Background Color"
        value={bgColor ?? ''}
        onChange={onBgColorChange}
        placeholder="Transparent"
      />
      <SimpleColorPicker
        label="Fire Color"
        value={fireColor ?? ''}
        onChange={onFireColorChange}
        placeholder="FF6C6C"
      />
      <SimpleColorPicker
        label="Ring Color"
        value={ringColor ?? ''}
        onChange={onRingColorChange}
        placeholder="FF6C6C"
      />
      <SimpleColorPicker
        label="Current Streak Number Color"
        value={currStreakColor ?? ''}
        onChange={onCurrStreakColorChange}
        placeholder="FF6C6C"
      />
      <SimpleColorPicker
        label="Side Numbers Color"
        value={sideNumColor ?? ''}
        onChange={onSideNumColorChange}
        placeholder="FF6C6C"
      />
      <SimpleColorPicker
        label="Side Labels Color"
        value={sideLabelColor ?? ''}
        onChange={onSideLabelColorChange}
        placeholder="FF6C6C"
      />
      <SimpleColorPicker
        label="Dates Color"
        value={datesColor ?? ''}
        onChange={onDatesColorChange}
        placeholder="FF6C6C"
      />
    </>
  );
}
