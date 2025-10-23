import { Skeleton } from '@/components/ui/skeleton';
import React, { useEffect, useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import {SelectOption} from "@/types";

interface SelectEnumProps {
  enumClass: string; // e.g., 'ItemEnumerate'
  value: SelectOption | null;
  onChange: (selected: SelectOption | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  className?: string;
  classNamePrefix?: string;
  styles?: StylesConfig<SelectOption, false>;
}

export function SelectEnum({
  enumClass,
  value,
  onChange,
  placeholder = 'Select...',
  isClearable = true,
  isDisabled = false,
  className = 'react-select-container',
  classNamePrefix = 'react-select',
  styles,
}: SelectEnumProps) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/enums/${enumClass}`, {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          const result = await response.json();
          setOptions(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch enum options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptions();
  }, [enumClass]);

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select
      isClearable={isClearable}
      isDisabled={isDisabled}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      options={options}
      className={className}
      classNamePrefix={classNamePrefix}
      styles={styles}
    />
  );
}
