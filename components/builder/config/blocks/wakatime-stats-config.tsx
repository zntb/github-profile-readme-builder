'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { CardWidthField } from '../card-width-field';
import { FieldGroup } from '../field-group';
import { SimpleColorPicker } from '../gradient-color-picker';
import { ThemeField } from '../theme-field';

interface WakatimeStatsConfigProps {
  layoutWidth: string;
  width: string;
  username: string;
  theme: string;
  hideBorder: boolean;
  hideTitle: boolean;
  hideRecent: boolean;
  hideEditors: boolean;
  hideLanguages: boolean;
  hideOperatingSystems: boolean;
  borderRadius: number;
  bgColor: string | undefined;
  textColor: string | undefined;
  titleColor: string | undefined;
  onLayoutWidthChange: (value: string) => void;
  onWidthChange: (value: string | undefined) => void;
  onUsernameChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onHideBorderChange: (value: boolean) => void;
  onHideTitleChange: (value: boolean) => void;
  onHideRecentChange: (value: boolean) => void;
  onHideEditorsChange: (value: boolean) => void;
  onHideLanguagesChange: (value: boolean) => void;
  onHideOperatingSystemsChange: (value: boolean) => void;
  onBorderRadiusChange: (value: number) => void;
  onBgColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onTitleColorChange: (value: string) => void;
}

export function WakatimeStatsConfig({
  layoutWidth,
  width,
  username,
  theme,
  hideBorder,
  hideTitle,
  hideRecent,
  hideEditors,
  hideLanguages,
  hideOperatingSystems,
  borderRadius,
  bgColor,
  textColor,
  titleColor,
  onLayoutWidthChange,
  onWidthChange,
  onUsernameChange,
  onThemeChange,
  onHideBorderChange,
  onHideTitleChange,
  onHideRecentChange,
  onHideEditorsChange,
  onHideLanguagesChange,
  onHideOperatingSystemsChange,
  onBorderRadiusChange,
  onBgColorChange,
  onTextColorChange,
  onTitleColorChange,
}: WakatimeStatsConfigProps) {
  return (
    <>
      {/* Card Width */}
      <CardWidthField
        layoutWidth={layoutWidth}
        width={width}
        onLayoutWidthChange={onLayoutWidthChange}
        onWidthChange={onWidthChange}
      />

      {/* Username */}
      <FieldGroup>
        <Label>Wakatime Username</Label>
        <Input
          placeholder="Leave empty to use GitHub username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
        />
      </FieldGroup>

      {/* Theme */}
      <FieldGroup>
        <Label>Theme</Label>
        <ThemeField value={theme} onChange={onThemeChange} />
      </FieldGroup>

      {/* Border */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Border</Label>
          <Switch checked={hideBorder} onCheckedChange={onHideBorderChange} />
        </div>
      </FieldGroup>

      {/* Border Radius */}
      <FieldGroup>
        <Label>Border Radius</Label>
        <Input
          type="number"
          min={0}
          max={20}
          value={borderRadius}
          onChange={(e) => onBorderRadiusChange(Number(e.target.value))}
        />
      </FieldGroup>

      {/* Hide Title */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Title</Label>
          <Switch checked={hideTitle} onCheckedChange={onHideTitleChange} />
        </div>
      </FieldGroup>

      {/* Hide Recent */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Recent Stats</Label>
          <Switch checked={hideRecent} onCheckedChange={onHideRecentChange} />
        </div>
      </FieldGroup>

      {/* Hide Editors */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Editors</Label>
          <Switch checked={hideEditors} onCheckedChange={onHideEditorsChange} />
        </div>
      </FieldGroup>

      {/* Hide Languages */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Languages</Label>
          <Switch checked={hideLanguages} onCheckedChange={onHideLanguagesChange} />
        </div>
      </FieldGroup>

      {/* Hide Operating Systems */}
      <FieldGroup>
        <div className="flex items-center justify-between">
          <Label>Hide Operating Systems</Label>
          <Switch checked={hideOperatingSystems} onCheckedChange={onHideOperatingSystemsChange} />
        </div>
      </FieldGroup>

      {/* Background Color */}
      <FieldGroup>
        <Label>Background Color</Label>
        <SimpleColorPicker
          label="Background Color"
          value={bgColor || ''}
          onChange={onBgColorChange}
        />
      </FieldGroup>

      {/* Text Color */}
      <FieldGroup>
        <Label>Text Color</Label>
        <SimpleColorPicker
          label="Text Color"
          value={textColor || ''}
          onChange={onTextColorChange}
        />
      </FieldGroup>

      {/* Title Color */}
      <FieldGroup>
        <Label>Title Color</Label>
        <SimpleColorPicker
          label="Title Color"
          value={titleColor || ''}
          onChange={onTitleColorChange}
        />
      </FieldGroup>
    </>
  );
}
