import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Edit,
    Mail,
    Trash2,
    FileText,
    Image as ImageIcon,
    MapPin,
    Hash,
    Type,
    Palette,
    Globe,
    User,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { type BreadcrumbItem, Item } from '@/types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
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
    const option = enumerateOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Item: ${item.string}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {item.string}
            </h1>
            <p className="text-muted-foreground">
              Item details and information
            </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              {item.email && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{item.email}</p>
                </div>
              )}

              {item.color && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Color</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="font-medium">{item.color}</p>
                  </div>
                </div>
              )}

              {item.integer !== null && re(
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Integer (1-100)</p>
                  <p className="font-medium">{item.integer}</p>
                </div>
              )}

              {item.decimal !== null && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Decimal</p>
                  <p className="font-medium">{item.decimal}</p>
                </div>
              )}

              {item.npwp && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">NPWP</p>
                  <p className="font-medium">{item.npwp}</p>
                </div>
              )}

              {item.enumerate && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'}>
                    {getEnumerateLabel(item.enumerate)}
                  </Badge>
                </div>
              )}

              {item.user && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{item.user.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.date && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{item.date}</p>
                </div>
              )}

              {item.time && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{item.time}</p>
                </div>
              )}

              {item.datetime && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Datetime</p>
                  <p className="font-medium">{new Date(item.datetime).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Information */}
          <Card>
            <CardHeader>
              <CardTitle>Other Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.ip_address && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{item.ip_address}</p>
                </div>
              )}

              {item.boolean !== null && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Boolean</p>
                  <p className="font-medium">{item.boolean ? 'True' : 'False'}</p>
                </div>
              )}
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
              {(item.latitude !== null && item.longitude !== null &&
                typeof item.latitude === 'number' && typeof item.longitude === 'number' &&
                !isNaN(item.latitude) && !isNaN(item.longitude)) ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Latitude</p>
                      <p className="font-medium">{item.latitude}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Longitude</p>
                      <p className="font-medium">{item.longitude}</p>
                    </div>
                  </div>

                  <div className="h-64 mt-2">
                    <MapContainer
                      center={[item.latitude, item.longitude]}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[item.latitude, item.longitude]}>
                        <Popup>
                          {item.string}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No location data available</p>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.file && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)</p>
                  <a
                    href={`/storage/${item.file}`}
                    target="_blank"
                    className="flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="h-8 w-8 mr-3 text-blue-600" />
                    <div>
                      <p className="font-medium">{item.file.split('/').pop()}</p>
                      <p className="text-sm text-muted-foreground">Click to download</p>
                    </div>
                  </a>
                </div>
              )}

              {item.image && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Image (JPG, JPEG, PNG)</p>
                  <img
                    src={`/storage/${item.image}`}
                    alt={item.string}
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              {!item.file && !item.image && (
                <p className="text-sm text-muted-foreground">No files uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Text Content */}
          <Card>
            <CardHeader>
              <CardTitle>Text Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.text && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Text</p>
                  <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                    {item.text}
                  </div>
                </div>
              )}

              {item.markdown_text && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Markdown Text</p>
                  <div className="prose max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: item.markdown_text }} />
                  </div>
                </div>
              )}

              {item.wysiwyg && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">WYSIWYG Content</p>
                  <div className="prose max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: item.wysiwyg }} />
                  </div>
                </div>
              )}

              {!item.text && !item.markdown_text && !item.wysiwyg && (
                <p className="text-sm text-muted-foreground">No text content available</p>
              )}
            </CardContent>
          </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
