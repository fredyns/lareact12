import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import React, { useEffect, useState } from 'react';

interface EnumOption {
  value: string;
  label: string;
}

interface InputEnumProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  enumClass: string; // e.g., 'ItemEnumerate'
  error?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function InputEnum({
  id,
  label,
  value,
  onChange,
  enumClass,
  error,
  required = false,
  disabled = false,
  loading = false,
}: InputEnumProps) {
  const [options, setOptions] = useState<EnumOption[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setFetchingOptions(true);
      try {
        const response = await fetch(`/enums/${enumClass}`, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          const result = await response.json();
          setOptions(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch enum options:', error);
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchOptions();
  }, [enumClass]);

  const isLoading = loading || fetchingOptions;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                value === option.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {option.label}
            </button>
          ))}
          {value && !disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-200"
              title="Clear selection"
            >
              ×
            </button>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
