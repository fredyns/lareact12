import { InputSelectUser } from '@/components/select-from-table/input-select-user';
import { InputAddress } from '@/components/shorty/input-address';
import { InputCheckbox } from '@/components/shorty/input-checkbox';
import { InputColor } from '@/components/shorty/input-color';
import { InputDate } from '@/components/shorty/input-date';
import { InputDatetime } from '@/components/shorty/input-datetime';
import { InputEmail } from '@/components/shorty/input-email';
import { InputEnum } from '@/components/shorty/input-enum';
import { InputFile } from '@/components/shorty/input-file';
import { InputImage } from '@/components/shorty/input-image';
import { InputMap } from '@/components/shorty/input-map';
import { InputMarkdown } from '@/components/shorty/input-markdown';
import { InputNpwp } from '@/components/shorty/input-npwp';
import { InputNumber } from '@/components/shorty/input-number';
import { InputString } from '@/components/shorty/input-string';
import { InputTextarea } from '@/components/shorty/input-textarea';
import { InputTime } from '@/components/shorty/input-time';
import { InputWysiwyg } from '@/components/shorty/input-wysiwyg';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SelectOption, SubItem } from '@/types';
import { useEffect, useRef, useState } from 'react';

interface FormData {
  string: string;
  email: string;
  color: string;
  integer: string;
  decimal: string;
  npwp: string;
  datetime: string;
  date: string;
  time: string;
  ip_address: string;
  boolean: boolean;
  enumerate: string;
  text: string;
  file: string;
  image: string;
  markdown_text: string;
  wysiwyg: string;
  latitude: number | null;
  longitude: number | null;
  user_id: string;
  item_id: string;
}

interface FormErrors {
  string?: string;
  email?: string;
  color?: string;
  integer?: string;
  decimal?: string;
  npwp?: string;
  datetime?: string;
  date?: string;
  time?: string;
  ip_address?: string;
  boolean?: string;
  enumerate?: string;
  text?: string;
  file?: string;
  image?: string;
  markdown_text?: string;
  wysiwyg?: string;
  latitude?: string;
  longitude?: string;
  user_id?: string;
  item_id?: string;
}

interface FormFieldProps {
  data: FormData;
  setData: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  errors: FormErrors;
  enumerateOptions: SelectOption[];
  // Optional: Pass subItem for edit mode to auto-populate optional props
  subItem?: SubItem;
  // Optional: Pass uploadPath directly for create mode
  uploadPath: string;
  // Loading state for shimmer effect
  loading?: boolean;
}

