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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Type className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.string}</p>
                  <p className="text-sm text-muted-foreground">String Value</p>
                </div>
              </div>

              {item.email && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.email}</p>
                    <p className="text-sm text-muted-foreground">Email Address</p>
                  </div>
                </div>
              )}

              {item.color && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div
                        className="w-6 h-6 rounded mr-2 border"
                        style={{ backgroundColor: item.color }}
                      />
                      <p className="font-medium">{item.color}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Color</p>
                  </div>
                </div>
              )}

              {item.enumerate && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    {item.enumerate === 'enable' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'}>
                      {getEnumerateLabel(item.enumerate)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Status</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Numeric Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Numeric Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.integer !== null && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <Hash className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.integer}</p>
                    <p className="text-sm text-muted-foreground">Integer Value</p>
                  </div>
                </div>
              )}

              {item.decimal !== null && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900/20">
                    <Hash className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.decimal}</p>
                    <p className="text-sm text-muted-foreground">Decimal Value</p>
                  </div>
                </div>
              )}

              {item.npwp && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.npwp}</p>
                    <p className="text-sm text-muted-foreground">NPWP</p>
                  </div>
                </div>
              )}

              {item.boolean !== null && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                    {item.boolean ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.boolean ? 'True' : 'False'}</p>
                    <p className="text-sm text-muted-foreground">Boolean Value</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date & Time Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Time Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">{formatDate(item.created_at)}</p>
                  <p className="text-sm text-muted-foreground">Created At</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">{formatDate(item.updated_at)}</p>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                </div>
              </div>

              {item.date && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.date}</p>
                    <p className="text-sm text-muted-foreground">Date Field</p>
                  </div>
                </div>
              )}

              {item.time && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.time}</p>
                    <p className="text-sm text-muted-foreground">Time Field</p>
                  </div>
                </div>
              )}

              {item.datetime && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/20">
                    <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium">{new Date(item.datetime).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">DateTime Field</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.ip_address && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <Globe className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">{item.ip_address}</p>
                    <p className="text-sm text-muted-foreground">IP Address</p>
                  </div>
                </div>
              )}

              {item.user && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.user.name}</p>
                    <p className="text-sm text-muted-foreground">Associated User</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Item ID Card */}
          <Card>
            <CardHeader>
              <CardTitle>Item ID</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted p-3">
                <code className="font-mono text-sm">{item.id}</code>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                This is the unique identifier for this item in the system.
              </p>
            </CardContent>
          </Card>

          {/* Location Card */}
          {(item.latitude !== null && item.longitude !== null && 
            typeof item.latitude === 'number' && typeof item.longitude === 'number' &&
            !isNaN(item.latitude) && !isNaN(item.longitude)) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="font-medium">{item.latitude}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="font-medium">{item.longitude}</p>
                  </div>
                </div>
                <div className="h-64 rounded overflow-hidden border">
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
              </CardContent>
            </Card>
          )}

          {/* File Card */}
          {item.file && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  File
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Image Card */}
          {item.image && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={`/storage/${item.image}`}
                  alt={item.string}
                  className="max-w-full h-auto rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* Text Content Card */}
          {item.text && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Text Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                  {item.text}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Markdown Text Card */}
          {item.markdown_text && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Markdown Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: item.markdown_text }} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* WYSIWYG Content Card */}
          {item.wysiwyg && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="mr-2 h-5 w-5" />
                  WYSIWYG Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: item.wysiwyg }} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
