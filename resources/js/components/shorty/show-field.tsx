import { Skeleton } from '@/components/ui/skeleton';

interface ShowFieldProps {
  label: string;
  value: string | number | null | undefined;
  loading?: boolean;
}

export function ShowField({ label, value, loading = false }: ShowFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-6 w-full" />
      ) : (
        <p className="font-medium">{value || '-'}</p>
      )}
    </div>
  );
}
