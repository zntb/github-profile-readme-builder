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

interface SupportLinkConfigProps {
  type: string;
  url: string;
  onTypeChange: (value: string) => void;
  onUrlChange: (value: string) => void;
}

export function SupportLinkConfig({
  type,
  url,
  onTypeChange,
  onUrlChange,
}: SupportLinkConfigProps) {
  return (
    <>
      <FieldGroup>
        <Label>Link Type</Label>
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feedback">Leave Feedback</SelectItem>
            <SelectItem value="coffee">Buy Me a Coffee</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Custom URL (optional)</Label>
        <Input
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={
            type === 'coffee'
              ? 'https://buymeacoffee.com/yourname'
              : 'https://github.com/yourname/issues'
          }
        />
      </FieldGroup>
    </>
  );
}
