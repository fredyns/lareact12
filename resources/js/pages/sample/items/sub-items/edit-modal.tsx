import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import sample from '@/routes/sample';
import { SelectOption, SubItem } from '@/types';
import { getSubItemUploadPath, getTempUploadPath } from '@/utils/upload';
import { Activity, FormEvent, useEffect, useState } from 'react';
import { FormField } from './form-field';

interface SubItemEditModalProps {
  itemId: string;
  subItemId: string;
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

export function SubItemEditModal({
  itemId,
  subItemId,
  enumerateOptions,
  open,
  onOpenChange,
  onSuccess,
}: SubItemEditModalProps) {
  const [subItem, setSubItem] = useState<SubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FormData>({
    item_id: itemId,
    string: '',
    email: '',
    color: '',
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

  // Fetch sub-item data when modal opens
  useEffect(() => {
    if (open && subItemId) {
      setLoading(true);
      fetch(sample.items.subItems.show.url([itemId, subItemId]), {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      })
        .then((response) => response.json())
        .then((result) => {
          setSubItem(result.data);
          // Populate form with existing data
          setData({
            item_id: itemId,
            string: result.data.string || '',
            email: result.data.email || '',
            color: result.data.color || '#000000',
            integer: result.data.integer?.toString() || '',
            decimal: result.data.decimal?.toString() || '',
            npwp: result.data.npwp || '',
            datetime: result.data.datetime || '',
            date: result.data.date || '',
            time: result.data.time || '',
            ip_address: result.data.ip_address || '',
            boolean: result.data.boolean || false,
            enumerate: result.data.enumerate || '',
            text: result.data.text || '',
            file: result.data.file || '',
            image: result.data.image || '',
            markdown_text: result.data.markdown_text || '',
            wysiwyg: result.data.wysiwyg || '',
            latitude: result.data.latitude || null,
            longitude: result.data.longitude || null,
            user_id: result.data.user_id || '',
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch sub-item:', error);
          setLoading(false);
        });
    }
  }, [open, itemId, subItemId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    fetch(sample.items.subItems.update.url([itemId, subItemId]), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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

        setProcessing(false);
      })
      .catch((error) => {
        setProcessing(false);

        // Log the full error for debugging
        console.error('Update sub-item error:', error);

        // Handle validation errors
        if (error.errors) {
          setErrors(error.errors);
        } else {
          // Show more detailed error message
          const errorMessage = error.message || 'Failed to update sub-item. Please try again.';
          alert(`Error: ${errorMessage}\n\nCheck the browser console for more details.`);
        }
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[4999]" />
        <DialogContent
          className="z-[5000] flex max-h-[90vh] w-[95vw] !max-w-none flex-col overflow-hidden lg:w-[85vw] xl:w-[80vw] 2xl:w-[1400px]"
          aria-describedby={undefined}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {loading ? <Skeleton className="h-6 w-48" /> : `Edit Sub Item: ${subItem?.string}`}
            </DialogTitle>
          </DialogHeader>

          <Activity mode={loading ? 'visible' : 'hidden'}>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </Activity>
          <Activity mode={!loading ? 'visible' : 'hidden'}>
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-2">
                <FormField
                  data={data}
                  setData={(key, value) => setData((prev) => ({ ...prev, [key]: value }))}
                  errors={errors}
                  enumerateOptions={enumerateOptions}
                  subItem={subItem || undefined}
                  uploadPath={subItem ? getSubItemUploadPath(subItem) : getTempUploadPath()}
                />
              </div>

              <div className="flex flex-shrink-0 justify-end gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Sub Item'}
                </Button>
              </div>
            </form>
          </Activity>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
