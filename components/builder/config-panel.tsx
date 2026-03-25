'use client';

import { X, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useBuilderStore, findBlock } from '@/lib/store';
import { STATS_THEMES, SKILL_ICONS, type Block } from '@/lib/types';

export function ConfigPanel() {
  const { blocks, selectedBlockId, selectBlock, updateBlock } = useBuilderStore();

  if (!selectedBlockId) {
    return (
      <div className="flex h-full w-full flex-col border-l border-border bg-sidebar">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold text-sidebar-foreground">Configuration</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select a block to configure its properties
          </p>
        </div>
      </div>
    );
  }

  const selectedBlock = findBlock(blocks, selectedBlockId);
  if (!selectedBlock) return null;

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          {selectedBlock.type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </h2>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => selectBlock(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <BlockConfigFields block={selectedBlock} updateBlock={updateBlock} />
        </div>
      </ScrollArea>
    </div>
  );
}

interface BlockConfigFieldsProps {
  block: Block;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
}

function BlockConfigFields({ block, updateBlock }: BlockConfigFieldsProps) {
  const { type, props, id } = block;

  const update = (key: string, value: unknown) => {
    updateBlock(id, { [key]: value });
  };

  switch (type) {
    case 'container':
      return (
        <>
          <FieldGroup>
            <Label>Alignment</Label>
            <Select value={props.alignment as string} onValueChange={(v) => update('alignment', v)}>
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
            <Label>Direction</Label>
            <Select value={props.direction as string} onValueChange={(v) => update('direction', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="column">Column</SelectItem>
                <SelectItem value="row">Row</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Gap ({String(props.gap)}px)</Label>
            <Slider
              value={[props.gap as number]}
              onValueChange={([v]) => update('gap', v)}
              min={0}
              max={48}
              step={4}
            />
          </FieldGroup>
        </>
      );

    case 'divider':
      return (
        <>
          <FieldGroup>
            <Label>Type</Label>
            <Select value={props.type as string} onValueChange={(v) => update('type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          {props.type === 'gif' && (
            <FieldGroup>
              <Label>GIF URL</Label>
              <Input
                value={(props.gifUrl as string) || ''}
                onChange={(e) => update('gifUrl', e.target.value)}
                placeholder="https://..."
              />
            </FieldGroup>
          )}
        </>
      );

    case 'spacer':
      return (
        <FieldGroup>
          <Label>Height ({String(props.height)}px)</Label>
          <Slider
            value={[props.height as number]}
            onValueChange={([v]) => update('height', v)}
            min={10}
            max={100}
            step={5}
          />
        </FieldGroup>
      );

    case 'capsule-header':
      return (
        <>
          <FieldGroup>
            <Label>Text</Label>
            <Input value={props.text as string} onChange={(e) => update('text', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Animation Type</Label>
            <Select value={props.type as string} onValueChange={(v) => update('type', v)}>
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
            <Select value={props.section as string} onValueChange={(v) => update('section', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Color (gradient)</Label>
            <Input
              value={props.color as string}
              onChange={(e) => update('color', e.target.value)}
              placeholder="0:EEFF00,100:a82DA"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Height ({String(props.height)}px)</Label>
            <Slider
              value={[props.height as number]}
              onValueChange={([v]) => update('height', v)}
              min={100}
              max={400}
              step={20}
            />
          </FieldGroup>
        </>
      );

    case 'avatar':
      return (
        <>
          <FieldGroup>
            <Label>Image URL</Label>
            <Input
              value={props.imageUrl as string}
              onChange={(e) => update('imageUrl', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Size ({String(props.size)}px)</Label>
            <Slider
              value={[props.size as number]}
              onValueChange={([v]) => update('size', v)}
              min={50}
              max={300}
              step={10}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Border Radius ({String(props.borderRadius)}%)</Label>
            <Slider
              value={[props.borderRadius as number]}
              onValueChange={([v]) => update('borderRadius', v)}
              min={0}
              max={50}
              step={5}
            />
          </FieldGroup>
        </>
      );

    case 'greeting':
      return (
        <>
          <FieldGroup>
            <Label>Text</Label>
            <Input value={props.text as string} onChange={(e) => update('text', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Emoji (optional)</Label>
            <Input
              value={(props.emoji as string) || ''}
              onChange={(e) => update('emoji', e.target.value)}
              placeholder="e.g., 👋"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Alignment</Label>
            <Select value={props.alignment as string} onValueChange={(v) => update('alignment', v)}>
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

    case 'typing-animation':
      const lines = props.lines as string[];
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
                      update('lines', newLines);
                    }}
                  />
                  {lines.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        const newLines = lines.filter((_, idx) => idx !== i);
                        update('lines', newLines);
                      }}
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
                onClick={() => update('lines', [...lines, 'New line'])}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>
          </FieldGroup>
          <FieldGroup>
            <Label>Color (hex without #)</Label>
            <Input
              value={props.color as string}
              onChange={(e) => update('color', e.target.value)}
              placeholder="36BCF7"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Width ({String(props.width)}px)</Label>
            <Slider
              value={[props.width as number]}
              onValueChange={([v]) => update('width', v)}
              min={200}
              max={800}
              step={10}
            />
          </FieldGroup>
        </>
      );

    case 'heading':
      return (
        <>
          <FieldGroup>
            <Label>Text</Label>
            <Input value={props.text as string} onChange={(e) => update('text', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Level</Label>
            <Select value={String(props.level)} onValueChange={(v) => update('level', parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Emoji (optional)</Label>
            <Input
              value={(props.emoji as string) || ''}
              onChange={(e) => update('emoji', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Alignment</Label>
            <Select value={props.alignment as string} onValueChange={(v) => update('alignment', v)}>
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

    case 'paragraph':
      return (
        <>
          <FieldGroup>
            <Label>Text</Label>
            <Textarea
              value={props.text as string}
              onChange={(e) => update('text', e.target.value)}
              rows={4}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Alignment</Label>
            <Select value={props.alignment as string} onValueChange={(v) => update('alignment', v)}>
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

    case 'collapsible':
      return (
        <>
          <FieldGroup>
            <Label>Title</Label>
            <Input
              value={props.title as string}
              onChange={(e) => update('title', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Default Open</Label>
              <Switch
                checked={props.defaultOpen as boolean}
                onCheckedChange={(v) => update('defaultOpen', v)}
              />
            </div>
          </FieldGroup>
        </>
      );

    case 'code-block':
      return (
        <>
          <FieldGroup>
            <Label>Code</Label>
            <Textarea
              value={props.code as string}
              onChange={(e) => update('code', e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Language</Label>
            <Input
              value={props.language as string}
              onChange={(e) => update('language', e.target.value)}
            />
          </FieldGroup>
        </>
      );

    case 'image':
      return (
        <>
          <FieldGroup>
            <Label>Image URL</Label>
            <Input value={props.url as string} onChange={(e) => update('url', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Alt Text</Label>
            <Input value={props.alt as string} onChange={(e) => update('alt', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Width (optional)</Label>
            <Input
              type="number"
              value={(props.width as number) || ''}
              onChange={(e) =>
                update('width', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Height (optional)</Label>
            <Input
              type="number"
              value={(props.height as number) || ''}
              onChange={(e) =>
                update('height', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Border Radius ({String(props.borderRadius)}px)</Label>
            <Slider
              value={[props.borderRadius as number]}
              onValueChange={([v]) => update('borderRadius', v)}
              min={0}
              max={50}
              step={2}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Alignment</Label>
            <Select value={props.alignment as string} onValueChange={(v) => update('alignment', v)}>
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

    case 'gif':
      return (
        <>
          <FieldGroup>
            <Label>GIF URL</Label>
            <Input value={props.url as string} onChange={(e) => update('url', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Alt Text</Label>
            <Input value={props.alt as string} onChange={(e) => update('alt', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Width (optional)</Label>
            <Input
              type="number"
              value={(props.width as number) || ''}
              onChange={(e) =>
                update('width', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Alignment</Label>
            <Select value={props.alignment as string} onValueChange={(v) => update('alignment', v)}>
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

    case 'social-badges':
      return (
        <>
          <FieldGroup>
            <Label>Badge Style</Label>
            <Select value={props.style as string} onValueChange={(v) => update('style', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="flat-square">Flat Square</SelectItem>
                <SelectItem value="for-the-badge">For the Badge</SelectItem>
                <SelectItem value="plastic">Plastic</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>LinkedIn Username</Label>
            <Input
              value={(props.linkedin as string) || ''}
              onChange={(e) => update('linkedin', e.target.value)}
              placeholder="your-linkedin-username"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Twitter/X Username</Label>
            <Input
              value={(props.twitter as string) || ''}
              onChange={(e) => update('twitter', e.target.value)}
              placeholder="your-twitter-username"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>GitHub Username</Label>
            <Input
              value={(props.github as string) || ''}
              onChange={(e) => update('github', e.target.value)}
              placeholder="your-github-username"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>YouTube Channel</Label>
            <Input
              value={(props.youtube as string) || ''}
              onChange={(e) => update('youtube', e.target.value)}
              placeholder="your-channel-name"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Instagram Username</Label>
            <Input
              value={(props.instagram as string) || ''}
              onChange={(e) => update('instagram', e.target.value)}
              placeholder="your-instagram-username"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Discord Server ID</Label>
            <Input
              value={(props.discord as string) || ''}
              onChange={(e) => update('discord', e.target.value)}
              placeholder="your-discord-server-id"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={(props.email as string) || ''}
              onChange={(e) => update('email', e.target.value)}
              placeholder="your@email.com"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Portfolio URL</Label>
            <Input
              value={(props.portfolio as string) || ''}
              onChange={(e) => update('portfolio', e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </FieldGroup>
        </>
      );

    case 'custom-badge':
      return (
        <>
          <FieldGroup>
            <Label>Label</Label>
            <Input
              value={props.label as string}
              onChange={(e) => update('label', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Message</Label>
            <Input
              value={props.message as string}
              onChange={(e) => update('message', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Color</Label>
            <Input
              value={props.color as string}
              onChange={(e) => update('color', e.target.value)}
              placeholder="red, blue, #ff0000"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Style</Label>
            <Select value={props.style as string} onValueChange={(v) => update('style', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="flat-square">Flat Square</SelectItem>
                <SelectItem value="for-the-badge">For the Badge</SelectItem>
                <SelectItem value="plastic">Plastic</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Logo (optional)</Label>
            <Input
              value={(props.logo as string) || ''}
              onChange={(e) => update('logo', e.target.value)}
              placeholder="github, twitter, etc."
            />
          </FieldGroup>
        </>
      );

    case 'skill-icons':
      const icons = props.icons as string[];
      return (
        <>
          <FieldGroup>
            <Label>Selected Icons ({icons.length})</Label>
            <div className="flex flex-wrap gap-1 p-2 rounded-md bg-muted max-h-32 overflow-y-auto">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() =>
                    update(
                      'icons',
                      icons.filter((i) => i !== icon),
                    )
                  }
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
              {SKILL_ICONS.filter((icon) => !icons.includes(icon)).map((icon) => (
                <button
                  key={icon}
                  onClick={() => update('icons', [...icons, icon])}
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
              value={[props.perLine as number]}
              onValueChange={([v]) => update('perLine', v)}
              min={3}
              max={15}
              step={1}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </>
      );

    case 'stats-card':
      return (
        <>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STATS_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Show Icons</Label>
              <Switch
                checked={props.showIcons as boolean}
                onCheckedChange={(v) => update('showIcons', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Border</Label>
              <Switch
                checked={props.hideBorder as boolean}
                onCheckedChange={(v) => update('hideBorder', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Title</Label>
              <Switch
                checked={props.hideTitle as boolean}
                onCheckedChange={(v) => update('hideTitle', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Rank</Label>
              <Switch
                checked={props.hideRank as boolean}
                onCheckedChange={(v) => update('hideRank', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <Label>Border Radius ({String(props.borderRadius)}px)</Label>
            <Slider
              value={[props.borderRadius as number]}
              onValueChange={([v]) => update('borderRadius', v)}
              min={0}
              max={20}
              step={1}
            />
          </FieldGroup>
        </>
      );

    case 'top-languages':
      return (
        <>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STATS_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Layout</Label>
            <Select value={props.layout as string} onValueChange={(v) => update('layout', v)}>
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
            <Label>Languages Count ({String(props.langs_count)})</Label>
            <Slider
              value={[props.langs_count as number]}
              onValueChange={([v]) => update('langs_count', v)}
              min={1}
              max={20}
              step={1}
            />
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Border</Label>
              <Switch
                checked={props.hideBorder as boolean}
                onCheckedChange={(v) => update('hideBorder', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Progress</Label>
              <Switch
                checked={props.hideProgress as boolean}
                onCheckedChange={(v) => update('hideProgress', v)}
              />
            </div>
          </FieldGroup>
        </>
      );

    case 'streak-stats':
      return (
        <>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STATS_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Border</Label>
              <Switch
                checked={props.hideBorder as boolean}
                onCheckedChange={(v) => update('hideBorder', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <Label>Border Radius ({String(props.borderRadius)}px)</Label>
            <Slider
              value={[props.borderRadius as number]}
              onValueChange={([v]) => update('borderRadius', v)}
              min={0}
              max={20}
              step={1}
            />
          </FieldGroup>
        </>
      );

    case 'activity-graph':
      return (
        <>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tokyo-night">Tokyo Night</SelectItem>
                <SelectItem value="dracula">Dracula</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="github-dark">GitHub Dark</SelectItem>
                <SelectItem value="rogue">Rogue</SelectItem>
                <SelectItem value="merko">Merko</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="react-dark">React Dark</SelectItem>
                <SelectItem value="high-contrast">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>Hide Border</Label>
              <Switch
                checked={props.hideBorder as boolean}
                onCheckedChange={(v) => update('hideBorder', v)}
              />
            </div>
          </FieldGroup>
        </>
      );

    case 'trophies':
      return (
        <>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STATS_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Columns ({String(props.column)})</Label>
            <Slider
              value={[props.column as number]}
              onValueChange={([v]) => update('column', v)}
              min={1}
              max={10}
              step={1}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Rows ({String(props.row)})</Label>
            <Slider
              value={[props.row as number]}
              onValueChange={([v]) => update('row', v)}
              min={1}
              max={4}
              step={1}
            />
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>No Frame</Label>
              <Switch
                checked={props.noFrame as boolean}
                onCheckedChange={(v) => update('noFrame', v)}
              />
            </div>
          </FieldGroup>
          <FieldGroup>
            <div className="flex items-center justify-between">
              <Label>No Background</Label>
              <Switch checked={props.noBg as boolean} onCheckedChange={(v) => update('noBg', v)} />
            </div>
          </FieldGroup>
        </>
      );

    case 'visitor-counter':
      return (
        <>
          <FieldGroup>
            <Label>Label</Label>
            <Input
              value={props.label as string}
              onChange={(e) => update('label', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Color</Label>
            <Select value={props.color as string} onValueChange={(v) => update('color', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="brightgreen">Bright Green</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="yellow">Yellow</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="lightgrey">Light Grey</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Style</Label>
            <Select value={props.style as string} onValueChange={(v) => update('style', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="flat-square">Flat Square</SelectItem>
                <SelectItem value="plastic">Plastic</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </>
      );

    case 'quote':
      return (
        <>
          <FieldGroup>
            <Label>Custom Quote (optional)</Label>
            <Textarea
              value={(props.quote as string) || ''}
              onChange={(e) => update('quote', e.target.value)}
              placeholder="Leave empty for random quote"
              rows={3}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Author (optional)</Label>
            <Input
              value={(props.author as string) || ''}
              onChange={(e) => update('author', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Theme</Label>
            <Select value={props.theme as string} onValueChange={(v) => update('theme', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {STATS_THEMES.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Layout</Label>
            <Select value={props.type as string} onValueChange={(v) => update('type', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </FieldGroup>
        </>
      );

    case 'footer-banner':
      return (
        <>
          <FieldGroup>
            <Label>Text</Label>
            <Input value={props.text as string} onChange={(e) => update('text', e.target.value)} />
          </FieldGroup>
          <FieldGroup>
            <Label>Wave Color (gradient)</Label>
            <Input
              value={props.waveColor as string}
              onChange={(e) => update('waveColor', e.target.value)}
              placeholder="0:EEFF00,100:a82DA"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Font Color (hex without #)</Label>
            <Input
              value={props.fontColor as string}
              onChange={(e) => update('fontColor', e.target.value)}
              placeholder="ffffff"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Height ({String(props.height)}px)</Label>
            <Slider
              value={[props.height as number]}
              onValueChange={([v]) => update('height', v)}
              min={60}
              max={200}
              step={10}
            />
          </FieldGroup>
        </>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          No configuration available for this block type.
        </p>
      );
  }
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
