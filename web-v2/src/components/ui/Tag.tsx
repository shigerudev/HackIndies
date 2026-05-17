import { clsx } from 'clsx';

type Variant = 'default' | 'green' | 'amber' | 'red' | 'blue';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function Tag({ children, variant = 'default', className }: Props) {
  return (
    <span className={clsx('tag', variant !== 'default' && variant, className)}>
      {children}
    </span>
  );
}