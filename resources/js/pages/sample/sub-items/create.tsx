import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SelectOption } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { dashboard } from '@/routes';
import sample from '@/routes/sample';
import { FormField } from './form-field';
import { getTempUploadPath } from '@/utils/upload';

interface Props {
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
    title: 'Create Sub Item',
    href: sample.subItems.create.url(),
  },
];

export default function Create({ enumerateOptions }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    item_id: '',
    string: '',
    email: '',
    color: '',
    integer: '',
    decimal: '',
    npwp: '',
    enumerate: '',
    datetime: '',
    date: '',
    time: '',
    ip_address: '',
    boolean: false,
    text: '',
    file: '',
    image: '',
    markdown_text: '',
    wysiwyg: '',
    latitude: null,
    longitude: null,
    user_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(sample.subItems.store.url());
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Sub-Item" />

      {/*set page width*/}
      <div className="mx-auto flex h-full flex-1 flex-col gap-4 p-4 lg:w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Item</h1>
            <p className="text-muted-foreground">Add a new sample sub item to the system</p>
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
            uploadPath={getTempUploadPath()}
          />

          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="flex items-center justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => reset()}>
                  Reset
                </Button>
                <Button type="submit" disabled={processing}>
                  <Save className="mr-2 h-4 w-4" />
                  {processing ? 'Creating...' : 'Create Item'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}
