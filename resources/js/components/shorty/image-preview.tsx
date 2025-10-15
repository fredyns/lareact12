import { Dialog, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React from 'react';

interface ImagePreviewProps {
  imageUrl: string;
  imageAlt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreview({ imageUrl, imageAlt = 'Image', open, onOpenChange }: ImagePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 z-[10001]" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[10002] max-h-[90vh] w-[90vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-lg bg-background p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogHeader>
          <div className="mt-4">
            <img src={imageUrl} alt={imageAlt} className="h-auto w-full rounded" />
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
