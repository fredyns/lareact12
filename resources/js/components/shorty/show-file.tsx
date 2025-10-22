import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface ShowFileProps {
  label: string;
  url: string | null;
  path: string | null;
  loading?: boolean;
}

export function ShowFile({ label, url, path, loading = false }: ShowFileProps) {
  const fileName = path ? path.split('/').pop() || 'Download file' : 'Download file';

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-20 w-full" />
      ) : url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <FileText className="mr-3 h-8 w-8 text-blue-600" />
          <div>
            <p className="font-medium">{fileName}</p>
            <p className="text-sm text-muted-foreground">Click to download</p>
          </div>
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">No data available</p>
      )}
    </div>
  );
}
