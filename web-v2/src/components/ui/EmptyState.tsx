import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Props = {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, hint, action, className }: Props) {
  return (
    <div className={clsx('empty-state', className)}>
      {icon && <div className="empty-state__icon">{icon}</div>}
      <div className="empty-state__title">{title}</div>
      {hint && <div className="empty-state__hint">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}