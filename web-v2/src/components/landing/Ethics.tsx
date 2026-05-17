import { HeartHandshake, EyeOff, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';

const RULES: Array<{ Icon: LucideIcon; t: string; d: string }> = [
  {
    Icon: HeartHandshake,
    t: 'No tocar lo ajeno',
    d: 'Cero pentest, cero escaneo activo sin autorización escrita. NOMAD trabaja sobre señales públicas y feeds OSINT con licencia.',
  },
  {
    Icon: EyeOff,
    t: 'No rehospedar PII',
    d: 'Solo confirmamos exposición vía k-anonymity. Nunca almacenamos correos completos ni credenciales en claro. Datos demo son 100% sintéticos.',
  },
  {
    Icon: ShieldCheck,
    t: 'Lado del defensor',
    d: 'Si una feature puede usarse para atacar, la descartamos. Cada decisión publicable pasa por revisor humano antes de salir.',
  },
];

export function Ethics() {
  return (
    <section className="section" id="etica" aria-labelledby="etica-title">
      <div className="container">
        <Chip className="section-eyebrow">Ética</Chip>
        <h2 id="etica-title" className="section-title">
          Reglas de oro. No negociables.
        </h2>
        <p className="section-lede">
          Trabajamos en seguridad de instituciones públicas. La línea entre defender y dañar es
          delgada — la respetamos.
        </p>

        <div className="ethics__grid">
          {RULES.map(({ Icon, t, d }) => (
            <Card key={t} className="ethic">
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
