import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface InputNumberProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  slider?: boolean;
  loading?: boolean;
}

export function InputNumber({
  id,
  label,
  value,
  onChange,
  error,
  min,
  max,
  step,
  required = false,
  className = '',
  slider = true,
  loading = false,
  ...props
}: InputNumberProps) {
  // Show slider only if slider is true AND both min and max are defined
  const showSlider = slider && min !== undefined && max !== undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {loading ? (
        <>
          <Skeleton className="h-10 w-full" />
          {showSlider && <Skeleton className="h-2 w-full mt-2" />}
        </>
      ) : (
        <>
          <Input
            type="number"
            id={id}
            min={min}
            max={max}
            step={step}
            value={value || '1'}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${error ? 'border-destructive' : className}`}
            required={required}
            {...props}
          />
          {showSlider && (
            <div className="mt-2">
              <input
                type="range"
                id={`${id}-slider`}
                min={min}
                max={max}
                value={value || '1'}
                onChange={(e) => onChange(e.target.value)}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
              />
            </div>
          )}
        </>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
