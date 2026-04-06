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
import { Textarea } from '@/components/ui/textarea';

import { FieldGroup } from '../field-group';
import { ThemeField } from '../theme-field';

interface QuoteConfigProps {
  quote: string;
  author: string;
  theme: string;
  textAlign?: string;
  authorAlign?: string;
  onQuoteChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onTextAlignChange?: (value: string) => void;
  onAuthorAlignChange?: (value: string) => void;
}

export function QuoteConfig({
  quote,
  author,
  theme,
  textAlign,
  authorAlign,
  onQuoteChange,
  onAuthorChange,
  onThemeChange,
  onTextAlignChange,
  onAuthorAlignChange,
}: QuoteConfigProps) {
  return (
    <>
      <FieldGroup>
        <Label>Custom Quote (optional)</Label>
        <Textarea
          value={quote}
          onChange={(e) => onQuoteChange(e.target.value)}
          placeholder="Leave empty for random quote"
          rows={3}
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Author (optional)</Label>
        <Input value={author} onChange={(e) => onAuthorChange(e.target.value)} />
      </FieldGroup>
      <ThemeField value={theme} onChange={onThemeChange} />
      <FieldGroup>
        <Label>Text Alignment</Label>
        <Select value={textAlign || 'center'} onValueChange={onTextAlignChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label>Author Alignment</Label>
        <Select value={authorAlign || 'center'} onValueChange={onAuthorAlignChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
    </>
  );
}
