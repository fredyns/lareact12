import { Badge } from '@/components/ui/badge';

interface ShowBadgeProps {
  label?: string;
  value: string | null;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function ShowBadge({ label, value, variant = 'default' }: ShowBadgeProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      {value ? <Badge variant={variant}>{value}</Badge> : <p className="font-medium">-</p>}
    </div>
  );
}
