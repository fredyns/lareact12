import { FileDropzone } from '@/components/ui/file-dropzone';
import { Label } from '@/components/ui/label';
import { formatFileSize } from '@/utils/upload';
import { useState } from 'react';

interface InputFileProps {
  id: string;
  label: string;
  currentFileUrl?: string | null;
  currentFileName?: string;
  onFileChange: (filePath: string) => void;
  uploadPath: string;
  accept: string;
  maxSize: number;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function InputFile({
  id,
  label,
  currentFileUrl,
  currentFileName,
  onFileChange,
  uploadPath,
  accept,
  maxSize,
  required = false,
  disabled = false,
  loading = false,
}: InputFileProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const maxSizeLabel = formatFileSize(maxSize);

  const uploadFileToS3 = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', uploadPath);

    // Always use the file upload endpoint
    const endpoint = '/upload/file';

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
      // Upload file to S3
      const filePath = await uploadFileToS3(file);

      if (filePath) {
        // Set the file path in form data
        onFileChange(filePath);
        setIsSuccess(true);
      } else {
        setError('Failed to upload file');
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
      {currentFileUrl ? (
        <div className="mb-2">
          <a
            href={currentFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Current file: {currentFileName || 'Download file'}
          </a>
        </div>
      ) : null}
      {!disabled && !loading && (
        <>
          <FileDropzone
            accept={accept}
            maxSize={maxSize}
            onFileDrop={handleFileDrop}
            disabled={disabled || loading}
            isUploading={isUploading}
            isSuccess={isSuccess}
            currentFileName={currentFileName}
            error={error}
          />
          <p className="text-xs text-muted-foreground">Maximum file size: {maxSizeLabel}</p>
        </>
      )}
    </div>
  );
}
