import type { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  children,
  className,
  interactive = false,
  as: As = 'div',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: 'div' | 'article' | 'section';
} & HTMLAttributes<HTMLElement>) {
  return (
    <As className={cn('card', interactive && 'interactive', className)} {...rest}>
      {children}
    </As>
  );
}
