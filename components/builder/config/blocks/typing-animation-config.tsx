'use client';

import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FieldGroup } from '../field-group';
import { SimpleColorPicker } from '../gradient-color-picker';

interface TypingAnimationConfigProps {
  lines: string[];
  color: string;
  width: number | undefined;
  height: number | undefined;
  speed: number | undefined;
  onLinesChange: (value: string[]) => void;
  onColorChange: (value: string) => void;
  onWidthChange: (value: number | undefined) => void;
  onHeightChange: (value: number | undefined) => void;
  onSpeedChange: (value: number | undefined) => void;
}

export function TypingAnimationConfig({
  lines,
  color,
  width,
  height,
  speed,
  onLinesChange,
  onColorChange,
  onWidthChange,
  onHeightChange,
  onSpeedChange,
}: TypingAnimationConfigProps) {
  return (
    <>
      <FieldGroup>
        <Label>Lines</Label>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={line}
                onChange={(e) => {
                  const newLines = [...lines];
                  newLines[i] = e.target.value;
                  onLinesChange(newLines);
                }}
              />
              {lines.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    const newLines = lines.filter((_, idx) => idx !== i);
                    onLinesChange(newLines);
                  }}
                  aria-label="Remove line"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onLinesChange([...lines, 'New line'])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </div>
      </FieldGroup>
      <SimpleColorPicker
        label="Color"
        value={color}
        onChange={onColorChange}
        placeholder="36BCF7"
      />
      <FieldGroup>
        <Label>Width (px)</Label>
        <Input
          type="number"
          value={width ?? ''}
          onChange={(e) => onWidthChange(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 400"
          min={100}
          max={800}
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Height (px)</Label>
        <Input
          type="number"
          value={height ?? ''}
          onChange={(e) => onHeightChange(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 30"
          min={20}
          max={100}
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Speed</Label>
        <Input
          type="number"
          value={speed ?? ''}
          onChange={(e) => onSpeedChange(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="e.g., 50"
          min={10}
          max={200}
        />
      </FieldGroup>
    </>
  );
}
