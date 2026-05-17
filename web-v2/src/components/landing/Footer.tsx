import Image from 'next/image';

const COLS: Array<{ h: string; items: Array<[string, string]> }> = [
  {
    h: 'Producto',
    items: [
      ['Solución', '#solucion'],
      ['Audiencias', '#audiencias'],
      ['Caso DIGECAM', '#caso'],
      ['Stack', '#stack'],
    ],
  },
  {
    h: 'Documentación',
    items: [
      ['README', 'https://github.com/shigerudev/HackIndies#readme'],
      ['PHASES.md', 'https://github.com/shigerudev/HackIndies/blob/main/docs/PHASES.md'],
      ['DEMO-SCRIPT', 'https://github.com/shigerudev/HackIndies/blob/main/docs/DEMO-SCRIPT.md'],
      ['API', 'https://github.com/shigerudev/HackIndies/blob/main/shared/openapi.yaml'],
    ],
  },
  {
    h: 'Comunidad',
    items: [
      ['GitHub', 'https://github.com/shigerudev/HackIndies'],
      ['Track Def/Acc', 'https://hack.indies.la/tracks/'],
      ['Vector Crítico', 'https://vectorcritico.com/'],
      ['hack@latam', 'https://hack.indies.la/'],
    ],
  },
  {
    h: 'Legal',
    items: [
      ['Apache 2.0', 'https://github.com/shigerudev/HackIndies/blob/main/LICENSE'],
      ['Privacidad', '#etica'],
      ['Reglas de oro', '#etica'],
      ['Contacto', 'mailto:hello@nomad-security.example'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Image
              src="/logo-vertical.png"
              alt="NOMAD Centinela"
              width={110}
              height={110}
            />
            <p>
              Alerta temprana de credenciales para instituciones públicas de LATAM. Open
              source, en español.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.h} className="footer__col">
              <h5>{col.h}</h5>
              <ul>
                {col.items.map(([label, href]) => {
                  const external = href.startsWith('http');
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        {...(external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer__bottom">
          <span>© 2026 NOMAD security</span>
          <span className="sep">·</span>
          <span>Apache 2.0</span>
          <span className="sep">·</span>
          <span>Hecho en LATAM para LATAM</span>
        </div>
      </div>
    </footer>
  );
}
