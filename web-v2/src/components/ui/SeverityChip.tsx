import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export function severityLabel(s: Severity): string {
  return { critical: 'Crit', high: 'High', medium: 'Med', low: 'Low' }[s];
}

export function severityClass(s: Severity): string {
  return { critical: 'crit', high: 'high', medium: 'med', low: 'low' }[s];
}

type Props = {
  severity: Severity;
  label?: string;
  className?: string;
};

export function SeverityChip({ severity, label, className }: Props) {
  return (
    <span className={clsx('severity-chip', severityClass(severity), className)}>
      {label ?? severityLabel(severity)}
    </span>
  );
}