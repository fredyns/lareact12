import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ShowBadgeProps {
  label?: string;
  value: string | null;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  icon?: LucideIcon;
}

export function ShowBadge({ label, value, variant = 'default', icon: Icon }: ShowBadgeProps) {
  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      {value ? (
        <Badge variant={variant}>
          {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
          {value}
        </Badge>
      ) : (
        <p className="font-medium">-</p>
      )}
    </div>
  );
}
