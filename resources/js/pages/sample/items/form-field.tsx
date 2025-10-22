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
  latitude: number | null;
  longitude: number | null;
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

        <TabsContent value="basic" className="mt-6">
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

              <InputSelectUser
                id="user_id"
                label="User"
                onChange={(value) => setData('user_id', value)}
                defaultValue={userDefaultValue}
                error={errors.user_id}
                // allowCreate={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datetime" className="mt-6">
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

              <InputDatetime
                id="datetime"
                label="Datetime"
                value={data.datetime}
                onChange={(value) => setData('datetime', value)}
                placeholder="Select date and time"
                error={errors.datetime}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="mt-6">
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
        </TabsContent>

        <TabsContent value="location" className="mt-6">
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
                ratio={4 / 3}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-6">
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
        </TabsContent>

        <TabsContent value="content" className="mt-6">
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
        </TabsContent>
      </Tabs>
    </>
  );
}
