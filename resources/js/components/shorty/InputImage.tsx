import { FileDropzone } from '@/components/ui/file-dropzone';
import { Label } from '@/components/ui/label';
import { Dialog, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React, { useState } from 'react';

interface InputImageProps {
  id: string;
  label: string;
  currentImageUrl?: string | null;
  currentImageName?: string;
  currentImageAlt?: string;
  onImageChange: (imagePath: string) => void;
  uploadPath?: string;
  accept: string;
  maxSize: number;
  required?: boolean;
  disabled?: boolean;
}

export function InputImage({
  id,
  label,
  currentImageUrl,
  currentImageName,
  currentImageAlt = 'Image',
  onImageChange,
  uploadPath,
  accept,
  maxSize,
  required = false,
  disabled = false,
}: InputImageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Helper function to format bytes to human-readable size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + sizes[i];
  };

  const maxSizeLabel = formatFileSize(maxSize);

  // Helper function to generate temporary upload path
  const getTempUploadPath = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `tmp/${year}/${month}/${day}/sample_items`;
  };

  const uploadImageToS3 = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadPath || getTempUploadPath());

    // Always use the image upload endpoint
    const endpoint = '/upload/image';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileDrop = async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeLabel}`);
      return;
    }

    // Clear any previous errors
    setError(undefined);

    // Set uploading state
    setIsUploading(true);
    setIsSuccess(false);

    try {
      // Upload image to S3
      const imagePath = await uploadImageToS3(file);

      if (imagePath) {
        // Set the image path in form data
        onImageChange(imagePath);
        setIsSuccess(true);
      } else {
        setError('Failed to upload image');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      // Clear uploading state
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {currentImageUrl ? (
        <div className="mb-2">
          <img
            src={currentImageUrl}
            alt={currentImageAlt}
            className="h-24 w-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowImagePreview(true)}
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Current image: {currentImageName || 'View image'}
          </p>
        </div>
      ) : null}
      <FileDropzone
        accept={accept}
        maxSize={maxSize}
        onFileDrop={handleFileDrop}
        disabled={disabled}
        isUploading={isUploading}
        isSuccess={isSuccess}
        currentFileName={currentImageName}
        error={error}
      />
      <p className="text-xs text-muted-foreground">Maximum file size: {maxSizeLabel}</p>

      {/* Image Preview Dialog */}
      {currentImageUrl && (
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogPortal>
            <DialogOverlay className="bg-black/80" />
            <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 max-h-[90vh] w-[90vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-background p-6 shadow-lg">
              <DialogHeader>
                <DialogTitle>Image Preview</DialogTitle>
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </DialogHeader>
              <div className="mt-4">
                <img
                  src={currentImageUrl}
                  alt={currentImageAlt}
                  className="w-full h-auto rounded"
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPortal>
        </Dialog>
      )}
    </div>
  );
}
