import { ImagePreview } from '@/components/shorty/image-preview';
import { useState } from 'react';

interface ShowImageProps {
  label: string;
  url: string | null;
  alt: string;
}

export function ShowImage({ label, url, alt }: ShowImageProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {url ? (
        <>
          <img
            src={url}
            alt={alt}
            className="h-auto max-w-full cursor-pointer rounded-lg border transition-opacity hover:opacity-80"
            onClick={() => setShowPreview(true)}
          />
          <ImagePreview imageUrl={url} imageAlt={alt} open={showPreview} onOpenChange={setShowPreview} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No image available</p>
      )}
    </div>
  );
}
