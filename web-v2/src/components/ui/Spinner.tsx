import { clsx } from 'clsx';

type Props = {
  size?: number;
  className?: string;
};

export function Spinner({ size = 18, className }: Props) {
  return (
    <div
      className={clsx('spinner', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Cargando"
    />
  );
}