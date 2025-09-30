import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Item } from '@/types';
import { normalizeMarkdown } from '@/utils/markdown';
import { Head, Link, useForm } from '@inertiajs/react';
import { Editor } from '@tinymce/tinymce-react';
import { Sketch } from '@uiw/react-color';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import ReactMarkdown from 'react-markdown';
import AsyncSelect from 'react-select/async';
import remarkGfm from 'remark-gfm';
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
  const [wysiwygValue, setWysiwygValue] = useState(item.wysiwyg || '');
  const [fileUploading, setFileUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState(false);

  const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
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
    file: item.file || '',
    image: item.image || '',
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
          Accept: 'application/json',
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

  const uploadFileToMinio = async (file: File, type: 'file' | 'image'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    // Add folder parameter to organize uploads by context
    formData.append('folder', type === 'file' ? 'items/files' : 'items/images');

    // Use the appropriate endpoint based on file type
    const endpoint = type === 'file' ? '/upload/file' : '/upload/image';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'file' | 'image') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (max 10MB for files, 5MB for images)
      const maxSize = field === 'file' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeMB = field === 'file' ? '10MB' : '5MB';
        setError(field, `File size must be less than ${maxSizeMB}`);
        return;
      }

      // Clear any previous errors
      clearErrors(field);

      // Set uploading state
      if (field === 'file') {
        setFileUploading(true);
      } else {
        setImageUploading(true);
      }

      try {
        // Upload file to MinIO
        const filePath = await uploadFileToMinio(file, field);

        if (filePath) {
          // Set the file path in form data
          setData(field, filePath);
          if (field === 'file') {
            setFileUploadSuccess(true);
          } else {
            setImageUploadSuccess(true);
          }
        } else {
          setError(field, 'Failed to upload file');
        }
      } catch (error) {
        setError(field, error instanceof Error ? error.message : 'Upload failed');
      } finally {
        // Clear uploading state
        if (field === 'file') {
          setFileUploading(false);
        } else {
          setImageUploading(false);
        }
      }
    }
  };

  useEffect(() => {
    setData('wysiwyg', wysiwygValue);
  }, [wysiwygValue]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Item: ${item.string}`} />

      {/*set page width*/}
      <div className="mx-auto flex h-full flex-1 flex-col gap-4 p-4 lg:w-7xl">
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
                        onClick={() => setShowColorPicker(!showColorPicker)}
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
                    <Label htmlFor="integer">Integer</Label>
                    <Input
                      type="number"
                      id="integer"
                      min="0"
                      max="100"
                      value={data.integer || '1'}
                      onChange={(e) => setData('integer', e.target.value)}
                      className="w-full"
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        id="integer-slider"
                        min="0"
                        max="100"
                        value={data.integer || '1'}
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
                    <div className="flex flex-wrap gap-2">
                      {enumerateOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setData('enumerate', option.value)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
                          className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200"
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
                      defaultValue={item.user ? { value: item.user.id, label: item.user.name } : null}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isClearable
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary: '#2563eb',
                          primary75: '#3b82f6',
                          primary50: '#60a5fa',
                          primary25: '#93c5fd',
                          danger: '#ef4444',
                          dangerLight: '#fca5a5',
                          neutral0: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                          neutral5: document.documentElement.classList.contains('dark') ? '#374151' : '#f9fafb',
                          neutral10: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                          neutral20: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                          neutral30: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                          neutral40: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#9ca3af',
                          neutral50: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                          neutral60: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563',
                          neutral70: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                          neutral80: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
                          neutral90: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
                        },
                      })}
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                          borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db',
                        }),
                        menu: (baseStyles) => ({
                          ...baseStyles,
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                          zIndex: 9999,
                        }),
                        option: (baseStyles, state) => ({
                          ...baseStyles,
                          backgroundColor: document.documentElement.classList.contains('dark')
                            ? state.isFocused
                              ? '#374151'
                              : state.isSelected
                                ? '#4b5563'
                                : '#1f2937'
                            : state.isFocused
                              ? '#f3f4f6'
                              : state.isSelected
                                ? '#e5e7eb'
                                : 'white',
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
                        }),
                        singleValue: (baseStyles) => ({
                          ...baseStyles,
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
                        }),
                        input: (baseStyles) => ({
                          ...baseStyles,
                          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
                        }),
                      }}
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
                  <div className="relative">
                    <DatePicker
                      date={data.date ? new Date(data.date) : undefined}
                      onDateChange={(date) => setData('date', date ? date.toISOString().split('T')[0] : '')}
                      placeholder="Select a date"
                      className={errors.date ? 'border-destructive' : ''}
                    />
                    {data.date && data.date.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => setData('date', '')}
                        className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                        title="Clear date"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <div className="relative">
                    <TimePicker
                      id="time"
                      value={data.time}
                      onChange={(value) => setData('time', value)}
                      className={errors.time ? 'border-destructive' : ''}
                      placeholder="Select time"
                    />
                    {data.time && data.time.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => setData('time', '')}
                        className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                        title="Clear time"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datetime">Datetime</Label>
                  <div className="relative">
                    <DatePicker
                      date={data.datetime ? new Date(data.datetime) : undefined}
                      onDateChange={(date) => setData('datetime', date ? date.toISOString().slice(0, 16) : '')}
                      placeholder="Select date and time"
                      className={errors.datetime ? 'border-destructive' : ''}
                      showTime={true}
                    />
                    {data.datetime && data.datetime.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => setData('datetime', '')}
                        className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                        title="Clear datetime"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove any non-digit and non-dot characters
                      const cleaned = value.replace(/[^\d.]/g, '');

                      // Split by dots and process each part
                      const parts = cleaned.split('.');
                      const processedParts = parts.map((part) => {
                        // Limit each part to 3 digits
                        if (part.length > 3) {
                          part = part.slice(0, 3);
                        }
                        // Ensure each part doesn't exceed 255
                        const num = parseInt(part, 10);
                        if (!isNaN(num) && num > 255) {
                          part = '255';
                        }
                        return part;
                      });

                      // Limit to 4 parts maximum
                      if (processedParts.length > 4) {
                        processedParts.splice(4);
                      }

                      // Auto-add dots after complete octets
                      let formatted = processedParts[0] || '';
                      for (let i = 1; i < processedParts.length; i++) {
                        formatted += '.' + processedParts[i];
                      }

                      // Auto-add dot when typing the 4th digit of an octet (except the last one)
                      if (processedParts.length < 4) {
                        const lastPart = processedParts[processedParts.length - 1];
                        if (lastPart && lastPart.length === 3 && /^\d{3}$/.test(lastPart)) {
                          const num = parseInt(lastPart, 10);
                          if (num <= 255 && value.length > formatted.length) {
                            formatted += '.';
                          }
                        }
                      }

                      setData('ip_address', formatted);
                    }}
                    placeholder="192.168.1.1"
                    maxLength={15}
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

                <div className="mt-2 h-96">
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
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mr-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Current file: {(item.file ?? '').split('/').pop() || 'Download file'}
                      </a>
                    </div>
                  ) : null}
                  <FileDropzone
                    accept=".pdf,.docx,.pptx,.xlsx,.zip,.rar"
                    maxSize={10 * 1024 * 1024} // 10MB
                    onFileDrop={(file) => {
                      // Create a properly typed synthetic event object
                      const syntheticEvent = {
                        target: {
                          files: [file],
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;

                      handleFileChange(syntheticEvent, 'file');
                    }}
                    disabled={fileUploading}
                    isUploading={fileUploading}
                    isSuccess={fileUploadSuccess}
                    currentFileName={data.file ? data.file.split('/').pop() : undefined}
                    error={errors.file}
                  />
                  <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image (JPG, JPEG, PNG)</Label>
                  {item.image_url ? (
                    <div className="mb-2">
                      <img src={item.image_url} alt={item.string} className="h-24 w-auto rounded" />
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current image: {(item.image ?? '').split('/').pop()}
                      </p>
                    </div>
                  ) : null}
                  <FileDropzone
                    accept=".jpg,.jpeg,.png"
                    maxSize={5 * 1024 * 1024} // 5MB
                    onFileDrop={(file) => {
                      // Create a properly typed synthetic event object
                      const syntheticEvent = {
                        target: {
                          files: [file],
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;

                      handleFileChange(syntheticEvent, 'image');
                    }}
                    disabled={imageUploading}
                    isUploading={imageUploading}
                    isSuccess={imageUploadSuccess}
                    currentFileName={data.image ? data.image.split('/').pop() : undefined}
                    error={errors.image}
                  />
                  <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Editor</Label>
                      <textarea
                        id="markdown_text"
                        value={data.markdown_text || ''}
                        onChange={(e) => setData('markdown_text', e.target.value)}
                        rows={12}
                        placeholder="Enter markdown text...\n\nExamples:\n# Heading 1\n## Heading 2\n**Bold text**\n*Italic text*\n~~Strikethrough~~\n\n- List item 1\n- List item 2\n\n> Blockquote\n\n`inline code`\n\n```\ncode block\n```"
                        className={`flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.markdown_text ? 'border-destructive' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Preview</Label>
                      <div className="prose prose-sm dark:prose-invert min-h-[300px] max-w-none overflow-auto rounded-md border border-input bg-background p-3">
                        {data.markdown_text ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ ...props }) => <h1 className="mt-6 mb-2 text-2xl font-bold" {...props} />,
                              h2: ({ ...props }) => <h2 className="mt-5 mb-2 text-xl font-bold" {...props} />,
                              h3: ({ ...props }) => <h3 className="mt-4 mb-2 text-lg font-bold" {...props} />,
                              h4: ({ ...props }) => <h4 className="mt-3 mb-1 text-base font-bold" {...props} />,
                              h5: ({ ...props }) => <h5 className="mt-3 mb-1 text-sm font-bold" {...props} />,
                              h6: ({ ...props }) => <h6 className="mt-3 mb-1 text-xs font-bold" {...props} />,
                              code({
                                inline,
                                children,
                                ...props
                              }: React.ClassAttributes<HTMLElement> &
                                React.HTMLAttributes<HTMLElement> & {
                                  inline?: boolean;
                                  className?: string;
                                  children?: React.ReactNode;
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
                              p: ({ ...props }) => <p className="my-2" {...props} />,
                              a: ({ ...props }) => (
                                <a className="text-primary underline hover:text-primary/80" {...props} />
                              ),
                              ul: ({ ...props }) => <ul className="my-4 list-disc pl-6" {...props} />,
                              ol: ({ ...props }) => <ol className="my-4 list-decimal pl-6" {...props} />,
                              li: ({ ...props }) => <li className="my-1" {...props} />,
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="my-4 border-l-4 border-muted-foreground pl-4 text-muted-foreground italic"
                                  {...props}
                                />
                              ),
                              hr: ({ ...props }) => <hr className="my-6 border-muted" {...props} />,
                              img: ({ ...props }) => (
                                <img className="my-4 h-auto max-w-full rounded-md" {...props} alt={props.alt || ''} />
                              ),
                              table: ({ ...props }) => (
                                <div className="my-4 overflow-x-auto">
                                  <table className="w-full border-collapse" {...props} />
                                </div>
                              ),
                              thead: ({ ...props }) => <thead className="bg-muted/50" {...props} />,
                              tbody: ({ ...props }) => <tbody {...props} />,
                              tr: ({ ...props }) => <tr className="border-b border-border" {...props} />,
                              th: ({ ...props }) => <th className="px-4 py-2 text-left font-medium" {...props} />,
                              td: ({ ...props }) => <td className="px-4 py-2" {...props} />,
                            }}
                          >
                            {normalizeMarkdown(data.markdown_text)}
                          </ReactMarkdown>
                        ) : (
                          <div className="text-sm text-muted-foreground">Preview will appear here...</div>
                        )}
                      </div>
                    </div>
                  </div>
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
