import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface InputNPWPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function InputNpwp({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = '99.999.999.9-999.999',
  required = false,
  className = '',
  ...props
}: InputNPWPProps) {
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
        pattern="[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}"
        title="Please enter NPWP in format: 99.999.999.9-999.999"
        className={error ? 'border-destructive' : className}
        required={required}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
