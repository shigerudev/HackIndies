'use client'

import './ComparisonSection.css'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="check-icon">
    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cross-icon">
    <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
    <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
  </svg>
)

const PartialIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="partial-icon">
    <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.4" />
  </svg>
)

type CellValue = 'yes' | 'no' | 'partial'

interface Feature {
  label: string
  hibp: CellValue
  spycloud: CellValue
  vector: CellValue
  cirt: CellValue
  nomad: CellValue
}

const features: Feature[] = [
  { label: 'Código abierto', hibp: 'no', spycloud: 'no', vector: 'yes', cirt: 'no', nomad: 'yes' },
  {
    label: 'Prioridad LATAM (español y contexto regional)',
    hibp: 'no',
    spycloud: 'no',
    vector: 'yes',
    cirt: 'partial',
    nomad: 'yes',
  },
  {
    label: 'Multiactor (ciudadano + defensor + periodista)',
    hibp: 'no',
    spycloud: 'no',
    vector: 'no',
    cirt: 'no',
    nomad: 'yes',
  },
  {
    label: 'HITL ético antes de publicar',
    hibp: 'no',
    spycloud: 'partial',
    vector: 'no',
    cirt: 'partial',
    nomad: 'yes',
  },
  {
    label: 'Playbooks accionables con costo / horas',
    hibp: 'no',
    spycloud: 'no',
    vector: 'no',
    cirt: 'no',
    nomad: 'yes',
  },
  {
    label: 'Comprobación ciudadana k-anonimato',
    hibp: 'yes',
    spycloud: 'no',
    vector: 'no',
    cirt: 'no',
    nomad: 'yes',
  },
  {
    label: 'Gratis / sin muro enterprise',
    hibp: 'yes',
    spycloud: 'no',
    vector: 'yes',
    cirt: 'partial',
    nomad: 'yes',
  },
]

const tools = ['HIBP', 'Spycloud', 'Vector Crítico', 'CIRTs', 'NOMAD']

const renderCell = (val: CellValue) => {
  if (val === 'yes') return <CheckIcon />
  if (val === 'no') return <CrossIcon />
  return <PartialIcon />
}

const ComparisonSection = () => {
  return (
    <section className="comparison-section" id="customers">
      <div className="section-container">
        <div className="comparison-header">
          <p className="section-eyebrow reveal">Diferenciadores</p>
          <h2 className="comparison-heading reveal reveal-delay-1">
            La primera plataforma de código abierto
            <br />
            <span className="serif-italic-accent">que une los cuatro mundos.</span>
          </h2>
          <p className="comparison-sub reveal reveal-delay-2">
            HIBP te dice si filtró tu correo, pero no opera un SOC estatal. Spycloud es
            cerrado y B2B. Vector Crítico cuenta la historia sin automatizar la respuesta.
            Los CIRT suelen ser lentos y poco transparentes.{' '}
            <strong>NOMAD los conecta en español.</strong>
          </p>
        </div>

        <div className="comparison-table-wrap reveal reveal-delay-3">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="feature-col">Característica</th>
                {tools.map((t) => (
                  <th key={t} className={t === 'NOMAD' ? 'nomad-col' : ''}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={i}>
                  <td className="feature-label">{f.label}</td>
                  <td>{renderCell(f.hibp)}</td>
                  <td>{renderCell(f.spycloud)}</td>
                  <td>{renderCell(f.vector)}</td>
                  <td>{renderCell(f.cirt)}</td>
                  <td className="nomad-col">{renderCell(f.nomad)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="comparison-footnote reveal reveal-delay-4">
          El punto (·) indica cobertura limitada, de pago o no sistemática. Datos basados en
          páginas públicas de producto e investigación de Vector Crítico, mayo 2026.
        </p>
      </div>
    </section>
  )
}

export default ComparisonSection
