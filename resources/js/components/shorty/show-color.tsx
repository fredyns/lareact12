interface ShowColorProps {
  label?: string;
  color: string | null;
}

export function ShowColor({ label = 'Color', color }: ShowColorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
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
    </div>
  );
}
