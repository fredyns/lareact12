import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface InputEmailProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  loading?: boolean;
}

export function InputEmail({
  id,
  label,
  value,
  onChange,
  error,
  required = false,
  className = '',
  loading = false,
  ...props
}: InputEmailProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Input
          id={id}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? 'border-destructive' : className}
          required={required}
          {...props}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
