'use client';

import { X } from 'lucide-react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { findBlock, useBuilderStore } from '@/lib/store';

import { BlockConfigFields } from './config/block-config-fields';
import { FieldGroup } from './config/field-group';

export function ConfigPanel() {
  const { blocks, selectedBlockId } = useBuilderStore(
    useShallow((s) => ({ blocks: s.blocks, selectedBlockId: s.selectedBlockId })),
  );
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const updateBlockChildren = useBuilderStore((s) => s.updateBlockChildren);

  const selectedBlock = useMemo(
    () => (selectedBlockId ? findBlock(blocks, selectedBlockId) : null),
    [blocks, selectedBlockId],
  );

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

  if (!selectedBlock) return null;
  const blockWidth = selectedBlock.props.blockWidth as number | undefined;
  const blockHeight = selectedBlock.props.blockHeight as number | undefined;
  const blockAlignment = selectedBlock.props.blockAlignment as string | undefined;

  return (
    <div className="flex h-full w-full flex-col border-l border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-sm font-semibold text-sidebar-foreground">
          {selectedBlock.type.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex h-6 w-6"
          onClick={() => selectBlock(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <FieldGroup>
            <Label>Alignment</Label>
            <Select
              value={blockAlignment ?? 'center'}
              onValueChange={(value) => updateBlock(selectedBlock.id, { blockAlignment: value })}
            >
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
            <Label>Block Width (%)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={blockWidth ?? 100}
              onChange={(e) => {
                const value = Number(e.target.value);
                updateBlock(selectedBlock.id, {
                  blockWidth: Math.min(100, Math.max(1, value || 100)),
                });
              }}
            />
          </FieldGroup>
          <FieldGroup>
            <Label>Block Height (px)</Label>
            <Input
              type="number"
              min={1}
              value={blockHeight ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                updateBlock(selectedBlock.id, {
                  blockHeight: raw === '' ? undefined : Math.max(1, Number(raw) || 1),
                });
              }}
              placeholder="auto"
            />
          </FieldGroup>
          <BlockConfigFields
            block={selectedBlock}
            updateBlock={updateBlock}
            updateBlockChildren={updateBlockChildren}
          />
        </div>
      </div>
    </div>
  );
}
