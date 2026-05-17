import { Github } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

const STACK = [
  'Node.js',
  'Fastify',
  'Vercel AI SDK',
  'Zod',
  'Supabase',
  'pgvector',
  'MiniMax',
  'Make.com',
  'Next.js 15',
  'Tailwind',
  'Flutter',
];

export function OpenSource() {
  return (
    <section className="section" id="open-source" aria-labelledby="os-title">
      <div className="container">
        <Chip className="section-eyebrow">Open source</Chip>
        <h2 id="os-title" className="section-title">
          Open source, auditable, en español.
        </h2>
        <p className="section-lede">
          Apache 2.0. Roadmap público. Datos sintéticos. CI en cada PR. El código que toma
          decisiones publicables se puede leer entero antes de creer en él.
        </p>

        <div className="os-badges">
          <a
            className="os-badge"
            href="https://github.com/shigerudev/HackIndies/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="k">license</span> <span className="v">Apache-2.0</span>
          </a>
          <span className="os-badge live">
            <span className="dot" aria-hidden="true" /> <span className="k">CI</span>{' '}
            <span className="v">passing</span>
          </span>
          <span className="os-badge">
            <span className="k">track</span> <span className="v">Def/Acc</span>
          </span>
          <a
            className="os-badge"
            href="https://github.com/shigerudev/HackIndies"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={12} /> shigerudev/HackIndies
          </a>
        </div>

        <div id="stack" className="stack-strip" aria-label="Stack técnico">
          {STACK.map((chip) => (
            <span key={chip} className="stack-chip">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
