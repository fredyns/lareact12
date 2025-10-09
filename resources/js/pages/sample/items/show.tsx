import { ShowBadge } from '@/components/shorty/show-badge';
import { ShowColor } from '@/components/shorty/show-color';
import { ShowDatetime } from '@/components/shorty/show-datetime';
import { ShowField } from '@/components/shorty/show-field';
import { ShowFile } from '@/components/shorty/show-file';
import { ShowImage } from '@/components/shorty/show-image';
import { ShowMap } from '@/components/shorty/show-map';
import { ShowMarkdown } from '@/components/shorty/show-markdown';
import { ShowText } from '@/components/shorty/show-text';
import { ShowWysiwyg } from '@/components/shorty/show-wysiwyg';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Item } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Check, Edit, Trash2, X } from 'lucide-react';
import { dashboard } from '@/routes';
import sample from '@/routes/sample';

interface Props {
  item: Item;
  enumerateOptions: { value: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard.url(),
  },
  {
    title: 'Sample Items',
    href: sample.items.index.url(),
  },
  {
    title: 'Item Details',
    href: '#',
  },
];

export default function Show({ item, enumerateOptions }: Props) {
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      router.delete(sample.items.destroy.url(item.id));
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

      {/*set page width*/}
      <div className="mx-auto flex h-full flex-1 flex-col gap-4 p-4 lg:w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.string}</h1>
            <p className="text-muted-foreground">Item details and information</p>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={sample.items.index.url()}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Items
              </Button>
            </Link>
            <Link href={sample.items.edit.url(item.id)}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Item
              </Button>
            </Link>
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
                <ShowField label="String" value={item.string} />

                <ShowField label="Email" value={item.email} />

                <ShowColor color={item.color} />

                <ShowField label="Integer" value={item.integer} />

                <ShowField label="Decimal" value={item.decimal} />

                <ShowField label="NPWP" value={item.npwp} />

                <ShowBadge
                  label="Status"
                  value={getEnumerateLabel(item.enumerate)}
                  variant={item.enumerate === 'enable' ? 'default' : 'secondary'}
                  icon={item.enumerate === 'enable' ? Check : X}
                />

                <ShowField label="User" value={item.user?.name} />
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ShowDatetime label="Date" value={item.date} format="ddd, MMM dd, yyyy" />

                <ShowDatetime label="Time" value={item.time} format="HH:mm" />

                <ShowDatetime label="Datetime" value={item.datetime} format="ddd, MMM dd, yyyy HH:mm" />
              </CardContent>
            </Card>

            {/* Other Information */}
            <Card>
              <CardHeader>
                <CardTitle>Other Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ShowField label="IP Address" value={item.ip_address} />

                <ShowField label="Boolean" value={item.boolean ? 'True' : 'False'} />
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ShowMap latitude={item.latitude} longitude={item.longitude} popupText={item.string} />
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
                <ShowFile label="File (PDF, DOCX, PPTX, XLSX, ZIP, RAR)" url={item.file_url} path={item.file} />

                <ShowImage label="Image (JPG, JPEG, PNG)" url={item.image_url} alt={item.string} />
              </CardContent>
            </Card>

            {/* Text Content */}
            <Card>
              <CardHeader>
                <CardTitle>Text Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ShowText label="Text" value={item.text} />

                <ShowMarkdown label="Markdown Content" value={item.markdown_text} />

                <ShowWysiwyg label="WYSIWYG Content" value={item.wysiwyg} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
