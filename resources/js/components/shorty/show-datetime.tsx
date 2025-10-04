interface ShowDatetimeProps {
  label: string;
  value: string | null | undefined;
  format?: string | Intl.DateTimeFormatOptions;
}

export function ShowDatetime({ label, value, format }: ShowDatetimeProps) {
  const formatValue = (val: string) => {
    const date = new Date(val);
    
    // If format is a string, use it as a preset or custom pattern
    if (typeof format === 'string') {
      switch (format) {
        case 'date':
          return date.toLocaleDateString();
        case 'time':
          return date.toLocaleTimeString();
        case 'datetime':
          return date.toLocaleString();
        default:
          // For custom ICU patterns, use Intl.DateTimeFormat
          try {
            return new Intl.DateTimeFormat('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }).format(date);
          } catch {
            return date.toLocaleString();
          }
      }
    }
    
    // If format is an object (Intl.DateTimeFormatOptions), use it directly
    if (format && typeof format === 'object') {
      return new Intl.DateTimeFormat('en-US', format).format(date);
    }
    
    // Default to datetime
    return date.toLocaleString();
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value ? formatValue(value) : '-'}</p>
    </div>
  );
}
