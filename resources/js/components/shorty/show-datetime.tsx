import { format as formatDate } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ShowDatetimeProps {
  label: string;
  value: string | null | undefined;
  format?: string | Intl.DateTimeFormatOptions;
  loading?: boolean;
}

export function ShowDatetime({ label, value, format, loading = false }: ShowDatetimeProps) {
  const formatValue = (val: string) => {
    let date = new Date(val);
    
    // If date is invalid and value looks like a time string (HH:mm:ss or HH:mm)
    if (isNaN(date.getTime()) && /^(\d{1,2}):(\d{2})/.test(val)) {
      // Create a date with today's date and the provided time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Parse time string (HH:mm:ss or HH:mm)
      const timeParts = val.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
        
        today.setHours(hours, minutes, seconds);
        date = today;
      }
    }
    
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
          // For custom ICU patterns, use date-fns format
          try {
            return formatDate(date, format);
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
      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : (
        <p className="font-medium">{value ? formatValue(value) : '-'}</p>
      )}
    </div>
  );
}
