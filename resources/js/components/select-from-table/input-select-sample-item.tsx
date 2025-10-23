import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Item, SelectOption } from '@/types';
import { Plus } from 'lucide-react';
import { InputString } from '@/components/shorty/input-string';
import { InputEmail } from '@/components/shorty/input-email';
import { InputEnum } from '@/components/shorty/input-enum';
import enums from '@/types/enums.generated';
import sample from '@/routes/sample';

interface InputSelectSampleItemProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  defaultValue?: SelectOption | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
}

export function InputSelectSampleItem({
  id,
  label,
  onChange,
  defaultValue,
  error,
  required = false,
  placeholder = 'Select item...',
  disabled = false,
  allowCreate = true,
}: InputSelectSampleItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedValue, setSelectedValue] = useState<SelectOption | null>(defaultValue || null);
  const [searchInput, setSearchInput] = useState('');

  // Form state for creating new item
  const [newItemData, setNewItemData] = useState({
    string: '',
    email: '',
    enumerate: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadOptions = async (inputValue: string): Promise<SelectOption[]> => {
    setSearchInput(inputValue);
    
    try {
      const response = await fetch(sample.items.index.url({ query: { search: inputValue } }), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      const items = result.data?.data || result.data || result;

      const options = items.map((item: Item) => ({
        value: item.id,
        label: item.string,
      }));

      // Add "Create new" option if search has value and no results (only if allowCreate is true)
      if (allowCreate && inputValue && options.length === 0) {
        return [
          {
            value: '__create_new__',
            label: `➕ Create "${inputValue}"`,
          },
        ];
      }

      return options;
    } catch (error) {
      console.error('Error loading options:', error);
      return [];
    }
  };

  const handleSelectChange = (selected: SelectOption | null) => {
    if (selected?.value === '__create_new__') {
      // Open dialog with pre-filled string value
      setNewItemData({
        string: searchInput,
        email: '',
        enumerate: '',
      });
      setIsDialogOpen(true);
    } else {
      setSelectedValue(selected);
      onChange(selected ? selected.value : '');
    }
  };

  const handleCreateItem = async () => {
    setIsCreating(true);
    setFormErrors({});

    try {
      const response = await fetch(sample.items.store.url(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          string: newItemData.string,
          email: newItemData.email,
          enumerate: newItemData.enumerate,
          // Optional fields - send null or omit to avoid validation errors
          color: null,
          integer: null,
          decimal: null,
          npwp: null,
          datetime: null,
          date: null,
          time: null,
          ip_address: null,
          boolean: false,
          text: null,
          file: null,
          image: null,
          markdown_text: null,
          wysiwyg: null,
          latitude: null,
          longitude: null,
          user_id: null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setFormErrors(result.errors);
        } else {
          throw new Error(result.message || 'Failed to create item');
        }
        return;
      }

      // Success - extract item from Laravel JsonResource response
      // Laravel JsonResource wraps data in a 'data' property
      const item = result.data || result;
      
      const newOption: SelectOption = {
        value: item.id,
        label: item.string,
      };

      setSelectedValue(newOption);
      onChange(item.id);
      setIsDialogOpen(false);
      
      // Reset form
      setNewItemData({
        string: '',
        email: '',
        enumerate: '',
      });
    } catch (error) {
      console.error('Error creating item:', error);
      setFormErrors({ general: 'Failed to create item. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <AsyncSelect
              id={id}
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              onChange={handleSelectChange}
              value={selectedValue}
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              placeholder={placeholder}
              isDisabled={disabled}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#2563eb',
                  primary75: '#3b82f6',
                  primary50: '#60a5fa',
                  primary25: '#93c5fd',
                  danger: '#ef4444',
                  dangerLight: '#fca5a5',
                  neutral0: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                  neutral5: document.documentElement.classList.contains('dark') ? '#374151' : '#f9fafb',
                  neutral10: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                  neutral20: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                  neutral30: document.documentElement.classList.contains('dark') ? '#6b7280' : '#d1d5db',
                  neutral40: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#9ca3af',
                  neutral50: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                  neutral60: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#4b5563',
                  neutral70: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                  neutral80: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#1f2937',
                  neutral90: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
                },
              })}
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                  borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#d1d5db',
                }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : 'white',
                  zIndex: 9999,
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: document.documentElement.classList.contains('dark')
                    ? state.isFocused
                      ? '#374151'
                      : state.isSelected
                        ? '#4b5563'
                        : '#1f2937'
                    : state.isFocused
                      ? '#f3f4f6'
                      : state.isSelected
                        ? '#e5e7eb'
                        : 'white',
                  color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
                }),
                input: (baseStyles) => ({
                  ...baseStyles,
                  color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
                }),
              }}
            />
          </div>
          
          {allowCreate && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                setNewItemData({ string: '', email: '', enumerate: '' });
                setIsDialogOpen(true);
              }}
              disabled={disabled}
              title="Add new item"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new sample item. Only basic information is required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formErrors.general && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formErrors.general}
              </div>
            )}

            <InputString
              id="new-item-string"
              label="Name"
              value={newItemData.string}
              onChange={(value) => setNewItemData({ ...newItemData, string: value })}
              placeholder="Enter item name"
              error={formErrors.string}
              required
            />

            <InputEmail
              id="new-item-email"
              label="Email"
              value={newItemData.email}
              onChange={(value) => setNewItemData({ ...newItemData, email: value })}
              placeholder="Enter email address"
              error={formErrors.email}
            />

            <InputEnum
              id="new-item-enumerate"
              label="Status"
              value={newItemData.enumerate}
              onChange={(value) => setNewItemData({ ...newItemData, enumerate: value })}
              options={enums.Sample.ItemEnumerate.options}
              error={formErrors.enumerate}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateItem}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
