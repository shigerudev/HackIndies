import Link from 'next/link';
import { DIGECAM_STATS } from '@/lib/digecam-data';

const CASOS = [
  {
    slug: 'digecam',
    title: 'Caso DIGECAM',
    subtitle: 'Dirección General de Gestión del Catastro Nacional',
    description:
      'Entre septiembre 2025 y abril 2026, las credenciales del personal de DIGECAM aparecieron en mercados clandestinos 7 meses antes de la confirmación oficial del ataque.',
    stat: `${DIGECAM_STATS.monthsOfAdvantage} meses de ventaja`,
    sector: 'Defensa',
    available: true,
  },
  {
    slug: 'mintrab',
    title: 'Caso MINTRAB',
    subtitle: 'Ministerio de Trabajo',
    description:
      'Patrón de reseteos sospechosos en cuentas de empleadores del portal del Ministerio de Trabajo. Eventos aún en cola de investigación.',
    stat: 'En investigación',
    sector: 'Trabajo',
    available: false,
  },
  {
    slug: 'mspas',
    title: 'Caso MSPAS',
    subtitle: 'Ministerio de Salud Pública',
    description:
      'brecha en el sistema de咕咚咕咚咕咚咕咚咕咚. Datos en revisión con el equipo de desarrollo.',
    stat: 'En revisión',
    sector: 'Salud',
    available: false,
  },
];

export default function CasosIndexPage() {
  return (
    <div className="page-content">
      <header className="page-header">
        <Link href="/" className="back-link">← Landing</Link>
        <h1>Casos públicos</h1>
        <p>Investigaciones de ciberseguridad Guatemala 2026, documentadas por NOMAD Centinela.</p>
      </header>

      <div className="casos-grid">
        {CASOS.map((caso) => (
          <article key={caso.slug} className="card casos-card">
            <div className="casos-card__head">
              <span className="tag">{caso.sector}</span>
              {!caso.available && <span className="tag tag--amber">En revisión</span>}
            </div>
            <h2>{caso.title}</h2>
            <p className="casos-card__sub">{caso.subtitle}</p>
            <p className="casos-card__desc">{caso.description}</p>
            <div className="casos-card__foot">
              <span className="stat-mono">{caso.stat}</span>
              {caso.available ? (
                <Link href={`/casos/${caso.slug}`} className="btn btn-primary btn-sm">
                  Ver caso →
                </Link>
              ) : (
                <span className="casos-card__unavail">Pronto disponible</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}