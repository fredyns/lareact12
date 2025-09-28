import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Item } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { Sketch } from '@uiw/react-color';
import MDEditor from '@uiw/react-md-editor';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { route } from 'ziggy-js';

// Define interface for Leaflet Icon prototype
interface LeafletIconPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}

// Fix for Leaflet marker icons
delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Props {
  item: Item;
  enumerateOptions: { value: string; label: string }[];
}

interface SelectOption {
  value: string;
  label: string;
}

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
    title: 'Edit Item',
    href: '#',
  },
];

export default function Edit({ item, enumerateOptions }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [markdownValue, setMarkdownValue] = useState<string | undefined>(item.markdown_text || '');
  const [wysiwygValue, setWysiwygValue] = useState(item.wysiwyg || '');

  const { data, setData, put, processing, errors } = useForm({
    string: item.string,
    email: item.email || '',
    color: item.color || '',
    integer: item.integer?.toString() || '',
    decimal: item.decimal?.toString() || '',
    npwp: item.npwp || '',
    datetime: item.datetime ? new Date(item.datetime).toISOString().slice(0, 16) : '',
    date: item.date || '',
    time: item.time || '',
    ip_address: item.ip_address || '',
    boolean: item.boolean || false,
    enumerate: item.enumerate || '',
    text: item.text || '',
    file: null as File | null,
    image: null as File | null,
    markdown_text: item.markdown_text || '',
    wysiwyg: item.wysiwyg || '',
    latitude: item.latitude || 0,
    longitude: item.longitude || 0,
    user_id: item.user_id || '',
    _method: 'PUT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('sample.items.update', item.id));
  };

  const loadUserOptions = async (inputValue: string) => {
    try {
      const response = await fetch(`/select-options/users?search=${inputValue}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
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
      <Head title={`Edit Item: ${item.string}`} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Item</h1>
            <p className="text-muted-foreground">Update item information and settings</p>
          </div>
          <Link href={route('sample.items.index')}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="string">
                      String <span className="text-destructive">*</span>
                    </Label>
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
                      value={data.email}
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
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        placeholder="Select a color"
                        className={errors.color ? 'border-destructive' : ''}
                        readOnly
                      />
                      <div
                        className="h-10 w-10 cursor-pointer rounded border"
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
                    <Label htmlFor="integer">Integer (1-100)</Label>
                    <input
                      type="range"
                      id="integer"
                      min="1"
                      max="100"
                      value={data.integer || '1'}
                      onChange={(e) => setData('integer', e.target.value)}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                    />
                    <div className="text-center text-sm text-muted-foreground">{data.integer || '1'}</div>
                    {errors.integer && <p className="text-sm text-destructive">{errors.integer}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decimal">Decimal</Label>
                    <Input
                      id="decimal"
                      type="number"
                      step="0.01"
                      value={data.decimal}
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
                    <Select
                      id="enumerate"
                      options={enumerateOptions}
                      value={enumerateOptions.find((option) => option.value === data.enumerate) || null}
                      onChange={(selected: SelectOption | null) => setData('enumerate', selected ? selected.value : '')}
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
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
                      defaultValue={item.user ? { value: item.user.id, label: item.user.name } : null}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                    />
                    {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={data.date}
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
                    value={data.time}
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
                    value={data.datetime}
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
                <CardTitle>Other Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ip_address">IP Address</Label>
                  <Input
                    id="ip_address"
                    type="text"
                    value={data.ip_address}
                    onChange={(e) => setData('ip_address', e.target.value)}
                    placeholder="192.168.1.1"
                    className={errors.ip_address ? 'border-destructive' : ''}
                  />
                  {errors.ip_address && <p className="text-sm text-destructive">{errors.ip_address}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="boolean"
                    checked={!!data.boolean}
                    onCheckedChange={(checked) => setData('boolean', !!checked)}
                  />
                  <Label htmlFor="boolean">Boolean</Label>
                  {errors.boolean && <p className="text-sm text-destructive">{errors.boolean}</p>}
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
                    zoom={data.latitude && data.longitude ? 13 : 2}
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
                <CardTitle>Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)</Label>
                  {item.file_url ? (
                    <div className="mb-2">
                      <a
                        href={item.file_url}
                        target="_blank"
                        className="flex items-center text-blue-600 hover:underline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-2 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        Current file: {(item.file ?? '').split('/').pop() || 'Download file'}
                      </a>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    id="file"
                    onChange={(e) => handleFileChange(e, 'file')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.docx,.pptx,.xlsx,.zip,.rar"
                  />
                  {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image (JPG, JPEG, PNG)</Label>
                  {item.image_url ? (
                    <div className="mb-2">
                      <img src={item.image_url} alt={item.string} className="h-24 w-auto rounded" />
                      <p className="mt-1 text-sm text-muted-foreground">Current image: {(item.image ?? '').split('/').pop()}</p>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    id="image"
                    onChange={(e) => handleFileChange(e, 'image')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    accept=".jpg,.jpeg,.png"
                  />
                  {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
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
                  <Label htmlFor="text">Text</Label>
                  <Textarea
                    id="text"
                    value={data.text}
                    onChange={(e) => setData('text', e.target.value)}
                    rows={3}
                    placeholder="Enter text content"
                    className={errors.text ? 'border-destructive' : ''}
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
                    initialValue={item.wysiwyg || ''}
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
                      setup: (editor) => {
                        editor.on('change', () => {
                          setWysiwygValue(editor.getContent());
                        });
                      },
                    }}
                    onEditorChange={setWysiwygValue}
                  />
                  {errors.wysiwyg && <p className="text-sm text-destructive">{errors.wysiwyg}</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-end space-x-2">
              <Link href={route('sample.items.index')}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={processing} onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                {processing ? 'Updating...' : 'Update Item'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
