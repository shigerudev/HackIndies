import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Props = {
  eyebrow?: string;
  title: string;
  meta?: string;
  actions?: ReactNode;
  className?: string;
};

export function Toolbar({ eyebrow, title, meta, actions, className }: Props) {
  return (
    <div className={clsx('toolbar', className)}>
      <div className="toolbar__left">
        {eyebrow && <div className="toolbar__eyebrow">{eyebrow}</div>}
        <div className="toolbar__title">{title}</div>
        {meta && <div className="toolbar__meta">{meta}</div>}
      </div>
      {actions && <div className="toolbar__actions">{actions}</div>}
    </div>
  );
}