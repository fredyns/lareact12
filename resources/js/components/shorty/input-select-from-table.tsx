import { Label } from '@/components/ui/label';
import React from 'react';
import AsyncSelect from 'react-select/async';
import { SelectOption } from '@/types';

interface InputSelectFromTableProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  apiEndpoint: string;
  defaultValue?: SelectOption | null;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function InputSelectFromTable({
  id,
  label,
  onChange,
  apiEndpoint,
  defaultValue,
  error,
  required = false,
  placeholder = 'Select...',
  disabled = false,
}: InputSelectFromTableProps) {
  const loadOptions = async (inputValue: string): Promise<SelectOption[]> => {
    try {
      const response = await fetch(`${apiEndpoint}?search=${inputValue}`, {
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

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading options:', error);
      return [];
    }
  };
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <AsyncSelect
        id={id}
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        onChange={(selected: SelectOption | null) => onChange(selected ? selected.value : '')}
        defaultValue={defaultValue}
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
          // singleValue: (baseStyles) => ({
          //   ...baseStyles,
          //   color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
          // }),
          input: (baseStyles) => ({
            ...baseStyles,
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#111827',
          }),
        }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
