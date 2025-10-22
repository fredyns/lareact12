import { Skeleton } from '@/components/ui/skeleton';

interface ShowTextProps {
  label: string;
  value: string | null | undefined;
  loading?: boolean;
}

export function ShowText({ label, value, loading = false }: ShowTextProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="rounded-lg bg-muted/50 p-4 whitespace-pre-wrap">{value || '-'}</div>
      )}
    </div>
  );
}
