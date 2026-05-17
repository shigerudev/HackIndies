import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Chip({
  children,
  className,
  withDot = true,
}: {
  children: ReactNode;
  className?: string;
  withDot?: boolean;
}) {
  return (
    <span className={cn('eyebrow', className)}>
      {withDot && <span className="dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
