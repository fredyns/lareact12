import { FileDropzone } from '@/components/ui/file-dropzone';
import { Label } from '@/components/ui/label';
import { ImagePreview } from '@/components/shorty/image-preview';
import { formatFileSize } from '@/utils/upload';
import React, { useState } from 'react';

interface InputImageProps {
  id: string;
  label: string;
  currentImageUrl?: string | null;
  currentImageName?: string;
  currentImageAlt?: string;
  onImageChange: (imagePath: string) => void;
  uploadPath: string;
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

  const maxSizeLabel = formatFileSize(maxSize);

  const uploadImageToS3 = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadPath);

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
            className="h-24 w-auto cursor-pointer rounded transition-opacity hover:opacity-80"
            onClick={() => setShowImagePreview(true)}
          />
          <p className="mt-1 text-sm text-muted-foreground">Current image: {currentImageName || 'View image'}</p>
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
        <ImagePreview
          imageUrl={currentImageUrl}
          imageAlt={currentImageAlt}
          open={showImagePreview}
          onOpenChange={setShowImagePreview}
        />
      )}
    </div>
  );
}
