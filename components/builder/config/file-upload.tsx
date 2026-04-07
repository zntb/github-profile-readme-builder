'use client';

import { generateReactHelpers } from '@uploadthing/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { optimizeImage } from '@/lib/image-optimization';
import { useImageOptimizationStore } from '@/lib/image-optimization-store';
import { extractUploadThingFileKey, isUploadThingUrl } from '@/lib/uploadthing';
import { formatBytes } from '@/lib/use-image-optimization';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface FileUploadProps {
  accept: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function FileUpload({
  accept,
  value,
  onChange,
  label,
  placeholder = 'Enter URL or upload a file',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get optimization settings from store
  const settings = useImageOptimizationStore((state) => state.settings);

  const { startUpload, isUploading: isUtUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        onChange(res[0].ufsUrl);
      }
      setIsUploading(false);
      setIsOptimizing(false);
      setUploadProgress(null);
    },
    onUploadError: (uploadError) => {
      console.error('Upload error:', uploadError);
      setError(uploadError.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setIsOptimizing(false);
      setUploadProgress(null);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const isUploadingAny = isUploading || isUtUploading;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error
    setError(null);

    const validTypes = accept.split(',').map((t) => t.trim());
    if (!validTypes.some((type) => file.type.match(type))) {
      setError('Invalid file type. Please select a supported format.');
      return;
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 8MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Apply optimization if enabled
      if (settings.enabled && file.type.startsWith('image/')) {
        setIsOptimizing(true);

        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const result = await optimizeImage(buffer, {
            format: settings.format,
            quality: settings.quality,
            maxWidth: settings.maxWidth,
            maxHeight: settings.maxHeight,
            preserveAspectRatio: settings.preserveAspectRatio,
            progressive: settings.progressive,
          });

          // Convert base64 back to File
          const byteCharacters = atob(result.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: result.contentType });

          // Create optimized file with appropriate extension
          const extension = result.contentType.split('/')[1];
          const optimizedFileName = file.name.replace(/\.[^/.]+$/, '') + `.${extension}`;

          fileToUpload = new File([blob], optimizedFileName, {
            type: result.contentType,
            lastModified: Date.now(),
          });

          console.log(
            `Image optimized: ${formatBytes(result.originalSize)} → ${formatBytes(
              result.optimizedSize,
            )} (${((1 - result.compressionRatio) * 100).toFixed(1)}% smaller)`,
          );
        } catch (optimizeError) {
          console.error('Optimization failed, using original:', optimizeError);
          // Fall back to original file
        }
      }

      await startUpload([fileToUpload]);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Upload failed. Please try again.');
      setIsUploading(false);
      setIsOptimizing(false);
      setUploadProgress(null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setError(null);
  };

  const handleClearClick = () => {
    if (isUploadThingUrl(value)) {
      setShowDeleteDialog(true);
    } else {
      onChange('');
    }
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    const fileKey = extractUploadThingFileKey(value);
    if (fileKey) {
      try {
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
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
        return;
      }
    }
    onChange('');
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Show combined loading state
  const isLoading = isUploadingAny || isOptimizing;
  const loadingText = isOptimizing
    ? 'Optimizing...'
    : isUploading
      ? uploadProgress
        ? `${Math.round(uploadProgress)}%`
        : 'Uploading...'
      : null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {loadingText}
            </>
          ) : (
            'Upload'
          )}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClearClick}>
            Clear
          </Button>
        )}
      </div>

      {/* Progress bar for uploads */}
      {isUploading && uploadProgress !== null && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Uploading: {Math.round(uploadProgress)}%</p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Label className="text-xs text-muted-foreground">
        Supported: {accept.replace(/image\//g, '')} (max 8MB)
        {settings.enabled && ' • Auto-optimization enabled'}
      </Label>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting this image will permanently remove it from the UploadThing storage. This
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
    </div>
  );
}
