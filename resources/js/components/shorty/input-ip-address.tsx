import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface InputIpAddressProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  loading?: boolean;
}

export function InputIpAddress({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = '192.168.1.1',
  required = false,
  className = '',
  loading = false,
  ...props
}: InputIpAddressProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove any non-digit and non-dot characters
    const cleaned = inputValue.replace(/[^\d.]/g, '');

    // Split by dots and process each part
    const parts = cleaned.split('.');
    const processedParts = parts.map((part) => {
      // Limit each part to 3 digits
      if (part.length > 3) {
        part = part.slice(0, 3);
      }
      // Ensure each part doesn't exceed 255
      const num = parseInt(part, 10);
      if (!isNaN(num) && num > 255) {
        part = '255';
      }
      return part;
    });

    // Limit to 4 parts maximum
    if (processedParts.length > 4) {
      processedParts.splice(4);
    }

    // Auto-add dots after complete octets
    let formatted = processedParts[0] || '';
    for (let i = 1; i < processedParts.length; i++) {
      formatted += '.' + processedParts[i];
    }

    // Auto-add dot when typing the 4th digit of an octet (except the last one)
    if (processedParts.length < 4) {
      const lastPart = processedParts[processedParts.length - 1];
      if (lastPart && lastPart.length === 3 && /^\d{3}$/.test(lastPart)) {
        const num = parseInt(lastPart, 10);
        if (num <= 255 && inputValue.length > formatted.length) {
          formatted += '.';
        }
      }
    }

    onChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={15}
        className={error ? 'border-destructive' : className}
        required={required}
        disabled={loading || props.disabled}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
