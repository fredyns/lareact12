import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import React from 'react';
import type { CheckboxProps } from '@radix-ui/react-checkbox';

interface InputCheckboxProps extends Omit<CheckboxProps, 'checked' | 'onCheckedChange' | 'onChange'> {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  required?: boolean;
}

export function InputCheckbox({
  id,
  label,
  checked,
  onChange,
  error,
  required = false,
  ...props
}: InputCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(checked) => onChange(!!checked)}
        {...props}
      />
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