export function FormField({
  data,
  setData,
  errors,
  enumerateOptions,
  subItem,
  uploadPath: uploadPathProp,
  loading = false,
}: FormFieldProps) {
  // Tab height management
  const [minTabHeight, setMinTabHeight] = useState<number>(0);
  const tabRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Extract optional props from subItem if provided (edit mode)
  const currentFileUrl = subItem?.file_url ?? undefined;
  const currentFileName = (subItem?.file ?? '').split('/').pop() || 'Download file';
  const currentImageUrl = subItem?.image_url ?? undefined;
  const currentImageName = (subItem?.image ?? '').split('/').pop();
  const currentImageAlt = subItem?.string;
  // Use uploadPath from prop (create mode) or from subItem (edit mode)
  const uploadPath = uploadPathProp;
  const userDefaultValue = subItem?.user ? { value: subItem.user.id, label: subItem.user.name } : null;
  const wysiwygInitialValue = subItem?.wysiwyg || '';

  // Calculate max height across all tabs after component mounts
  useEffect(() => {
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
  }, [data, subItem]);
  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {/* Main Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Main Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 md:w-1/3">
                <InputString
                  id="string"
                  label="String"
                  value={data.string}
                  onChange={(value) => setData('string', value)}
                  placeholder="Enter string value"
                  error={errors.string}
                  required
                  loading={false}
                />
              </div>

              <div className="flex-1 md:w-1/3">
                <InputEmail
                  id="email"
                  label="Email"
                  value={data.email}
                  onChange={(value) => setData('email', value)}
                  error={errors.email}
                  placeholder="Enter email address"
                  loading={false}
                />
              </div>

              <div className="flex-1 md:w-1/3">
                <InputEnum
                  id="enumerate"
                  label="Status"
                  value={data.enumerate}
                  onChange={(value) => setData('enumerate', value)}
                  options={enumerateOptions}
                  error={errors.enumerate}
                  loading={false}
                />
              </div>
            </div>

            <div className="w-full">
              <InputTextarea
                id="text"
                label="Text"
                value={data.text}
                onChange={(value) => setData('text', value)}
                rows={3}
                placeholder="Enter text content"
                error={errors.text}
                loading={loading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
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
            <CardContent>
              <InputColor
                id="color"
                label="Color"
                value={data.color}
                onChange={(value) => setData('color', value)}
                placeholder="Select a color"
                error={errors.color}
                loading={loading}
              />

              <InputNumber
                id="integer"
                label="Integer"
                value={data.integer}
                onChange={(value) => setData('integer', value)}
                min={0}
                max={100}
                error={errors.integer}
                loading={false}
              />

              <InputNumber
                id="decimal"
                label="Decimal"
                value={data.decimal}
                onChange={(value) => setData('decimal', value)}
                step="0.01"
                slider={false}
                error={errors.decimal}
                loading={loading}
              />

              <InputNpwp
                id="npwp"
                label="NPWP"
                value={data.npwp}
                onChange={(value) => setData('npwp', value)}
                error={errors.npwp}
                loading={loading}
              />

              <InputSelectUser
                id="user_id"
                label="User"
                onChange={(value) => setData('user_id', value)}
                defaultValue={userDefaultValue}
                error={errors.user_id}
                loading={loading}
                // allowCreate={false}
              />
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
              <InputDate
                id="date"
                label="Date"
                value={data.date}
                onChange={(value) => setData('date', value)}
                placeholder="Select a date"
                error={errors.date}
                loading={loading}
              />

              <InputTime
                id="time"
                label="Time"
                value={data.time}
                onChange={(value) => setData('time', value)}
                placeholder="Select time"
                error={errors.time}
                loading={loading}
              />

              <InputDatetime
                id="datetime"
                label="Datetime"
                value={data.datetime}
                onChange={(value) => setData('datetime', value)}
                placeholder="Select date and time"
                error={errors.datetime}
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
              <InputAddress
                id="ip_address"
                label="IP Address"
                value={data.ip_address}
                onChange={(value) => setData('ip_address', value)}
                placeholder="192.168.1.1"
                error={errors.ip_address}
                loading={loading}
              />

              <InputCheckbox
                id="boolean"
                label="Boolean"
                checked={!!data.boolean}
                onChange={(checked) => setData('boolean', checked)}
                error={errors.boolean}
                loading={loading}
              />
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
                <InputMap
                  latitude={data.latitude}
                  longitude={data.longitude}
                  onLatitudeChange={(value) => setData('latitude', value)}
                  onLongitudeChange={(value) => setData('longitude', value)}
                  latitudeError={errors.latitude}
                  longitudeError={errors.longitude}
                  ratio={4 / 3}
                  loading={loading}
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
              <InputFile
                id="file"
                label="File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)"
                currentFileUrl={currentFileUrl}
                currentFileName={currentFileName}
                onFileChange={(filePath) => setData('file', filePath)}
                uploadPath={uploadPath}
                accept=".pdf,.docx,.pptx,.xlsx,.zip,.rar"
                maxSize={10 * 1024 * 1024} // 10MB
                loading={loading}
              />

              <InputImage
                id="image"
                label="Image (JPG, JPEG, PNG)"
                currentImageUrl={currentImageUrl}
                currentImageName={currentImageName}
                currentImageAlt={currentImageAlt}
                onImageChange={(imagePath) => setData('image', imagePath)}
                uploadPath={uploadPath}
                accept=".jpg,.jpeg,.png,.heic"
                maxSize={5 * 1024 * 1024} // 5MB
                loading={loading}
              />
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
              <InputMarkdown
                id="markdown_text"
                label="Markdown Text"
                value={data.markdown_text}
                onChange={(value) => setData('markdown_text', value)}
                rows={12}
                error={errors.markdown_text}
                loading={loading}
              />

              <InputWysiwyg
                id="wysiwyg"
                label="WYSIWYG Content"
                value={data.wysiwyg}
                onChange={(value) => setData('wysiwyg', value)}
                initialValue={wysiwygInitialValue}
                height={300}
                error={errors.wysiwyg}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
