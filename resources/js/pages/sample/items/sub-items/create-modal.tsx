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
import { SelectOption } from '@/types';
import { FormEvent, useState } from 'react';
import sample from '@/routes/sample';

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
  integer: string;
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
    integer: '',
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
      body: JSON.stringify({
        item_id: data.item_id,
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
        
        // Reset form
        setData({
          item_id: itemId,
          string: '',
          email: '',
          integer: '',
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
        <DialogOverlay className="z-[9999]" />
        <DialogContent className="z-[10000] max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Create Sub Item</DialogTitle>
        </DialogHeader>

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
              {processing ? 'Creating...' : 'Create Sub Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
