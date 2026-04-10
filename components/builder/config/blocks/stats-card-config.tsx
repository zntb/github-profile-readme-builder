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

interface StatsCardConfigProps {
  layoutStyle: 'standard' | 'compact';
  layoutWidth: string;
  width: string;
  theme: string;
  showIcons: boolean;
  hideBorder: boolean;
  hideTitle: boolean;
  hideRank: boolean;
  borderRadius: number;
  bgColor: string | undefined;
  textColor: string | undefined;
  titleColor: string | undefined;
  iconColor: string | undefined;
  onLayoutStyleChange: (value: 'standard' | 'compact') => void;
  onLayoutWidthChange: (value: string) => void;
  onWidthChange: (value: string | undefined) => void;
  onThemeChange: (value: string) => void;
  onShowIconsChange: (value: boolean) => void;
  onHideBorderChange: (value: boolean) => void;
  onHideTitleChange: (value: boolean) => void;
  onHideRankChange: (value: boolean) => void;
  onBorderRadiusChange: (value: number) => void;
  onBgColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onTitleColorChange: (value: string) => void;
  onIconColorChange: (value: string) => void;
}

export function StatsCardConfig({
  layoutStyle,
  layoutWidth,
  width,
  theme,
  showIcons,
  hideBorder,
  hideTitle,
  hideRank,
  borderRadius,
  bgColor,
  textColor,
  titleColor,
  iconColor,
  onLayoutStyleChange,
  onLayoutWidthChange,
  onWidthChange,
  onThemeChange,
  onShowIconsChange,
  onHideBorderChange,
  onHideTitleChange,
  onHideRankChange,
  onBorderRadiusChange,
  onBgColorChange,
  onTextColorChange,
  onTitleColorChange,
  onIconColorChange,
}: StatsCardConfigProps) {
  return (
    <>
      {/* Card style variant */}
      <FieldGroup>
        <Label>Card Style</Label>
        <Select
          value={layoutStyle}
          onValueChange={(v) => onLayoutStyleChange(v as 'standard' | 'compact')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard — list view (195 px tall)</SelectItem>
            <SelectItem value="compact">Compact — grid view (305 px tall)</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>

      <CardWidthField
        layoutWidth={layoutWidth}
        width={width}
        onLayoutWidthChange={onLayoutWidthChange}
        onWidthChange={onWidthChange}
      />
      <ThemeField value={theme} onChange={onThemeChange} />
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Show Icons</Label>
          <Switch
            checked={Boolean(showIcons)}
            onCheckedChange={(checked) => onShowIconsChange(checked)}
          />
        </div>
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
          <Label>Hide Title</Label>
          <Switch
            checked={Boolean(hideTitle)}
            onCheckedChange={(checked) => onHideTitleChange(checked)}
          />
        </div>
      </FieldGroup>
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Rank</Label>
          <Switch
            checked={Boolean(hideRank)}
            onCheckedChange={(checked) => onHideRankChange(checked)}
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
      <SimpleColorPicker
        label="Icon Color"
        value={iconColor ?? ''}
        onChange={onIconColorChange}
        placeholder="Grey"
      />
    </>
  );
}
