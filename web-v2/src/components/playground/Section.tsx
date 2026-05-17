type Props = {
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
};

export function Section({ title, description, badge, badgeColor = 'section-badge--cyan', children }: Props) {
  return (
    <section className="pg-section">
      <div className="pg-section__head">
        <h2 className="pg-section__title">{title}</h2>
        {badge && (
          <span className={`section-badge ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      {description && <p className="pg-section__desc">{description}</p>}
      {children}
    </section>
  );
}