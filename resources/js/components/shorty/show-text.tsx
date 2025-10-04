interface ShowTextProps {
  label: string;
  value: string | null | undefined;
}

export function ShowText({ label, value }: ShowTextProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="rounded-lg bg-muted/50 p-4 whitespace-pre-wrap">{value || '-'}</div>
    </div>
  );
}
