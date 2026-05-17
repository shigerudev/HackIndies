import { clsx } from 'clsx';

type Props = {
  value: string;
  label: string;
  hint?: string;
  color?: 'cyan' | 'emerald' | 'amber' | 'rose';
  className?: string;
};

export function Stat({ value, label, hint, color = 'cyan', className }: Props) {
  const colorMap = { cyan: '', emerald: 'emerald', amber: 'amber', rose: 'rose' } as const;
  return (
    <div className={className}>
      <div className={clsx('stat-card__num', colorMap[color])}>{value}</div>
      <div className="stat-card__lbl">{label}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
    </div>
  );
}