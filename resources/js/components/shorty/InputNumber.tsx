import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface InputNumberProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: string | number;
  required?: boolean;
  className?: string;
  slider?: boolean;
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
}: InputNumberProps) {
  // Show slider only if slider is true AND both min and max are defined
  const showSlider = slider && min !== undefined && max !== undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
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
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
