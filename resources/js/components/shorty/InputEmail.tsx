import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface InputEmailProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function InputEmail({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  className = '',
}: InputEmailProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'border-destructive' : className}
        required={required}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
