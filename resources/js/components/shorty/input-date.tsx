import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import React from 'react';

interface InputDateProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function InputDate({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = 'Select a date',
  required = false,
  className = '',
  disabled = false,
  loading = false,
}: InputDateProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <DatePicker
          date={value ? new Date(value) : undefined}
          onDateChange={(date) => onChange(date ? date.toISOString().split('T')[0] : '')}
          placeholder={placeholder}
          className={error ? 'border-destructive' : className}
          disabled={disabled || loading}
        />
        {value && value.trim() !== '' && !disabled && !loading && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
            title="Clear date"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
