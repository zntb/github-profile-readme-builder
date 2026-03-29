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
import { GradientColorPicker } from '../gradient-color-picker';

interface CapsuleHeaderConfigProps {
  text: string;
  type: string;
  section: string;
  color: string;
  height: number;
  onTextChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onHeightChange: (value: number) => void;
}

export function CapsuleHeaderConfig({
  text,
  type,
  section,
  color,
  height,
  onTextChange,
  onTypeChange,
  onSectionChange,
  onColorChange,
  onHeightChange,
}: CapsuleHeaderConfigProps) {
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
      <GradientColorPicker label="Gradient Colors" value={color} onChange={onColorChange} />
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
    </>
  );
}
