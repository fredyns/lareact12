import { Skeleton } from '@/components/ui/skeleton';

interface ShowWysiwygProps {
  label: string;
  value: string | null | undefined;
  loading?: boolean;
}

export function ShowWysiwyg({ label, value, loading = false }: ShowWysiwygProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : value ? (
        <div
          className="prose prose-sm dark:prose-invert max-w-none [&_li]:my-1 [&_li]:ml-0 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{
            __html: value,
          }}
        />
      ) : (
        <div className="rounded-lg bg-muted/50 p-4 text-muted-foreground">-</div>
      )}
    </div>
  );
}
