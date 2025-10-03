import { Label } from '@/components/ui/label';
import React from 'react';

interface EnumOption {
  value: string;
  label: string;
}

interface InputEnumProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: EnumOption[];
  error?: string;
  required?: boolean;
}

export function InputEnum({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
}: InputEnumProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              value === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
        {value && (
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
