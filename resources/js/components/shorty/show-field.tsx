interface ShowFieldProps {
  label: string;
  value: string | number | null | undefined;
}

export function ShowField({ label, value }: ShowFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '-'}</p>
    </div>
  );
}
