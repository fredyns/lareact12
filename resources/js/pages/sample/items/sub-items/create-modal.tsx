import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { SelectOption } from '@/types';
import { Activity, FormEvent, useState } from 'react';
import sample from '@/routes/sample';
import { FormField } from './form-field';

interface SubItemCreateModalProps {
  itemId: string;
  enumerateOptions: SelectOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  item_id: string;
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

export function SubItemCreateModal({
  itemId,
  enumerateOptions,
  open,
  onOpenChange,
  onSuccess,
}: SubItemCreateModalProps) {
  const [data, setData] = useState<FormData>({
    item_id: itemId,
    string: '',
    email: '',
    color: '#000000',
    integer: '',
    decimal: '',
    npwp: '',
    datetime: '',
    date: '',
    time: '',
    ip_address: '',
    boolean: false,
    enumerate: '',
    text: '',
    file: '',
    image: '',
    markdown_text: '',
    wysiwyg: '',
    latitude: null,
    longitude: null,
    user_id: '',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    fetch(sample.items.subItems.store.url(itemId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw errorData;
        }
        return response.json();
      })
      .then(() => {
        // Success - refresh table
        onSuccess();
        
        // Close modal
        onOpenChange(false);
        
        // Reset form
        setData({
          item_id: itemId,
          string: '',
          email: '',
          color: '#000000',
          integer: '',
          decimal: '',
          npwp: '',
          datetime: '',
          date: '',
          time: '',
          ip_address: '',
          boolean: false,
          enumerate: '',
          text: '',
          file: '',
          image: '',
          markdown_text: '',
          wysiwyg: '',
          latitude: null,
          longitude: null,
          user_id: '',
        });
        setProcessing(false);
      })
      .catch((error) => {
        setProcessing(false);
        
        // Handle validation errors
        if (error.errors) {
          setErrors(error.errors);
        } else {
          alert('Failed to create sub-item. Please try again.');
        }
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[4999]" />
        <DialogContent className="z-[5000] max-h-[90vh] w-[95vw] lg:w-[85vw] xl:w-[80vw] 2xl:w-[1400px] !max-w-none overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create Sub Item</DialogTitle>
        </DialogHeader>

        <Activity mode="visible">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              data={data}
              setData={(key, value) => setData({ ...data, [key]: value })}
              errors={errors}
              enumerateOptions={enumerateOptions}
              uploadPath={`tmp/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')}/sample_sub_items`}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Creating...' : 'Create Sub Item'}
              </Button>
            </div>
          </form>
        </Activity>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
