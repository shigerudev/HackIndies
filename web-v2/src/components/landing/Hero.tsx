import Image from 'next/image';
import { ArrowRight, Github } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';

const STATS = [
  { num: '7 meses', lbl: 'de ventana ganada' },
  { num: '6 agentes', lbl: 'especializados' },
  { num: '0 credenciales', lbl: 'rehospedadas' },
];

export function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero__grid">
          <div>
            <Chip>Track Def/Acc · hack@latam 2026</Chip>
            <h1 className="hero__h1">
              Alerta temprana de credenciales comprometidas para{' '}
              <em>instituciones públicas de LATAM.</em>
            </h1>
            <p className="hero__sub">
              Detectamos la exposición meses antes del ataque. Open-source, en español, con
              human-in-the-loop ético en cada decisión publicable.
            </p>
            <div className="hero__ctas">
              <Button href="#caso" size="lg">
                Ver el caso DIGECAM
                <ArrowRight size={16} />
              </Button>
              <Button
                href="https://github.com/shigerudev/HackIndies"
                target="_blank"
                variant="ghost"
                size="lg"
              >
                <Github size={16} />
                Leer en GitHub
              </Button>
              <Button href="/app" variant="secondary" size="lg">
                Probar el producto
                <ArrowRight size={16} />
              </Button>
            </div>
            <div className="hero__trust">
              {STATS.map((s) => (
                <div key={s.num} className="stat">
                  <div className="num">{s.num}</div>
                  <div className="lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__logo" aria-hidden="true">
            <div className="halo" />
            <Image
              src="/logo-vertical.png"
              alt=""
              width={440}
              height={440}
              priority
              className="logo-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
