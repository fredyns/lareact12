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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Item } from '@/types';

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
  latitude: number;
  longitude: number;
  user_id: string;
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
}

interface FormFieldProps {
  data: FormData;
  setData: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  errors: FormErrors;
  enumerateOptions: { value: string; label: string }[];
  // Optional: Pass item for edit mode to auto-populate optional props
  item?: Item;
  // Optional: Pass uploadPath directly for create mode
  uploadPath: string;
}

export function FormField({
  data,
  setData,
  errors,
  enumerateOptions,
  item,
  uploadPath: uploadPathProp,
}: FormFieldProps) {
  // Extract optional props from item if provided (edit mode)
  const currentFileUrl = item?.file_url ?? undefined;
  const currentFileName = (item?.file ?? '').split('/').pop() || 'Download file';
  const currentImageUrl = item?.image_url ?? undefined;
  const currentImageName = (item?.image ?? '').split('/').pop();
  const currentImageAlt = item?.string;
  // Use uploadPath from prop (create mode) or from item (edit mode)
  const uploadPath = uploadPathProp;
  const userDefaultValue = item?.user ? { value: item.user.id, label: item.user.name } : null;
  const wysiwygInitialValue = item?.wysiwyg || '';
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
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
                defaultValue={userDefaultValue}
                error={errors.user_id}
              />
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
        </div>

        <div className="space-y-6">
          {/* Files */}
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
                initialValue={wysiwygInitialValue}
                height={300}
                error={errors.wysiwyg}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
