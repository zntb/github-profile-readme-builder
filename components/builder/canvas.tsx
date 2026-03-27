'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Layers, Sparkles } from 'lucide-react';
import { useCallback } from 'react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/lib/store';
import { cn } from '@/lib/utils';

import { CanvasBlock } from './canvas-block';

function isHalfWidthBlock(block: { type: string; props: Record<string, unknown> }) {
  const layoutWidth = block.props.layoutWidth as string | undefined;
  if (layoutWidth === 'half') return true;
  if (layoutWidth === 'full') return false;

  // Default to full width (100%) for all card types
  return false;
}

export function Canvas() {
  const { blocks, setBlocks, selectBlock, selectedBlockId } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        setBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    },
    [blocks, setBlocks],
  );

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectBlock(null);
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-background/50 p-4 sm:p-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative animate-in">
          <Empty className="bg-card/50 backdrop-blur-sm border-border/50">
            <EmptyMedia variant="icon">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle className="text-lg">No blocks yet</EmptyTitle>
              <EmptyDescription>
                Add blocks from the sidebar to start building your GitHub Profile README
              </EmptyDescription>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Drag & drop to reorder</span>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-background/30">
      <div className="min-h-full p-4 sm:p-8" onClick={handleCanvasClick}>
        <div className="mx-auto max-w-4xl">
          {/* Canvas header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                {blocks.length} block{blocks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-col gap-3 items-stretch lg:items-center">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={cn(
                      'animate-slide-up',
                      isHalfWidthBlock(block) ? 'lg:w-1/2' : 'w-full',
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CanvasBlock
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      onSelect={() => selectBlock(block.id)}
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </ScrollArea>
  );
}
