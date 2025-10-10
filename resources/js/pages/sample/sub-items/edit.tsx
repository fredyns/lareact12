import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SubItem, SelectOption } from '@/types';
import { getItemUploadPath } from '@/utils/upload';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { dashboard } from '@/routes';
import sample from '@/routes/sample';
import { FormField } from './form-field';

interface Props {
  subItem: SubItem;
  enumerateOptions: SelectOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard.url(),
  },
  {
    title: 'Sample Sub Items',
    href: sample.subItems.index.url(),
  },
  {
    title: 'Edit Sub Item',
    href: '#',
  },
];

export default function Edit({ subItem, enumerateOptions }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    string: subItem.string,
    email: subItem.email || '',
    color: subItem.color || '',
    integer: subItem.integer?.toString() || '',
    decimal: subItem.decimal?.toString() || '',
    npwp: subItem.npwp || '',
    datetime: subItem.datetime ? new Date(subItem.datetime).toISOString().slice(0, 16) : '',
    date: subItem.date || '',
    time: subItem.time || '',
    ip_address: subItem.ip_address || '',
    boolean: subItem.boolean || false,
    enumerate: subItem.enumerate || '',
    text: subItem.text || '',
    file: subItem.file || '',
    image: subItem.image || '',
    markdown_text: subItem.markdown_text || '',
    wysiwyg: subItem.wysiwyg || '',
    latitude: subItem.latitude ?? null,
    longitude: subItem.longitude ?? null,
    user_id: subItem.user_id || '',
    item_id: subItem.item_id || '',
    _method: 'PUT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(sample.subItems.update.url(subItem.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Sub-Item: ${subItem.string}`} />

      {/*set page width*/}
      <div className="mx-auto flex h-full flex-1 flex-col gap-4 p-4 lg:w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Sub-Item</h1>
            <p className="text-muted-foreground">Update sub-item information and settings</p>
          </div>
          <Link href={sample.subItems.index.url()}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            data={data}
            setData={setData}
            errors={errors}
            enumerateOptions={enumerateOptions}
            subItem={subItem}
            uploadPath={getItemUploadPath(subItem)}
          />

          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-end space-x-2">
                <Link href={sample.subItems.index.url()}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  {processing ? 'Updating...' : 'Update Item'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
