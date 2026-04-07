'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  GripHorizontal,
  GripVertical,
  Lock,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/lib/store';
import type { Block } from '@/lib/types';
import { extractUploadThingFileKey, isUploadThingUrl } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';

import { BlockPreview } from './block-preview';

interface CanvasBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  nested?: boolean;
}

export function CanvasBlock({ block, isSelected, onSelect, nested = false }: CanvasBlockProps) {
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const toggleBlockLock = useBuilderStore((s) => s.toggleBlockLock);
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const blockRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get block style properties
  const blockWidth = block.props.blockWidth as number | undefined;
  const blockHeight = block.props.blockHeight as number | undefined;
  const blockAlignment = block.props.blockAlignment as string | undefined;
  const isLocked = block.locked ?? false;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: blockWidth ? `${blockWidth}%` : undefined,
    minHeight: blockHeight ? `${blockHeight}px` : undefined,
    alignSelf:
      blockAlignment === 'left' ? 'flex-start' : blockAlignment === 'right' ? 'flex-end' : 'center',
  };

  const handleDeleteClick = () => {
    // Show confirmation dialog before deleting any block
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    const url = block.props.url as string | undefined;
    // Extract file key from URL and delete from UploadThing
    if (isUploadThingUrl(url)) {
      try {
        const fileKey = extractUploadThingFileKey(url);
        if (fileKey) {
          const response = await fetch('/api/uploadthing/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileKey }),
          });
          const data = await response.json();
          // Allow deletion to proceed even if UploadThing couldn't delete
          // (file might not exist anymore)
          if (!response.ok && !data.success) {
            console.error('UploadThing delete failed:', data.error || (await response.text()));
          }
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    removeBlock(block.id);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(block.id);
  };

  const handleAlignment = (alignment: 'left' | 'center' | 'right') => {
    updateBlock(block.id, { blockAlignment: alignment });
  };

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: 'right' | 'bottom' | 'corner') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = blockRef.current?.offsetWidth || 0;
      const startHeight = blockRef.current?.offsetHeight || 0;
      const containerWidth = blockRef.current?.parentElement?.offsetWidth || 1;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!blockRef.current) return;

        if (direction === 'right' || direction === 'corner') {
          const deltaX = moveEvent.clientX - startX;
          const newWidthPercent = Math.min(
            100,
            Math.max(10, ((startWidth + deltaX) / containerWidth) * 100),
          );
          updateBlock(block.id, { blockWidth: Math.round(newWidthPercent) });
        }

        if (direction === 'bottom' || direction === 'corner') {
          const deltaY = moveEvent.clientY - startY;
          const newHeight = Math.max(30, startHeight + deltaY);
          updateBlock(block.id, { blockHeight: Math.round(newHeight) });
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [block.id, updateBlock],
  );

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          if (node) blockRef.current = node;
        }}
        style={style}
        className={cn(
          'group relative rounded-xl border bg-card/80 backdrop-blur-sm transition-all duration-200',
          isSelected
            ? 'border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
            : 'border-border/50 hover:border-muted-foreground/30 hover:shadow-md hover:shadow-muted/20',
          isDragging && 'opacity-60 shadow-xl scale-[1.02] ring-2 ring-primary/40',
          isResizing && 'ring-2 ring-primary/50 cursornwse-resize',
        )}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        {!nested && (
          <div
            className={cn(
              'absolute top-2 left-2 sm:-left-10 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-1 transition-all duration-200 z-10',
              'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
              isSelected && 'sm:opacity-100',
            )}
          >
            {isLocked ? (
              <div className="rounded-lg p-1.5 text-amber-500 bg-amber-500/10">
                <Lock className="h-4 w-4" />
              </div>
            ) : (
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing active:scale-95 transition-all duration-150"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Quick Actions - positioned at top center for all blocks */}
        <div
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 flex flex-row items-center gap-0.5 bg-card border rounded-lg p-0.5 shadow-md z-20 transition-all duration-200',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
            isSelected && 'opacity-100',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-7 w-7 transition-all duration-200',
              isLocked
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-primary/10',
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggleBlockLock(block.id);
            }}
            aria-label={isLocked ? 'Unlock block' : 'Lock block'}
          >
            {isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          </Button>
          {!isLocked && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                onClick={handleDuplicate}
                aria-label="Duplicate block"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                onClick={handleDeleteClick}
                aria-label="Delete block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>

        {/* Alignment Controls - Hidden when locked and for nested */}
        {isSelected && !isLocked && !nested && (
          <div
            className={cn(
              'absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-card border rounded-lg p-0.5 shadow-md z-20',
            )}
          >
            <Button
              variant={blockAlignment === 'left' ? 'default' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleAlignment('left');
              }}
              aria-label="Align left"
            >
              <AlignLeft className="h-3 w-3" />
            </Button>
            <Button
              variant={blockAlignment === 'center' || !blockAlignment ? 'default' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleAlignment('center');
              }}
              aria-label="Align center"
            >
              <AlignCenter className="h-3 w-3" />
            </Button>
            <Button
              variant={blockAlignment === 'right' ? 'default' : 'ghost'}
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                handleAlignment('right');
              }}
              aria-label="Align right"
            >
              <AlignRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Resize Handles - Hidden for nested */}
        {isSelected && !nested && (
          <>
            <div
              className="absolute top-0 right-0 w-3 h-full cursor-ew-resize hover:bg-primary/30 rounded-r-xl transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            >
              <GripHorizontal className="absolute top-1/2 -translate-y-1/2 right-0.5 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
            <div
              className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize hover:bg-primary/30 rounded-b-xl transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            >
              <GripHorizontal className="absolute left-1/2 -translate-x-1/2 bottom-0.5 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 rotate-90" />
            </div>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/30 rounded-br-xl transition-colors"
              onMouseDown={(e) => handleResizeStart(e, 'corner')}
            >
              <GripHorizontal className="absolute bottom-0.5 right-0.5 h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
          </>
        )}

        {/* Block Type Label */}
        <div className="absolute -top-2.5 left-3 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-card/90 rounded-md border border-border/30 z-10">
          {block.type.replace(/-/g, ' ')}
        </div>

        {/* Block Content Preview */}
        <div className="p-3 pt-10 sm:p-4 sm:pt-5">
          <BlockPreview block={block} />
        </div>

        {/* Render nested blocks for collapsible */}
        {block.children && block.children.length > 0 && (
          <div className="mt-2 pl-4 border-l-2 border-primary/20">
            {block.children.map((child) => (
              <CanvasBlock
                key={child.id}
                block={child}
                isSelected={selectedBlockId === child.id}
                onSelect={() => selectBlock(child.id)}
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {block.type.replace(/-/g, ' ')} block? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
