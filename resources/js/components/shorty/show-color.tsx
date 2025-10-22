import { Skeleton } from '@/components/ui/skeleton';

interface ShowColorProps {
  label?: string;
  color: string | null;
  loading?: boolean;
}

export function ShowColor({ label = 'Color', color, loading = false }: ShowColorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : (
        <div className="flex items-center space-x-2">
          {color && (
            <div
              className="h-6 w-6 rounded border"
              style={{
                backgroundColor: color,
              }}
            />
          )}
          <p className="font-medium">{color || '-'}</p>
        </div>
      )}
    </div>
  );
}
