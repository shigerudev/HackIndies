import { Smartphone, Download, Globe, ShieldCheck, Search, Bell } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'k-anonymity nativa',
    desc: 'Tu correo nunca sale del dispositivo. Solo enviamos los primeros 5 caracteres del SHA-1.',
  },
  {
    icon: Search,
    title: 'Verifica tu exposición',
    desc: 'Consultá si tus credenciales aparecen en brechas de instituciones públicas de LATAM.',
  },
  {
    icon: Bell,
    title: 'Alertas en español',
    desc: 'Notificaciones claras con pasos de remediación adaptados al contexto guatemalteco.',
  },
];

export function MobileDownload() {
  return (
    <section className="section" id="mobile" aria-labelledby="mobile-title">
      <div className="container">
        <Chip className="section-eyebrow">App móvil</Chip>
        <h2 id="mobile-title" className="section-title">
          NOMAD Centinela en tu bolsillo.
        </h2>
        <p className="section-lede">
          La app ciudadana para Android permite verificar si tus credenciales fueron expuestas
          — sin enviar tu correo completo al servidor. Privacidad por diseño, en español,
          para instituciones públicas de LATAM.
        </p>

        <div className="mobile-dl__grid">
          <div className="mobile-dl__features">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="mobile-dl__feature">
                <div className="mobile-dl__icon">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="mobile-dl__feat-title">{title}</p>
                  <p className="mobile-dl__feat-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mobile-dl__actions">
            <div className="mobile-dl__card">
              <div className="mobile-dl__card-head">
                <Smartphone size={22} className="mobile-dl__phone-icon" />
                <div>
                  <p className="mobile-dl__app-name">NOMAD Centinela</p>
                  <p className="mobile-dl__app-meta">Android · v0.1.0 · 2026</p>
                </div>
              </div>

              <a
                href="/nomad-centinela.apk"
                download="nomad-centinela.apk"
                className="btn btn-primary mobile-dl__btn"
              >
                <Download size={15} />
                Descargar APK
              </a>

              <a
                href="https://web-eta-three-50.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary mobile-dl__btn"
              >
                <Globe size={15} />
                Ver demo web
              </a>

              <p className="mobile-dl__note">
                Instalación manual — habilitá "fuentes desconocidas" en Ajustes › Seguridad.
                Requiere Android 7.0+.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
