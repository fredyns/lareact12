import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileDropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string;
  maxSize?: number;
  onFileDrop: (file: File) => void;
  disabled?: boolean;
  currentFileName?: string;
  isUploading?: boolean;
  isSuccess?: boolean;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

export function FileDropzone({
  accept,
  maxSize,
  onFileDrop,
  disabled = false,
  currentFileName,
  isUploading = false,
  isSuccess = false,
  error,
  className,
  children,
  ...props
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled || isUploading) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0]; // Take only the first file
      
      // Check file size if maxSize is provided
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        alert(`File size must be less than ${maxSizeMB}MB`);
        return;
      }
      
      // Check file type if accept is provided
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const fileType = file.type;
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension === type.toLowerCase();
          } else {
            return fileType.match(new RegExp(type.replace('*', '.*')));
          }
        });
        
        if (!isAccepted) {
          alert(`File type not accepted. Please use: ${accept}`);
          return;
        }
      }
      
      onFileDrop(file);
    }
  }, [disabled, isUploading, maxSize, accept, onFileDrop]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file size if maxSize is provided
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        alert(`File size must be less than ${maxSizeMB}MB`);
        return;
      }
      
      // Check file type if accept is provided
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const fileType = file.type;
        
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension === type.toLowerCase();
          } else {
            return fileType.match(new RegExp(type.replace('*', '.*')));
          }
        });
        
        if (!isAccepted) {
          alert(`File type not accepted. Please use: ${accept}`);
          return;
        }
      }
      
      onFileDrop(file);
    }
  }, [maxSize, accept, onFileDrop]);

  const handleButtonClick = useCallback(() => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled, isUploading]);

  return (
    <div className={cn("flex flex-col space-y-2", className)} {...props}>
      <div
        className={cn(
          "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled || isUploading ? "cursor-not-allowed opacity-60" : "hover:border-primary/50",
          error ? "border-destructive" : "",
          className
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-medium">Uploading...</p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">Upload successful</p>
            {currentFileName && (
              <p className="max-w-full truncate text-xs text-muted-foreground">{currentFileName}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="rounded-full bg-background p-2 text-muted-foreground">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Drag & drop your file here or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {accept ? `Accepts: ${accept.replace(/\./g, '')}` : "Upload a file"}
                {maxSize ? ` (Max ${Math.round(maxSize / (1024 * 1024))}MB)` : ""}
              </p>
            </div>
          </div>
        )}
        
        {children}
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
