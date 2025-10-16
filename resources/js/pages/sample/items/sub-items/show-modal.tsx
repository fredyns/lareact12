import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import sample from '@/routes/sample';

interface SubItemShowModalProps {
  itemId: string;
  subItemId: string;
  subItem?: SubItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubItemShowModal({ itemId, subItemId, subItem: subItemProp, open, onOpenChange }: SubItemShowModalProps) {
  const [subItem, setSubItem] = useState<SubItem | null>(subItemProp || null);
  const [loading, setLoading] = useState(!subItemProp);

  useEffect(() => {
    if (open && subItemId) {
      if (subItemProp) {
        setSubItem(subItemProp);
        setLoading(false);
      } else {
        fetchSubItem();
      }
    }
  }, [open, subItemId, subItemProp]);

  const fetchSubItem = async () => {
    setLoading(true);
    try {
      const url = sample.items.subItems.show.url({ item: itemId, subItem: subItemId });
      const response = await fetch(url, {
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
        <DialogOverlay className="z-[4999]" />
        <DialogContent className="z-[5000] max-h-[90vh] w-[95vw] lg:w-[85vw] xl:w-[80vw] 2xl:w-[1400px] !max-w-none flex flex-col" aria-describedby={undefined}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {loading ? <Skeleton className="h-6 w-48" /> : `Sub Item: ${subItem?.string}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FieldSkeleton />
                    <FieldSkeleton />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                {/* Parent Item Card */}
                {subItem?.item && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Parent Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ShowField label="Name" value={subItem.item.string} />
                      <ShowField label="Email" value={subItem.item.email} />
                    </CardContent>
                  </Card>
                )}

                {/* Basic Information Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ShowField label="String" value={subItem?.string} />

                    <ShowField label="Email" value={subItem?.email} />

                    <ShowColor color={subItem?.color ?? null} />

                    <ShowField label="Integer" value={subItem?.integer} />

                    <ShowField label="Decimal" value={subItem?.decimal} />

                    <ShowField label="NPWP" value={subItem?.npwp} />

                    <ShowBadge
                      label="Status"
                      value={subItem?.enumerate || 'N/A'}
                      variant={subItem?.enumerate === 'enable' ? 'default' : 'secondary'}
                      icon={subItem?.enumerate === 'enable' ? Check : X}
                    />

                    <ShowField label="User" value={subItem?.user?.name} />
                  </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                  <CardHeader>
                    <CardTitle>Date & Time</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ShowDatetime label="Date" value={subItem?.date} format="ddd, MMM dd, yyyy" />

                    <ShowDatetime label="Time" value={subItem?.time} format="HH:mm" />

                    <ShowDatetime label="Datetime" value={subItem?.datetime} format="ddd, MMM dd, yyyy HH:mm" />
                  </CardContent>
                </Card>

                {/* Other Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Other Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ShowField label="IP Address" value={subItem?.ip_address} />

                    <ShowField label="Boolean" value={subItem?.boolean ? 'True' : 'False'} />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ShowMap
                      latitude={subItem?.latitude ?? null}
                      longitude={subItem?.longitude ?? null}
                      popupText={subItem?.string}
                    />
                  </CardContent>
                </Card>

                {/* Files */}
                <Card>
                  <CardHeader>
                    <CardTitle>Files</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ShowFile
                      label="File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)"
                      url={subItem?.file_url ?? null}
                      path={subItem?.file ?? null}
                    />

                    <ShowImage
                      label="Image (JPG, JPEG, PNG)"
                      url={subItem?.image_url ?? null}
                      alt={subItem?.string ?? 'Sub Item Image'}
                    />
                  </CardContent>
                </Card>

                {/* Text Content */}
                <Card>
                  <CardHeader>
                    <CardTitle>Text Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ShowText label="Text" value={subItem?.text} />

                    <ShowMarkdown label="Markdown Content" value={subItem?.markdown_text} />

                    <ShowWysiwyg label="WYSIWYG Content" value={subItem?.wysiwyg} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
