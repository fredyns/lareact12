import { Button } from '@/components/ui/button';
import { ImagePreview } from '@/components/shorty/image-preview';
import { ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface ImagePreviewButtonProps {
  imageUrl: string | null | undefined;
  imageAlt?: string;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ImagePreviewButton({
  imageUrl,
  imageAlt = 'Image',
  buttonText = 'Preview',
  variant = 'outline',
  size = 'sm',
}: ImagePreviewButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!imageUrl) {
    return <span className="text-sm text-muted-foreground">No image</span>;
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setShowPreview(true)}>
        <ImageIcon className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
      <ImagePreview
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </>
  );
}
