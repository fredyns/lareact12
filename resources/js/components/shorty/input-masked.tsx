import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface InputMaskedProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  pattern?: string;
  title?: string;
  required?: boolean;
  className?: string;
}

export function InputMasked({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  pattern,
  title,
  required = false,
  className = '',
}: InputMaskedProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        pattern={pattern}
        title={title}
        className={error ? 'border-destructive' : className}
        required={required}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
