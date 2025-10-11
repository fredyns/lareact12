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
import { User, SelectOption } from '@/types';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import users from '@/routes/users';

interface InputSelectUserProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  defaultValue?: SelectOption | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function InputSelectUser({
  id,
  label,
  onChange,
  defaultValue,
  error,
  required = false,
  placeholder = 'Select user...',
  disabled = false,
}: InputSelectUserProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedValue, setSelectedValue] = useState<SelectOption | null>(defaultValue || null);
  const [searchInput, setSearchInput] = useState('');

  // Form state for creating new user
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadOptions = async (inputValue: string): Promise<SelectOption[]> => {
    setSearchInput(inputValue);
    
    try {
      const response = await fetch(`/users?search=${inputValue}`, {
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
      const usersData = result.data || result;

      const options = usersData.map((user: User) => ({
        value: user.id,
        label: `${user.name} (${user.email})`,
      }));

      // Add "Create new" option if search has value and no results
      if (inputValue && options.length === 0) {
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
      // Open dialog with pre-filled name value
      setNewUserData({
        name: searchInput,
        email: '',
        password: '',
        password_confirmation: '',
      });
      setIsDialogOpen(true);
    } else {
      setSelectedValue(selected);
      onChange(selected ? selected.value : '');
    }
  };

  const handleCreateUser = async () => {
    setIsCreating(true);
    setFormErrors({});

    try {
      const response = await fetch(users.store.url(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password,
          password_confirmation: newUserData.password_confirmation,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          // Laravel validation errors come as an object with field names as keys
          const formattedErrors: Record<string, string> = {};
          Object.keys(result.errors).forEach((key) => {
            // Take the first error message for each field
            formattedErrors[key] = Array.isArray(result.errors[key]) 
              ? result.errors[key][0] 
              : result.errors[key];
          });
          setFormErrors(formattedErrors);
        } else {
          throw new Error(result.message || 'Failed to create user');
        }
        return;
      }

      // Success - extract user from response
      const user = result.data || result;
      
      // Validate that we have the required user data
      if (!user || !user.id || !user.name || !user.email) {
        console.error('Invalid user data received:', result);
        throw new Error('Invalid response from server');
      }
      
      const newOption: SelectOption = {
        value: user.id,
        label: `${user.name} (${user.email})`,
      };

      setSelectedValue(newOption);
      onChange(user.id);
      setIsDialogOpen(false);
      
      // Reset form
      setNewUserData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setFormErrors({ general: 'Failed to create user. Please try again.' });
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
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setNewUserData({ name: '', email: '', password: '', password_confirmation: '' });
              setIsDialogOpen(true);
            }}
            disabled={disabled}
            title="Add new user"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formErrors.general && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {formErrors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-user-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-user-name"
                type="text"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                placeholder="Enter user's full name"
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-user-email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                placeholder="Enter user's email address"
                className={formErrors.email ? 'border-destructive' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-user-password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                placeholder="Enter a secure password"
                className={formErrors.password ? 'border-destructive' : ''}
              />
              {formErrors.password && (
                <p className="text-sm text-destructive">{formErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-user-password-confirmation">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-user-password-confirmation"
                type="password"
                value={newUserData.password_confirmation}
                onChange={(e) => setNewUserData({ ...newUserData, password_confirmation: e.target.value })}
                placeholder="Confirm the password"
                className={formErrors.password_confirmation ? 'border-destructive' : ''}
              />
              {formErrors.password_confirmation && (
                <p className="text-sm text-destructive">{formErrors.password_confirmation}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setFormErrors({});
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateUser}
              disabled={isCreating || !newUserData.name || !newUserData.email || !newUserData.password || !newUserData.password_confirmation}
            >
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
