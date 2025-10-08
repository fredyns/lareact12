import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface InputTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function InputTextarea({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}: InputTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-destructive' : className}
        required={required}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
