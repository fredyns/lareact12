import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface ShowBadgeProps {
  label?: string;
  value: string | null;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: LucideIcon;
  loading?: boolean;
}

export function ShowBadge({ label, value, variant = 'default', icon: Icon, loading = false }: ShowBadgeProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      {loading ? (
        <Skeleton className="h-6 w-24" />
      ) : value ? (
        <Badge variant={variant}>
          {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
          {value}
        </Badge>
      ) : (
        <span className="inline-flex items-center justify-center rounded-md border border-muted-foreground/30 px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap bg-transparent text-muted-foreground">
          N/A
        </span>
      )}
    </div>
  );
}
