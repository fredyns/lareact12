import { InputCheckbox } from '@/components/shorty/InputCheckbox';
import { InputColor } from '@/components/shorty/InputColor';
import { InputDate } from '@/components/shorty/InputDate';
import { InputDateTime } from '@/components/shorty/InputDateTime';
import { InputEmail } from '@/components/shorty/InputEmail';
import { InputEnum } from '@/components/shorty/InputEnum';
import { InputFile } from '@/components/shorty/InputFile';
import { InputImage } from '@/components/shorty/InputImage';
import { InputIpAddress } from '@/components/shorty/InputIpAddress';
import { InputMap } from '@/components/shorty/InputMap';
import { InputMarkdown } from '@/components/shorty/InputMarkdown';
import { InputNpwp } from '@/components/shorty/InputNpwp';
import { InputNumber } from '@/components/shorty/InputNumber';
import { InputSelectFromTable } from '@/components/shorty/InputSelectFromTable';
import { InputString } from '@/components/shorty/InputString';
import { InputTextarea } from '@/components/shorty/InputTextarea';
import { InputTime } from '@/components/shorty/InputTime';
import { InputWysiwyg } from '@/components/shorty/InputWysiwyg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Item } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { route } from 'ziggy-js';

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
    title: 'Edit Item',
    href: '#',
  },
];

export default function Edit({ item, enumerateOptions }: Props) {
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
                  <InputString
                    id="string"
                    label="String"
                    value={data.string}
                    onChange={(value) => setData('string', value)}
                    placeholder="Enter string value"
                    error={errors.string}
                    required
                  />

                  <InputEmail
                    id="email"
                    label="Email"
                    value={data.email}
                    onChange={(value) => setData('email', value)}
                    error={errors.email}
                    placeholder="Enter email address"
                  />

                  <InputColor
                    id="color"
                    label="Color"
                    value={data.color}
                    onChange={(value) => setData('color', value)}
                    placeholder="Select a color"
                    error={errors.color}
                  />

                  <InputNumber
                    id="integer"
                    label="Integer"
                    value={data.integer}
                    onChange={(value) => setData('integer', value)}
                    min={0}
                    max={100}
                    error={errors.integer}
                  />

                  <InputNumber
                    id="decimal"
                    label="Decimal"
                    value={data.decimal}
                    onChange={(value) => setData('decimal', value)}
                    step="0.01"
                    slider={false}
                    error={errors.decimal}
                  />

                  <InputNpwp
                    id="npwp"
                    label="NPWP"
                    value={data.npwp}
                    onChange={(value) => setData('npwp', value)}
                    error={errors.npwp}
                  />

                  <InputEnum
                    id="enumerate"
                    label="Status"
                    value={data.enumerate}
                    onChange={(value) => setData('enumerate', value)}
                    options={enumerateOptions}
                    error={errors.enumerate}
                  />

                  <InputSelectFromTable
                    id="user_id"
                    label="User"
                    onChange={(value) => setData('user_id', value)}
                    apiEndpoint="/select-options/users"
                    defaultValue={item.user ? { value: item.user.id, label: item.user.name } : null}
                    error={errors.user_id}
                  />
                </form>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputDate
                  id="date"
                  label="Date"
                  value={data.date}
                  onChange={(value) => setData('date', value)}
                  placeholder="Select a date"
                  error={errors.date}
                />

                <InputTime
                  id="time"
                  label="Time"
                  value={data.time}
                  onChange={(value) => setData('time', value)}
                  placeholder="Select time"
                  error={errors.time}
                />

                <InputDateTime
                  id="datetime"
                  label="Datetime"
                  value={data.datetime}
                  onChange={(value) => setData('datetime', value)}
                  placeholder="Select date and time"
                  error={errors.datetime}
                />
              </CardContent>
            </Card>

            {/* Other Information */}
            <Card>
              <CardHeader>
                <CardTitle>Other Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputIpAddress
                  id="ip_address"
                  label="IP Address"
                  value={data.ip_address}
                  onChange={(value) => setData('ip_address', value)}
                  placeholder="192.168.1.1"
                  error={errors.ip_address}
                />

                <InputCheckbox
                  id="boolean"
                  label="Boolean"
                  checked={!!data.boolean}
                  onChange={(checked) => setData('boolean', checked)}
                  error={errors.boolean}
                />
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
                <InputMap
                  latitude={data.latitude}
                  longitude={data.longitude}
                  onLatitudeChange={(value) => setData('latitude', value)}
                  onLongitudeChange={(value) => setData('longitude', value)}
                  latitudeError={errors.latitude}
                  longitudeError={errors.longitude}
                  mapHeight="h-96"
                />
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputFile
                  id="file"
                  label="File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)"
                  currentFileUrl={item.file_url}
                  currentFileName={(item.file ?? '').split('/').pop() || 'Download file'}
                  onFileChange={(filePath) => setData('file', filePath)}
                  uploadPath={item.upload_path ?? undefined}
                  accept="pdf, docx, pptx, xlsx, zip, rar"
                  maxSize={10 * 1024 * 1024} // 10MB
                />

                <InputImage
                  id="image"
                  label="Image (JPG, JPEG, PNG)"
                  currentImageUrl={item.image_url}
                  currentImageName={(item.image ?? '').split('/').pop()}
                  currentImageAlt={item.string}
                  onImageChange={(imagePath) => setData('image', imagePath)}
                  uploadPath={item.upload_path ?? undefined}
                  accept="jpg, jpeg, png"
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </CardContent>
            </Card>

            {/* Text Content */}
            <Card>
              <CardHeader>
                <CardTitle>Text Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputTextarea
                  id="text"
                  label="Text"
                  value={data.text}
                  onChange={(value) => setData('text', value)}
                  rows={3}
                  placeholder="Enter text content"
                  error={errors.text}
                />

                <InputMarkdown
                  id="markdown_text"
                  label="Markdown Text"
                  value={data.markdown_text}
                  onChange={(value) => setData('markdown_text', value)}
                  rows={12}
                  error={errors.markdown_text}
                />

                <InputWysiwyg
                  id="wysiwyg"
                  label="WYSIWYG Content"
                  value={data.wysiwyg}
                  onChange={(value) => setData('wysiwyg', value)}
                  initialValue={item.wysiwyg || ''}
                  height={300}
                  error={errors.wysiwyg}
                />
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
