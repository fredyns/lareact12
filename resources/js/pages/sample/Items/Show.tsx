import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Item } from '@/types';
import { normalizeMarkdown } from '@/utils/markdown';
import { Head, Link, router } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Edit, FileText, Trash2 } from 'lucide-react';
import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { route } from 'ziggy-js';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Props {
  item: Item;
  enumerateOptions: { value: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('dashboard'),
  },
  {
    title: 'Sample Items',
    href: route('sample.items.index'),
  },
  {
    title: 'Item Details',
    href: '#',
  },
];

export default function Show({ item, enumerateOptions }: Props) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      router.delete(route('sample.items.destroy', item.id));
    }
  };

  const getEnumerateLabel = (value: string | null) => {
    if (!value) return 'N/A';
    const option = enumerateOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Item: ${item.string}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.string}</h1>
            <p className="text-muted-foreground">Item details and information</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={route('sample.items.index')}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </Link>
            {item.id ? (
              <Link href={route('sample.items.edit', item.id)}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Item
                </Button>
              </Link>
            ) : (
              <Button disabled>
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </Button>
            )}
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Item
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">String</p>
                  <p className="font-medium">{item.string}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{item.email || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Color</p>
                  <div className="flex items-center space-x-2">
                    {item.color && (
                      <div
                        className="h-6 w-6 rounded border"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />
                    )}
                    <p className="font-medium">{item.color || '-'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Integer</p>
                  <p className="font-medium">{item.integer || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Decimal</p>
                  <p className="font-medium">{item.decimal || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">NPWP</p>
                  <p className="font-medium">{item.npwp || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {item.enumerate && (
                    <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'}>
                      {getEnumerateLabel(item.enumerate)}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{item.user?.name || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{item.date || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{item.time || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Datetime</p>
                  <p className="font-medium">{item.datetime ? new Date(item.datetime).toLocaleString() : '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Other Information */}
            <Card>
              <CardHeader>
                <CardTitle>Other Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{item.ip_address || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Boolean</p>
                  <p className="font-medium">{item.boolean ? 'True' : 'False'}</p>
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-medium">{item.latitude ?? '-'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-medium">{item.longitude ?? '-'}</p>
                  </div>
                </div>

                <div className="mt-2 h-64">
                  {item.latitude !== null &&
                  item.longitude !== null &&
                  typeof item.latitude === 'number' &&
                  typeof item.longitude === 'number' &&
                  !isNaN(item.latitude) &&
                  !isNaN(item.longitude) ? (
                    <>
                      <MapContainer
                        center={[item.latitude, item.longitude]}
                        zoom={13}
                        style={{
                          height: '100%',
                          width: '100%',
                        }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[item.latitude, item.longitude]}>
                          <Popup>{item.string}</Popup>
                        </Marker>
                      </MapContainer>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No location data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)</p>
                  {item.file_url ? (
                    <a
                      href={item.file_url}
                      target="_blank"
                      className="flex items-center rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                      <FileText className="mr-3 h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{(item.file ?? '').split('/').pop() || 'Download file'}</p>
                        <p className="text-sm text-muted-foreground">Click to download</p>
                      </div>
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Image (JPG, JPEG, PNG)</p>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.string} className="h-auto max-w-full rounded-lg border" />
                  ) : (
                    <p className="text-sm text-muted-foreground">No image available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Text Content */}
            <Card>
              <CardHeader>
                <CardTitle>Text Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Text</p>
                  <div className="rounded-lg bg-muted/50 p-4 whitespace-pre-wrap">{item.text || '-'}</div>
                </div>

                {item.markdown_text && (
                  <div className="mt-2">
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Markdown Content</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="mt-6 mb-2 text-2xl font-bold" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="mt-5 mb-2 text-xl font-bold" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="mt-4 mb-2 text-lg font-bold" {...props} />,
                          h4: ({ node, ...props }) => <h4 className="mt-3 mb-1 text-base font-bold" {...props} />,
                          h5: ({ node, ...props }) => <h5 className="mt-3 mb-1 text-sm font-bold" {...props} />,
                          h6: ({ node, ...props }) => <h6 className="mt-3 mb-1 text-xs font-bold" {...props} />,
                          code({
                            inline,
                            className,
                            children,
                            ...props
                          }: {
                            inline?: boolean;
                            className?: string;
                            children?: React.ReactNode;
                            [key: string]: any;
                          }) {
                            if (inline) {
                              return (
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...props}>
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <pre className="my-4 overflow-x-auto rounded-md bg-muted p-4">
                                <code className="font-mono text-sm" {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                          p: ({ node, ...props }) => <p className="my-2" {...props} />,
                          a: ({ node, ...props }) => (
                            <a className="text-primary underline hover:text-primary/80" {...props} />
                          ),
                          ul: ({ node, ...props }) => <ul className="my-4 list-disc pl-6" {...props} />,
                          ol: ({ node, ...props }) => <ol className="my-4 list-decimal pl-6" {...props} />,
                          li: ({ node, ...props }) => <li className="my-1" {...props} />,
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="my-4 border-l-4 border-muted-foreground pl-4 text-muted-foreground italic"
                              {...props}
                            />
                          ),
                          hr: ({ node, ...props }) => <hr className="my-6 border-muted" {...props} />,
                          img: ({ node, ...props }) => (
                            <img className="my-4 h-auto max-w-full rounded-md" {...props} alt={props.alt || ''} />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="my-4 overflow-x-auto">
                              <table className="w-full border-collapse" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => <thead className="bg-muted/50" {...props} />,
                          tbody: ({ node, ...props }) => <tbody {...props} />,
                          tr: ({ node, ...props }) => <tr className="border-b border-border" {...props} />,
                          th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-medium" {...props} />,
                          td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
                        }}
                      >
                        {normalizeMarkdown(item.markdown_text)}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
