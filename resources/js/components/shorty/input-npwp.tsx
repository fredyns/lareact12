import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface InputNPWPProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  loading?: boolean;
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
  loading = false,
  ...props
}: InputNPWPProps) {
  const formatNPWP = (input: string): string => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Limit to 15 digits (NPWP format: 99.999.999.9-999.999)
    const limitedDigits = digits.slice(0, 15);
    
    // Apply NPWP formatting: 99.999.999.9-999.999
    let formatted = '';
    for (let i = 0; i < limitedDigits.length; i++) {
      // Add current digit
      formatted += limitedDigits[i];
      
      // Add separators after specific positions
      if (i === 1 || i === 4 || i === 7) {
        // Add dot after positions 1, 4, 7 (indices for 2nd, 5th, 8th digits)
        formatted += '.';
      } else if (i === 8) {
        // Add dash after position 8 (index for 9th digit)
        formatted += '-';
      } else if (i === 11) {
        // Add dot after position 11 (index for 12th digit)
        formatted += '.';
      }
    }
    
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNPWP(e.target.value);
    onChange(formatted);
  };

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
          type="text"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={20} // 15 digits + 4 dots + 1 dash = 20 characters
          pattern="[0-9]{2}\.[0-9]{3}\.[0-9]{3}\.[0-9]{1}-[0-9]{3}\.[0-9]{3}"
          title="Please enter NPWP in format: 99.999.999.9-999.999"
          className={error ? 'border-destructive' : className}
          required={required}
          {...props}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
