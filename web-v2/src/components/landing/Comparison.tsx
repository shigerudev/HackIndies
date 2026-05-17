import { Check } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';

type Mark = 'yes' | 'no' | 'warn' | 'brand';

type Row = {
  name: string;
  open: Mark;
  latam: Mark;
  multi: Mark;
  hitl: Mark;
  pb: Mark;
  nomad?: boolean;
};

const COMPARISON: Row[] = [
  { name: 'HIBP',             open: 'no',    latam: 'no',    multi: 'no',    hitl: 'no',    pb: 'no' },
  { name: 'Spycloud',         open: 'no',    latam: 'no',    multi: 'no',    hitl: 'warn',  pb: 'no' },
  { name: 'Vector Crítico',   open: 'yes',   latam: 'yes',   multi: 'no',    hitl: 'no',    pb: 'no' },
  { name: 'CIRTs nacionales', open: 'no',    latam: 'warn',  multi: 'no',    hitl: 'warn',  pb: 'no' },
  { name: 'NOMAD Centinela',  open: 'brand', latam: 'brand', multi: 'brand', hitl: 'brand', pb: 'brand', nomad: true },
];

const COLUMNS = [
  { key: 'open' as const,  label: 'Open source' },
  { key: 'latam' as const, label: 'LATAM-first' },
  { key: 'multi' as const, label: 'Multi-stakeholder' },
  { key: 'hitl' as const,  label: 'HITL ético' },
  { key: 'pb' as const,    label: 'Playbooks con costo/hora' },
];

function MarkGlyph({ v }: { v: Mark }) {
  if (v === 'yes')   return <span className="mark yes"><Check size={14} strokeWidth={2} /></span>;
  if (v === 'warn')  return <span className="mark warn">!</span>;
  if (v === 'brand') return <span className="mark brand"><Check size={14} strokeWidth={2} /></span>;
  return <span className="mark no">—</span>;
}

export function Comparison() {
  return (
    <section className="section" id="diferenciador" aria-labelledby="cmp-title">
      <div className="container">
        <Chip className="section-eyebrow">Diferenciador</Chip>
        <h2 id="cmp-title" className="section-title">
          Por qué NOMAD no es "uno más".
        </h2>
        <p className="section-lede">
          HIBP te dice si tu correo está expuesto, pero no ayuda al SOC del Estado. Spycloud es
          cerrado y B2B. Vector Crítico cuenta la historia pero no automatiza. Los CIRTs son
          lentos y opacos.
        </p>

        {/* Desktop table */}
        <div className="cmp-desktop">
          <table className="cmp-table">
            <thead>
              <tr>
                <th>Herramienta</th>
                {COLUMNS.map((c) => (
                  <th key={c.key} style={{ textAlign: 'center' }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.name} className={row.nomad ? 'nomad' : ''}>
                  <td>{row.name}</td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} style={{ textAlign: 'center' }}>
                      <MarkGlyph v={row[c.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="cmp-cards" role="presentation">
          {COMPARISON.map((row) => (
            <div key={row.name} className={`cmp-card ${row.nomad ? 'nomad' : ''}`}>
              <h4>{row.name}</h4>
              <ul>
                {COLUMNS.map((c) => (
                  <li key={c.key}>
                    <span className="m">
                      <MarkGlyph v={row[c.key]} />
                    </span>
                    <span>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
