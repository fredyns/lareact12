import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, Item } from '@/types';
import { getItemUploadPath } from '@/utils/upload';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { dashboard } from '@/routes';
import sample from '@/routes/sample';
import { FormField } from './form-field';

interface Props {
  item: Item;
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
    title: 'Edit Item',
    href: '#',
  },
];

export default function Edit({ item }: Props) {
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
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    user_id: item.user_id || '',
    _method: 'PUT',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(sample.items.update.url(item.id));
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
          <Link href={sample.items.index.url()}>
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
            item={item}
            uploadPath={getItemUploadPath(item)}
          />

          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-end space-x-2">
                <Link href={sample.items.index.url()}>
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
