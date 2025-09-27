import React, { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import MDEditor from '@uiw/react-md-editor';
import { Sketch } from '@uiw/react-color';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

// Fix for Leaflet marker icons
interface LeafletIcon {
  _getIconUrl?: string;
}

delete (L.Icon.Default.prototype as LeafletIcon)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  enumerateOptions: SelectOption[];
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
    title: 'Create Item',
    href: route('sample.items.create'),
  },
];

interface DraggableMarkerProps {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}

const DraggableMarker = ({ position, onPositionChange }: DraggableMarkerProps) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      onPositionChange(lat, lng);
    },
  });

  return (
    <Marker
      position={markerPosition}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setMarkerPosition([position.lat, position.lng]);
          onPositionChange(position.lat, position.lng);
        },
      }}
    />
  );
};

export default function Create({ enumerateOptions }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [markdownValue, setMarkdownValue] = useState<string | undefined>('');
  const [wysiwygValue, setWysiwygValue] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    string: '',
    email: '',
    color: '',
    integer: '',
    decimal: '',
    npwp: '',
    datetime: '',
    date: '',
    time: '',
    ip_address: '',
    boolean: false,
    enumerate: '',
    text: '',
    file: null as File | null,
    image: null as File | null,
    markdown_text: '',
    wysiwyg: '',
    latitude: 0,
    longitude: 0,
    user_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('sample.items.store'));
  };

  const loadUserOptions = async (inputValue: string) => {
    try {
      const response = await fetch(`/select-options/users?search=${inputValue}`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading user options:', error);
      return [];
    }
  };

  const handlePositionChange = (lat: number, lng: number) => {
    setData({
      ...data,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'file' | 'image') => {
    if (e.target.files && e.target.files[0]) {
      setData(field, e.target.files[0]);
    }
  };

  useEffect(() => {
    setData('markdown_text', markdownValue || '');
  }, [markdownValue]);

  useEffect(() => {
    setData('wysiwyg', wysiwygValue);
  }, [wysiwygValue]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Item" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Item</h1>
            <p className="text-muted-foreground">Add a new sample item to the system</p>
          </div>
          <Link href={route('sample.items.index')}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="string">String *</Label>
                    <Input
                      id="string"
                      type="text"
                      value={data.string}
                      onChange={(e) => setData('string', e.target.value)}
                      placeholder="Enter string value"
                      className={errors.string ? 'border-destructive' : ''}
                      required
                    />
                    {errors.string && <p className="text-sm text-destructive">{errors.string}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email || ''}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="Enter email address"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color"
                        type="text"
                        value={data.color || ''}
                        onChange={(e) => setData('color', e.target.value)}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        placeholder="Select a color"
                        className={errors.color ? 'border-destructive' : ''}
                        readOnly
                      />
                      <div
                        className="h-10 w-10 cursor-pointer rounded-md border"
                        style={{ backgroundColor: data.color || '#fff' }}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      />
                    </div>
                    {showColorPicker && (
                      <div className="absolute z-10 mt-2">
                        <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                        <div className="relative">
                          <Sketch color={data.color || '#fff'} onChange={(color) => setData('color', color.hex)} />
                        </div>
                      </div>
                    )}
                    {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="integer">Integer</Label>
                    <Input
                      type="number"
                      id="integer"
                      min="0"
                      max="100"
                      value={data.integer || '0'}
                      onChange={(e) => setData('integer', e.target.value)}
                      className="w-full"
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        id="integer-slider"
                        min="0"
                        max="100"
                        value={data.integer || '0'}
                        onChange={(e) => setData('integer', e.target.value)}
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                      />
                    </div>
                    {errors.integer && <p className="text-sm text-destructive">{errors.integer}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimal">Decimal</Label>
                    <Input
                      id="decimal"
                      type="number"
                      step="0.01"
                      value={data.decimal || ''}
                      onChange={(e) => setData('decimal', e.target.value)}
                      placeholder="Enter decimal value"
                      className={errors.decimal ? 'border-destructive' : ''}
                    />
                    {errors.decimal && <p className="text-sm text-destructive">{errors.decimal}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="npwp">NPWP</Label>
                    <Input
                      id="npwp"
                      type="text"
                      value={data.npwp || ''}
                      onChange={(e) => setData('npwp', e.target.value)}
                      placeholder="99.999.999.9-999.999"
                      pattern="[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}"
                      title="Please enter NPWP in format: 99.999.999.9-999.999"
                      className={errors.npwp ? 'border-destructive' : ''}
                    />
                    {errors.npwp && <p className="text-sm text-destructive">{errors.npwp}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enumerate">Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {enumerateOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setData('enumerate', option.value)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            data.enumerate === option.value
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                      {data.enumerate && (
                        <button
                          type="button"
                          onClick={() => setData('enumerate', '')}
                          className="px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                          title="Clear selection"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {errors.enumerate && <p className="text-sm text-destructive">{errors.enumerate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_id">User</Label>
                    <AsyncSelect
                      id="user_id"
                      cacheOptions
                      defaultOptions
                      loadOptions={loadUserOptions}
                      onChange={(selected: SelectOption | null) => setData('user_id', selected ? selected.value : '')}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      placeholder="Search and select user"
                    />
                    {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Date & Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={data.date || ''}
                      onChange={(e) => setData('date', e.target.value)}
                      className={errors.date ? 'border-destructive' : ''}
                    />
                    {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={data.time || ''}
                      onChange={(e) => setData('time', e.target.value)}
                      className={errors.time ? 'border-destructive' : ''}
                    />
                    {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="datetime">Datetime</Label>
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={data.datetime || ''}
                      onChange={(e) => setData('datetime', e.target.value)}
                      className={errors.datetime ? 'border-destructive' : ''}
                    />
                    {errors.datetime && <p className="text-sm text-destructive">{errors.datetime}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Other Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address</Label>
                    <Input
                      id="ip_address"
                      type="text"
                      value={data.ip_address || ''}
                      onChange={(e) => setData('ip_address', e.target.value)}
                      placeholder="192.168.1.1"
                      className={errors.ip_address ? 'border-destructive' : ''}
                    />
                    {errors.ip_address && <p className="text-sm text-destructive">{errors.ip_address}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="boolean"
                        checked={!!data.boolean}
                        onCheckedChange={(checked) => setData('boolean', !!checked)}
                      />
                      <Label htmlFor="boolean">Boolean</Label>
                    </div>
                    {errors.boolean && <p className="text-sm text-destructive">{errors.boolean}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        min="-90"
                        max="90"
                        value={data.latitude}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          setData('latitude', lat);
                        }}
                        placeholder="Enter latitude"
                        className={errors.latitude ? 'border-destructive' : ''}
                      />
                      {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        min="-180"
                        max="180"
                        value={data.longitude}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          setData('longitude', lng);
                        }}
                        placeholder="Enter longitude"
                        className={errors.longitude ? 'border-destructive' : ''}
                      />
                      {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
                    </div>
                  </div>

                  <div className="mt-2 h-64">
                    <MapContainer
                      center={[data.latitude || 0, data.longitude || 0]}
                      zoom={2}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <DraggableMarker
                        position={[data.latitude || 0, data.longitude || 0]}
                        onPositionChange={handlePositionChange}
                      />
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Files */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)</Label>
                    <Input
                      type="file"
                      id="file"
                      onChange={(e) => handleFileChange(e, 'file')}
                      accept=".pdf,.docx,.pptx,.xlsx,.zip,.rar"
                      className={errors.file ? 'border-destructive' : ''}
                    />
                    {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image (JPG, JPEG, PNG)</Label>
                    <Input
                      type="file"
                      id="image"
                      onChange={(e) => handleFileChange(e, 'image')}
                      accept=".jpg,.jpeg,.png"
                      className={errors.image ? 'border-destructive' : ''}
                    />
                    {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Text Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Text Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text">Text</Label>
                    <textarea
                      id="text"
                      value={data.text || ''}
                      onChange={(e) => setData('text', e.target.value)}
                      rows={3}
                      placeholder="Enter text content"
                      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.text ? 'border-destructive' : ''}`}
                    />
                    {errors.text && <p className="text-sm text-destructive">{errors.text}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="markdown_text">Markdown Text</Label>
                    <MDEditor value={markdownValue} onChange={setMarkdownValue} />
                    {errors.markdown_text && <p className="text-sm text-destructive">{errors.markdown_text}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wysiwyg">WYSIWYG Content</Label>
                    <Editor
                      id="wysiwyg"
                      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                      licenseKey="gpl"
                      init={{
                        height: 300,
                        menubar: false,
                        branding: false,
                        promotion: false,
                        plugins: [
                          'advlist',
                          'autolink',
                          'lists',
                          'link',
                          'image',
                          'charmap',
                          'anchor',
                          'searchreplace',
                          'visualblocks',
                          'code',
                          'fullscreen',
                          'insertdatetime',
                          'media',
                          'table',
                          'help',
                          'wordcount',
                        ],
                        toolbar:
                          'undo redo | formatselect | ' +
                          'bold italic backcolor | alignleft aligncenter ' +
                          'alignright alignjustify | bullist numlist outdent indent | ' +
                          'removeformat | help',
                        content_style:
                          'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 14px }',
                        setup: (editor: TinyMCEEditor) => {
                          editor.on('change', () => {
                            setWysiwygValue(editor.getContent());
                          });
                        },
                      }}
                      value={wysiwygValue}
                      onEditorChange={setWysiwygValue}
                    />
                    {errors.wysiwyg && <p className="text-sm text-destructive">{errors.wysiwyg}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              {processing ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
