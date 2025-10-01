import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import React from 'react';

interface InputDateTimeProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function InputDateTime({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = 'Select date and time',
  required = false,
  className = '',
}: InputDateTimeProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <DatePicker
          date={value ? new Date(value) : undefined}
          onDateChange={(date) => onChange(date ? date.toISOString().slice(0, 16) : '')}
          placeholder={placeholder}
          className={error ? 'border-destructive' : className}
          showTime={true}
        />
        {value && value.trim() !== '' && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
            title="Clear datetime"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
