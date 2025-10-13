import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ShowBadge } from '@/components/shorty/show-badge';
import { ShowColor } from '@/components/shorty/show-color';
import { ShowDatetime } from '@/components/shorty/show-datetime';
import { ShowField } from '@/components/shorty/show-field';
import { ShowFile } from '@/components/shorty/show-file';
import { ShowImage } from '@/components/shorty/show-image';
import { ShowMap } from '@/components/shorty/show-map';
import { ShowMarkdown } from '@/components/shorty/show-markdown';
import { ShowText } from '@/components/shorty/show-text';
import { ShowWysiwyg } from '@/components/shorty/show-wysiwyg';
import { SubItem } from '@/types';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubItemViewModalProps {
  subItemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubItemViewModal({ subItemId, open, onOpenChange }: SubItemViewModalProps) {
  const [subItem, setSubItem] = useState<SubItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && subItemId) {
      fetchSubItem();
    }
  }, [open, subItemId]);

  const fetchSubItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/sample/sub-items/${subItemId}`, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        setSubItem(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch sub-item:', error);
    } finally {
      setLoading(false);
    }
  };

  const FieldSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-6 w-full" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[9999]" />
        <DialogContent className="z-[10000] max-h-[90vh] max-w-4xl overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {loading ? <Skeleton className="h-6 w-48" /> : `Sub Item: ${subItem?.string}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="String" value={subItem?.string} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="Email" value={subItem?.email} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowColor color={subItem?.color ?? null} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="Integer" value={subItem?.integer} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="Decimal" value={subItem?.decimal} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="NPWP" value={subItem?.npwp} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowBadge
                  label="Status"
                  value={subItem?.enumerate || 'N/A'}
                  variant={subItem?.enumerate === 'enable' ? 'default' : 'secondary'}
                  icon={subItem?.enumerate === 'enable' ? Check : X}
                />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="User" value={subItem?.user?.name} />
              )}
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <h3 className="font-semibold">Date & Time</h3>

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowDatetime label="Date" value={subItem?.date} format="ddd, MMM dd, yyyy" />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowDatetime label="Time" value={subItem?.time} format="HH:mm" />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowDatetime label="Datetime" value={subItem?.datetime} format="ddd, MMM dd, yyyy HH:mm" />
              )}
            </div>

            {/* Other Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Other Information</h3>

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="IP Address" value={subItem?.ip_address} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowField label="Boolean" value={subItem?.boolean ? 'True' : 'False'} />
              )}
            </div>

            {/* Location */}
            {!loading && subItem?.latitude && subItem?.longitude && (
              <div className="space-y-4">
                <h3 className="font-semibold">Location</h3>
                <ShowMap
                  latitude={subItem.latitude}
                  longitude={subItem.longitude}
                  popupText={subItem.string}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Files */}
            <div className="space-y-4">
              <h3 className="font-semibold">Files</h3>

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowFile
                  label="File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)"
                  url={subItem?.file_url ?? null}
                  path={subItem?.file ?? null}
                />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowImage
                  label="Image (JPG, JPEG, PNG)"
                  url={subItem?.image_url ?? null}
                  alt={subItem?.string ?? 'Sub Item Image'}
                />
              )}
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <h3 className="font-semibold">Text Content</h3>

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowText label="Text" value={subItem?.text} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowMarkdown label="Markdown Content" value={subItem?.markdown_text} />
              )}

              {loading ? (
                <FieldSkeleton />
              ) : (
                <ShowWysiwyg label="WYSIWYG Content" value={subItem?.wysiwyg} />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
