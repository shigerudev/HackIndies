const STYLES: Record<string, string> = {
  critical: 'bg-red-950 text-red-200 border-red-800',
  high: 'bg-orange-950 text-orange-200 border-orange-800',
  medium: 'bg-amber-950 text-amber-200 border-amber-800',
  low: 'bg-slate-800 text-slate-300 border-slate-600',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-medium uppercase ${STYLES[severity] ?? STYLES.medium}`}
    >
      {severity}
    </span>
  );
}
