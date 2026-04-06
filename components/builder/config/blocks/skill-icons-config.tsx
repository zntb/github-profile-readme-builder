'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { FieldGroup } from '../field-group';

interface SkillIconsConfigProps {
  icons: string[];
  perLine: number;
  theme: string;
  onIconsChange: (value: string[]) => void;
  onPerLineChange: (value: number) => void;
  onThemeChange: (value: string) => void;
  availableIcons: readonly string[];
}

export function SkillIconsConfig({
  icons,
  perLine,
  theme,
  onIconsChange,
  onPerLineChange,
  onThemeChange,
  availableIcons,
}: SkillIconsConfigProps) {
  return (
    <>
      <FieldGroup>
        <Label>Selected Icons ({icons.length})</Label>
        <div className="flex flex-wrap gap-1 p-2 rounded-md bg-muted max-h-32 overflow-y-auto">
          {icons.map((icon) => (
            <button
              key={icon}
              onClick={() => onIconsChange(icons.filter((i) => i !== icon))}
              className="px-2 py-0.5 text-xs rounded bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              {icon} ×
            </button>
          ))}
        </div>
      </FieldGroup>
      <FieldGroup>
        <Label>Add Icons</Label>
        <div className="flex flex-wrap gap-1 p-2 rounded-md bg-muted max-h-40 overflow-y-auto">
          {availableIcons
            .filter((icon) => !icons.includes(icon))
            .map((icon) => (
              <button
                key={icon}
                onClick={() => onIconsChange([...icons, icon])}
                className="px-2 py-0.5 text-xs rounded bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {icon}
              </button>
            ))}
        </div>
      </FieldGroup>
      <FieldGroup>
        <Label>Icons Per Line</Label>
        <Slider
          value={[perLine]}
          onValueChange={([v]) => onPerLineChange(v)}
          min={3}
          max={15}
          step={1}
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Theme</Label>
        <Select value={theme} onValueChange={onThemeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
    </>
  );
}
