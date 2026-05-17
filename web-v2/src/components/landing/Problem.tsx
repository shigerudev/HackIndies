import { Chip } from '@/components/ui/Chip';

const HITOS = [
  { when: 'Abr 2026', who: 'DIGECAM', what: 'credenciales en mercado clandestino' },
  { when: 'May 2026', who: 'MINTRAB', what: 'reseteos sospechosos en portal "Tu Empleo"' },
  { when: 'May 2026', who: 'MSPAS',   what: 'exfiltración parcial de directorios' },
  { when: 'May 2026', who: 'MINEDUC', what: 'accesos no autorizados a plataforma' },
];

export function Problem() {
  return (
    <section className="section problem" id="problema" aria-labelledby="problema-title">
      <div className="container">
        <div className="problem__grid">
          <div>
            <Chip className="section-eyebrow">El gap</Chip>
            <h2 id="problema-title" className="section-title">
              Los defensores se enteran tarde. Los ciudadanos, más tarde aún.
            </h2>
            <p
              style={{
                color: 'var(--fg-secondary)',
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: '52ch',
              }}
            >
              Entre abril y mayo de 2026, instituciones del Estado de Guatemala sufrieron una
              oleada de ataques. En todos los casos, las credenciales del personal aparecieron
              en mercados clandestinos meses antes de la confirmación oficial — sin rotación
              masiva, sin 2FA generalizado.
            </p>
            <div className="quote">
              <p>
                «El patrón se repite: la exposición es pública en feeds OSINT mucho antes de
                que el ataque se confirme. La ventana existe; no la usamos.»
              </p>
              <cite>
                — Vector Crítico,{' '}
                <a
                  href="https://vectorcritico.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  vectorcritico.com
                </a>
              </cite>
            </div>
          </div>

          <div>
            <div className="timeline-h">
              <div className="timeline-h__row">
                {HITOS.map((h) => (
                  <div key={h.who} className="timeline-h__item">
                    <div className="node" />
                    <div className="when">{h.when}</div>
                    <div className="what">
                      <strong>{h.who}</strong> — {h.what}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="callout-stat">
              <div className="label">Promedio observado</div>
              <div className="num">~5–7 meses</div>
              <div className="desc">
                entre exposición pública en mercado y confirmación oficial del ataque.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
