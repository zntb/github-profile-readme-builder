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
import { Switch } from '@/components/ui/switch';

import { CardWidthField } from '../card-width-field';
import { FieldGroup } from '../field-group';
import { SimpleColorPicker } from '../gradient-color-picker';
import { ThemeField } from '../theme-field';

interface TopLanguagesConfigProps {
  layoutWidth: string;
  width: string;
  theme: string;
  layout: string;
  langs_count: number;
  hideBorder: boolean;
  hideProgress: boolean;
  bgColor: string | undefined;
  textColor: string | undefined;
  titleColor: string | undefined;
  onLayoutWidthChange: (value: string) => void;
  onWidthChange: (value: string | undefined) => void;
  onThemeChange: (value: string) => void;
  onLayoutChange: (value: string) => void;
  onLangsCountChange: (value: number) => void;
  onHideBorderChange: (value: boolean) => void;
  onHideProgressChange: (value: boolean) => void;
  onBgColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onTitleColorChange: (value: string) => void;
}

export function TopLanguagesConfig({
  layoutWidth,
  width,
  theme,
  layout,
  langs_count,
  hideBorder,
  hideProgress,
  bgColor,
  textColor,
  titleColor,
  onLayoutWidthChange,
  onWidthChange,
  onThemeChange,
  onLayoutChange,
  onLangsCountChange,
  onHideBorderChange,
  onHideProgressChange,
  onBgColorChange,
  onTextColorChange,
  onTitleColorChange,
}: TopLanguagesConfigProps) {
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
        <Label>Layout</Label>
        <Select value={layout} onValueChange={onLayoutChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="donut">Donut</SelectItem>
            <SelectItem value="donut-vertical">Donut Vertical</SelectItem>
            <SelectItem value="pie">Pie</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Languages Count ({langs_count})</Label>
        <Input
          type="number"
          value={langs_count}
          onChange={(e) => onLangsCountChange(parseInt(e.target.value) || 8)}
          min={1}
          max={20}
        />
      </FieldGroup>
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
        <div className="flex items-center justify-between">
          <Label>Hide Progress</Label>
          <Switch
            checked={Boolean(hideProgress)}
            onCheckedChange={(checked) => onHideProgressChange(checked)}
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
        label="Text Color"
        value={textColor ?? ''}
        onChange={onTextColorChange}
        placeholder="Grey"
      />
      <SimpleColorPicker
        label="Title Color"
        value={titleColor ?? ''}
        onChange={onTitleColorChange}
        placeholder="Grey"
      />
    </>
  );
}
