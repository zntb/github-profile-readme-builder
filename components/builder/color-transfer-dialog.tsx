'use client';

import { Check, Palette } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  applyColorsToBlock,
  extractColorsFromBlock,
  getBlocksWithColors,
  getColorPropertyLabel,
} from '@/lib/color-transfer';
import { useBuilderStore } from '@/lib/store';
import type { Block } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColorTransferDialogProps {
  sourceBlock: Block;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ColorTransferDialog({ sourceBlock, open, onOpenChange }: ColorTransferDialogProps) {
  const blocks = useBuilderStore((s) => s.blocks);
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const selectBlock = useBuilderStore((s) => s.selectBlock);

  const sourceColors = extractColorsFromBlock(sourceBlock);
  const availableTargetBlocks = getBlocksWithColors(blocks).filter((b) => b.id !== sourceBlock.id);

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(
    new Set(Object.keys(sourceColors)),
  );

  const targetBlock = availableTargetBlocks.find((b) => b.id === selectedTargetId);

  const handleToggleProperty = (property: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(property)) {
      newSelected.delete(property);
    } else {
      newSelected.add(property);
    }
    setSelectedProperties(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedProperties(new Set(Object.keys(sourceColors)));
  };

  const handleDeselectAll = () => {
    setSelectedProperties(new Set());
  };

  const handleTransfer = () => {
    if (!targetBlock || selectedProperties.size === 0) return;

    const updatedProps = applyColorsToBlock(
      targetBlock,
      sourceColors,
      Array.from(selectedProperties),
    );

    updateBlock(targetBlock.id, updatedProps);
    selectBlock(targetBlock.id);
    onOpenChange(false);
    setSelectedTargetId(null);
  };

  const colorEntries = Object.entries(sourceColors).filter(
    ([, value]) => value && value.length > 0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Transfer Colors
          </DialogTitle>
          <DialogDescription>
            Copy color properties from "{sourceBlock.type}" to another block
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Source Block Colors */}
          <div>
            <h4 className="text-sm font-medium mb-2">Source Colors</h4>
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              {colorEntries.map(([property, value]) => (
                <div
                  key={property}
                  className="flex items-center gap-2 px-2 py-1 bg-background rounded border text-xs"
                >
                  <div className="w-4 h-4 rounded border" style={{ backgroundColor: value }} />
                  <span className="text-muted-foreground">{getColorPropertyLabel(property)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Block Selection */}
          <div>
            <h4 className="text-sm font-medium mb-2">Select Target Block</h4>
            {availableTargetBlocks.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                No other blocks with color properties available
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTargetBlocks.map((block) => (
                  <Button
                    key={block.id}
                    variant={selectedTargetId === block.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTargetId(block.id)}
                    className="text-xs"
                  >
                    {block.type.replace(/-/g, ' ')}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Property Selection */}
          {selectedTargetId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Select Properties to Transfer</h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={handleSelectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6"
                    onClick={handleDeselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[150px]">
                <div className="space-y-2 p-1">
                  {colorEntries.map(([property, value]) => (
                    <div
                      key={property}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors',
                        selectedProperties.has(property)
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50',
                      )}
                      onClick={() => handleToggleProperty(property)}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded border flex items-center justify-center shrink-0',
                          selectedProperties.has(property)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background',
                        )}
                      >
                        {selectedProperties.has(property) && <Check className="h-3 w-3" />}
                      </div>
                      <div
                        className="w-6 h-6 rounded border shrink-0"
                        style={{ backgroundColor: value }}
                      />
                      <span className="text-sm">{getColorPropertyLabel(property)}</span>
                      <span className="text-xs text-muted-foreground ml-auto truncate max-w-[100px]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedTargetId || selectedProperties.size === 0}
          >
            Transfer Colors
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
