import { ScanSearch, UserCheck, BookOpen, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';

type Pilar = { icon: LucideIcon; t: string; d: string };

const PILARES: Pilar[] = [
  {
    icon: ScanSearch,
    t: 'Detección agregada',
    d: 'Indexamos exposición sin rehospedar credenciales. Solo metadatos: prefijo de hash, sector, severidad, primera vista.',
  },
  {
    icon: UserCheck,
    t: 'Human-in-the-loop ético',
    d: 'Ningún evento se publica sin revisor humano. Cada aprobación queda en hitl_reviews con reviewer + comentario + timestamp.',
  },
  {
    icon: BookOpen,
    t: 'Playbooks accionables',
    d: 'Remediación en español con effort_hours y cost_estimate_usd. Pensados para SOC de 2–5 personas, no manuales de 80 páginas.',
  },
  {
    icon: Smartphone,
    t: 'App ciudadana k-anonymity',
    d: 'Estilo HIBP, en móvil, en español. El correo nunca sale del dispositivo: solo los 5 primeros caracteres del SHA-1.',
  },
];

export function Solution() {
  return (
    <section className="section" id="solucion" aria-labelledby="solucion-title">
      <div className="container">
        <Chip className="section-eyebrow">La solución</Chip>
        <h2 id="solucion-title" className="section-title">
          Cuatro pilares. Una sola plataforma.
        </h2>
        <p className="section-lede">
          NOMAD Centinela cierra el gap entre exposición detectable y acción defensiva — sin
          tocar lo ajeno, sin rehospedar PII, siempre del lado del defensor.
        </p>

        <div className="solution__grid">
          {PILARES.map(({ icon: Icon, t, d }) => (
            <Card key={t} interactive>
              <div className="icon-tile">
                <Icon size={22} strokeWidth={1.6} />
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
