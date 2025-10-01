import { TimePicker } from '@/components/ui/time-picker';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import React from 'react';

interface InputTimeProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function InputTime({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = 'Select time',
  required = false,
  className = '',
}: InputTimeProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <TimePicker
          id={id}
          value={value}
          onChange={(value) => onChange(value)}
          className={error ? 'border-destructive' : className}
          placeholder={placeholder}
        />
        {value && value.trim() !== '' && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
            title="Clear time"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
