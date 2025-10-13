import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SubItem } from '@/types';
import { FormEvent, useEffect, useState } from 'react';
import sample from '@/routes/sample';

interface SubItemEditModalProps {
  itemId: string;
  subItemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormData {
  string: string;
  email: string;
  integer: string;
}

export function SubItemEditModal({
  itemId,
  subItemId,
  open,
  onOpenChange,
  onSuccess,
}: SubItemEditModalProps) {
  const [subItem, setSubItem] = useState<SubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FormData>({
    string: '',
    email: '',
    integer: '',
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (open && subItemId) {
      fetchSubItem();
    } else if (!open) {
      // Reset form when modal closes
      setData({
        string: '',
        email: '',
        integer: '',
      });
      setSubItem(null);
      setErrors({});
    }
  }, [open, subItemId]);


  const fetchSubItem = async () => {
    setLoading(true);
    try {
      const url = sample.items.subItems.show.url({ item: itemId, subItem: subItemId });
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        const result = await response.json();
        const item = result.data;
        setSubItem(item);
        setData({
          string: item.string || '',
          email: item.email || '',
          integer: item.integer?.toString() || '',
        });
      } else {
        console.error('Failed to fetch sub-item:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch sub-item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!subItem) return;

    setProcessing(true);
    setErrors({});

    fetch(sample.items.subItems.update.url({ item: itemId, subItem: subItemId }), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        string: data.string,
        email: data.email || null,
        integer: data.integer ? parseInt(data.integer) : null,
      }),
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
        
        // Handle validation errors
        if (error.errors) {
          setErrors(error.errors);
        } else {
          alert('Failed to update sub-item. Please try again.');
        }
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[9999]" />
        <DialogContent className="z-[10000] max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {loading ? <Skeleton className="h-6 w-48" /> : `Edit Sub Item: ${subItem?.string}`}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="string">
                String <span className="text-destructive">*</span>
              </Label>
              <Input
                id="string"
                value={data.string}
                onChange={(e) => setData({ ...data, string: e.target.value })}
                placeholder="Enter string"
                required
              />
              {errors.string && (
                <p className="text-sm text-destructive">{errors.string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="integer">Integer</Label>
              <Input
                id="integer"
                type="number"
                value={data.integer}
                onChange={(e) => setData({ ...data, integer: e.target.value })}
                placeholder="Enter integer"
              />
              {errors.integer && (
                <p className="text-sm text-destructive">{errors.integer}</p>
              )}
            </div>

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
                {processing ? 'Updating...' : 'Update Sub Item'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
