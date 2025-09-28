import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Item } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Edit, FileText, Trash2 } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
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
                    <p className="text-sm text-muted-foreground">file: {item.file || '-'}</p>
                    <p className="text-sm text-muted-foreground">file_url: {item.file_url || '-'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Image (JPG, JPEG, PNG)</p>
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.string}
                      className="h-auto max-w-full rounded-lg border"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No image available</p>
                  )}
                    <p className="text-sm text-muted-foreground">image: {item.image || '-'}</p>
                    <p className="text-sm text-muted-foreground">image_url: {item.image_url || '-'}</p>
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

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Markdown Text</p>
                  <div className="prose dark:prose-invert max-w-none">
                    {item.markdown_text ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.markdown_text,
                        }}
                      />
                    ) : (
                      <>-</>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">WYSIWYG Content</p>
                  <div className="prose dark:prose-invert max-w-none">
                    {item.wysiwyg ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.wysiwyg,
                        }}
                      />
                    ) : (
                      <>-</>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
