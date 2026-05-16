type Props = {
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
};

export function Section({ title, description, badge, badgeColor = 'bg-cyan-900 text-cyan-300', children }: Props) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {badge && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      {description && <p className="text-sm text-slate-400 mb-4 leading-relaxed">{description}</p>}
      {children}
    </section>
  );
}