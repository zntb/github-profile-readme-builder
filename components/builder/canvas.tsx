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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/lib/store';
import type { Block } from '@/lib/types';
import { cn } from '@/lib/utils';

import { CanvasBlock } from './canvas-block';

// Threshold for when to enable virtualization
const VIRTUALIZATION_THRESHOLD = 20;

// Estimated height for each block (in pixels) - used for initial positioning
const BLOCK_ESTIMATED_HEIGHT = 140;

// Number of blocks to render beyond the visible area
const BUFFER_COUNT = 5;

function isHalfWidthBlock(block: { type: string; props: Record<string, unknown> }) {
  const layoutWidth = block.props.layoutWidth as string | undefined;
  if (layoutWidth === 'half') return true;
  if (layoutWidth === 'full') return false;

  // Default to full width (100%) for all card types
  return false;
}

/**
 * VirtualizedCanvas - renders blocks lazily based on scroll position
 * Only renders blocks that are within the visible viewport plus a buffer
 */
function VirtualizedCanvas({
  blocks,
  selectedBlockId,
  selectBlock,
}: {
  blocks: Block[];
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: BUFFER_COUNT * 2 });

  // Calculate the visible range based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const startIndex = Math.max(0, Math.floor(scrollTop / BLOCK_ESTIMATED_HEIGHT) - BUFFER_COUNT);
      const endIndex = Math.min(
        blocks.length,
        Math.ceil((scrollTop + viewportHeight) / BLOCK_ESTIMATED_HEIGHT) + BUFFER_COUNT,
      );

      setVisibleRange({ start: startIndex, end: endIndex });
    };

    container.addEventListener('scroll', updateVisibleRange, { passive: true });
    updateVisibleRange(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
    };
  }, [blocks.length]);

  // Render only blocks in the visible range
  const renderedBlocks = useMemo(() => {
    return blocks.map((block, index) => {
      // For large profiles, only render visible blocks
      const isVisible = index >= visibleRange.start && index < visibleRange.end;
      if (isVisible) {
        return (
          <div
            key={block.id}
            className={cn('animate-slide-up', isHalfWidthBlock(block) ? 'lg:w-1/2' : 'w-full')}
            style={{ animationDelay: `${(index % BUFFER_COUNT) * 30}ms` }}
          >
            <CanvasBlock
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={() => selectBlock(block.id)}
            />
          </div>
        );
      }

      // Render a placeholder for non-visible blocks to maintain scroll position
      return (
        <div
          key={block.id}
          className={cn('animate-slide-up', isHalfWidthBlock(block) ? 'lg:w-1/2' : 'w-full')}
          style={{ minHeight: `${BLOCK_ESTIMATED_HEIGHT}px` }}
        />
      );
    });
  }, [blocks, selectedBlockId, selectBlock, visibleRange]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 items-stretch lg:items-center overflow-y-auto h-full"
    >
      {renderedBlocks}
    </div>
  );
}

export function Canvas() {
  const blocks = useBuilderStore((s) => s.blocks);
  const setBlocks = useBuilderStore((s) => s.setBlocks);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);

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

  const handleSelectBlock = useCallback(
    (id: string | null) => {
      selectBlock(id);
    },
    [selectBlock],
  );

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

  const shouldVirtualize = blocks.length >= VIRTUALIZATION_THRESHOLD;

  return (
    <ScrollArea className="h-full bg-background/30" role="region" aria-label="Canvas area">
      <div className="min-h-full p-4 sm:p-8" onClick={handleCanvasClick}>
        <div className="mx-auto max-w-4xl">
          {/* Canvas header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                {blocks.length} block{blocks.length !== 1 ? 's' : ''}
              </span>
              {shouldVirtualize && (
                <span className="text-xs text-muted-foreground/70">(virtualized)</span>
              )}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
              {shouldVirtualize ? (
                <VirtualizedCanvas
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  selectBlock={handleSelectBlock}
                />
              ) : (
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
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </ScrollArea>
  );
}
