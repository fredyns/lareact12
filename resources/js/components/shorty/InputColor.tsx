import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sketch } from '@uiw/react-color';
import React, { useState } from 'react';

interface InputColorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function InputColor({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = 'Select a color',
  required = false,
  className = '',
}: InputColorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center space-x-2">
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => setShowColorPicker(!showColorPicker)}
          placeholder={placeholder}
          className={error ? 'border-destructive' : className}
          readOnly
        />
        <div
          className="h-10 w-10 cursor-pointer rounded border"
          style={{ backgroundColor: value || '#fff' }}
          onClick={() => setShowColorPicker(!showColorPicker)}
        />
      </div>
      {showColorPicker && (
        <div className="absolute z-10 mt-2">
          <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
          <div className="relative">
            <Sketch color={value || '#fff'} onChange={(color) => onChange(color.hex)} />
          </div>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
