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
  Trash2,
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
}

export function CanvasBlock({ block, isSelected, onSelect }: CanvasBlockProps) {
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useBuilderStore((s) => s.duplicateBlock);
  const updateBlock = useBuilderStore((s) => s.updateBlock);
  const blockRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get block style properties
  const blockWidth = block.props.blockWidth as number | undefined;
  const blockHeight = block.props.blockHeight as number | undefined;
  const blockAlignment = block.props.blockAlignment as string | undefined;

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
    const url = block.props.url as string | undefined;

    // For image and gif blocks, show confirmation dialog
    if ((block.type === 'image' || block.type === 'gif') && isUploadThingUrl(url)) {
      setShowDeleteDialog(true);
      return;
    }
    removeBlock(block.id);
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
          if (!response.ok) {
            const errorText = await response.text();
            console.error('UploadThing delete failed:', errorText);
            return;
          }
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        return;
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
        <div
          className={cn(
            'absolute top-2 left-2 sm:-left-10 sm:top-1/2 sm:-translate-y-1/2 flex items-center gap-1 transition-all duration-200 z-10',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
            isSelected && 'sm:opacity-100',
          )}
        >
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing active:scale-95 transition-all duration-150"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            'absolute top-2 right-2 sm:-right-10 sm:top-1/2 sm:-translate-y-1/2 flex sm:flex-col items-center gap-1 transition-all duration-200 z-10',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
            isSelected && 'sm:opacity-100',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
            onClick={handleDuplicate}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Alignment Controls */}
        {isSelected && (
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
            >
              <AlignRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Resize Handles */}
        {isSelected && (
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
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this image block will permanently remove the uploaded image from UploadThing
              storage. This action cannot be undone.
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
