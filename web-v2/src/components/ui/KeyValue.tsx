import { clsx } from 'clsx';

type Props = {
  label: string;
  value: string | React.ReactNode;
  className?: string;
};

export function KeyValue({ label, value, className }: Props) {
  return (
    <div className={clsx('kv', className)}>
      <div className="kv__key">{label}</div>
      <div className="kv__val">{value}</div>
    </div>
  );
}