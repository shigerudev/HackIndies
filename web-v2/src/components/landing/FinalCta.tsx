import { Star, ArrowRight } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { CodeBlock } from '@/components/ui/CodeBlock';

const LINES = [
  { cmd: 'git',  arg: 'clone https://github.com/shigerudev/HackIndies.git' },
  { cmd: 'cd',   arg: 'HackIndies && npm run install:all' },
  { cmd: 'cd',   arg: 'backend && cp .env.example .env && npm run dev' },
  { cmd: 'cd',   arg: '../web && cp .env.example .env.local && npm run dev' },
  { cmd: 'open', arg: 'http://localhost:3000' },
];

const COPY_TEXT =
  'git clone https://github.com/shigerudev/HackIndies.git\n' +
  'cd HackIndies && npm run install:all\n' +
  'cd backend && cp .env.example .env && npm run dev\n' +
  'cd ../web && cp .env.example .env.local && npm run dev\n' +
  'open http://localhost:3000\n';

export function FinalCta() {
  return (
    <section className="section cta-final" id="empezar" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta-final__inner">
          <Chip className="section-eyebrow">Empezar</Chip>
          <h2 id="cta-title" className="section-title">
            Probalo en 5 pasos.
          </h2>

          <CodeBlock lines={LINES} label="setup local" copyText={COPY_TEXT} />

          <div className="cta-final__ctas">
            <Button
              href="https://github.com/shigerudev/HackIndies"
              target="_blank"
              size="lg"
            >
              <Star size={16} /> Star en GitHub
            </Button>
            <Button href="/app" variant="ghost" size="lg">
              Ver demo en vivo
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
