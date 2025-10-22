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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import sample from '@/routes/sample';
import { SubItem } from '@/types';
import { Check, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SubItemShowModalProps {
  subItem: SubItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubItemShowModal({ subItem: subItemProp, open, onOpenChange }: SubItemShowModalProps) {
  // Initialize with prop data for optimistic UI
  const [subItem, setSubItem] = useState<SubItem | null>(subItemProp);
  const [loading, setLoading] = useState(true);
  const [minTabHeight, setMinTabHeight] = useState<number>(0);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (open && subItemProp?.id) {
      // Set initial data immediately (optimistic UI)
      setSubItem(subItemProp);
      fetchSubItem();
    }
  }, [open, subItemProp?.id]);

  // Calculate max height across all tabs after data loads
  useEffect(() => {
    if (!loading && subItem) {
      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        const heights = Object.values(tabRefs.current)
          .filter((ref): ref is HTMLDivElement => ref !== null)
          .map((ref) => ref.scrollHeight);

        if (heights.length > 0) {
          const maxHeight = Math.max(...heights);
          setMinTabHeight(maxHeight);
        }
      }, 100);
    }
  }, [loading, subItem]);

  const fetchSubItem = async () => {
    setLoading(true);
    try {
      const url = sample.items.subItems.show.url({ item: subItemProp.item_id, subItem: subItemProp.id });
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[4999]" />
        <DialogContent
          className="z-[5000] flex max-h-[90vh] w-[95vw] !max-w-none flex-col lg:w-[85vw] xl:w-[80vw] 2xl:w-[1400px]"
          aria-describedby={undefined}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{`Sub Item`}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-6">
              {/* Main Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Main Information</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1 md:w-1/3">
                      <ShowField label="String" value={subItem?.string} loading={false} />
                    </div>

                    <div className="flex-1 md:w-1/3">
                      <ShowField label="Email" value={subItem?.email} loading={false} />
                    </div>

                    <div className="flex-1 md:w-1/3">
                      <ShowBadge
                        label="Status"
                        value={subItem?.enumerate || 'N/A'}
                        variant={subItem?.enumerate === 'enable' ? 'default' : 'secondary'}
                        icon={subItem?.enumerate === 'enable' ? Check : X}
                        loading={false}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <ShowText label="Text" value={subItem?.text} loading={loading} />
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="datetime">Date & Time</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>

                <TabsContent
                  value="basic"
                  className="mt-6"
                  ref={(el) => {
                    tabRefs.current['basic'] = el;
                  }}
                  style={{ minHeight: minTabHeight > 0 ? `${minTabHeight}px` : undefined }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ShowColor color={subItem?.color ?? null} loading={loading} />

                      <ShowField label="Integer" value={subItem?.integer} loading={false} />

                      <ShowField label="Decimal" value={subItem?.decimal} loading={loading} />

                      <ShowField label="NPWP" value={subItem?.npwp} loading={loading} />

                      <ShowField label="User" value={subItem?.user?.name} loading={loading} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="datetime"
                  className="mt-6"
                  ref={(el) => {
                    tabRefs.current['datetime'] = el;
                  }}
                  style={{ minHeight: minTabHeight > 0 ? `${minTabHeight}px` : undefined }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Date & Time</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ShowDatetime label="Date" value={subItem?.date} format="ddd, MMM dd, yyyy" loading={loading} />

                      <ShowDatetime label="Time" value={subItem?.time} format="HH:mm" loading={loading} />

                      <ShowDatetime
                        label="Datetime"
                        value={subItem?.datetime}
                        format="ddd, MMM dd, yyyy HH:mm"
                        loading={loading}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="other"
                  className="mt-6"
                  ref={(el) => {
                    tabRefs.current['other'] = el;
                  }}
                  style={{ minHeight: minTabHeight > 0 ? `${minTabHeight}px` : undefined }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Other Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ShowField label="IP Address" value={subItem?.ip_address} loading={loading} />

                      <ShowField label="Boolean" value={subItem?.boolean ? 'True' : 'False'} loading={loading} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="location"
                  className="mt-6"
                  ref={(el) => {
                    tabRefs.current['location'] = el;
                  }}
                  style={{ minHeight: minTabHeight > 0 ? `${minTabHeight}px` : undefined }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={'w-sm'}>
                        <ShowMap
                          latitude={subItem?.latitude ?? null}
                          longitude={subItem?.longitude ?? null}
                          popupText={subItem?.string}
                          loading={loading}
                          ratio={4 / 3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="files"
                  className="mt-6"
                  ref={(el) => {
                    tabRefs.current['files'] = el;
                  }}
                  style={{ minHeight: minTabHeight > 0 ? `${minTabHeight}px` : undefined }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Files</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ShowFile
                        label="File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)"
                        url={subItem?.file_url ?? null}
                        path={subItem?.file ?? null}
                        loading={loading}
                      />

                      <div className={'w-sm'}>
                        <ShowImage
                          label="Image (JPG, JPEG, PNG)"
                          url={subItem?.image_url ?? null}
                          alt={subItem?.string ?? 'Sub Item Image'}
                          loading={loading}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent
                  value="content"
                  className="mt-6"
                  ref={(el) => {
                    tabRefs.current['content'] = el;
                  }}
                  style={{ minHeight: minTabHeight > 0 ? `${minTabHeight}px` : undefined }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Text Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ShowMarkdown label="Markdown Content" value={subItem?.markdown_text} loading={loading} />

                      <ShowWysiwyg label="WYSIWYG Content" value={subItem?.wysiwyg} loading={loading} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex flex-shrink-0 justify-end border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
