'use client';

import { generateReactHelpers } from '@uploadthing/react';
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
import { extractUploadThingFileKey, isUploadThingUrl } from '@/lib/uploadthing';

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

  const { startUpload, isUploading: isUtUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        onChange(res[0].ufsUrl);
      }
      setIsUploading(false);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
      setIsUploading(false);
    },
  });

  const isUploadingAny = isUploading || isUtUploading;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = accept.split(',').map((t) => t.trim());
    if (!validTypes.some((type) => file.type.match(type))) {
      console.error('Invalid file type');
      return;
    }

    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large (max 8MB)');
      return;
    }

    setIsUploading(true);

    try {
      await startUpload([file]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClearClick = () => {
    if (isUploadThingUrl(value)) {
      setShowDeleteDialog(true);
    } else {
      onChange('');
    }
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
      } catch (error) {
        console.error('Error deleting file:', error);
        return;
      }
    }
    onChange('');
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

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
          disabled={isUploadingAny}
        >
          {isUploadingAny ? '...' : 'Upload'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClearClick}>
            Clear
          </Button>
        )}
      </div>
      <Label className="text-xs text-muted-foreground">
        Supported: {accept.replace(/image\//g, '')} (max 8MB)
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
