import './ComparisonSection.css'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="check-icon">
    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cross-icon">
    <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
    <line x1="6" y1="6" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.25"/>
  </svg>
)

const PartialIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="partial-icon">
    <circle cx="12" cy="12" r="2" fill="white" fillOpacity="0.4"/>
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
  { label: 'Open source',                               hibp: 'no',      spycloud: 'no',      vector: 'yes',     cirt: 'no',      nomad: 'yes' },
  { label: 'LATAM-first (Spanish, LATAM context)',       hibp: 'no',      spycloud: 'no',      vector: 'yes',     cirt: 'partial', nomad: 'yes' },
  { label: 'Multi-stakeholder (citizen + defender + journalist)', hibp: 'no', spycloud: 'no', vector: 'no',  cirt: 'no',      nomad: 'yes' },
  { label: 'Ethical HITL before publication',           hibp: 'no',      spycloud: 'partial', vector: 'no',      cirt: 'partial', nomad: 'yes' },
  { label: 'Actionable playbooks with cost / hours',    hibp: 'no',      spycloud: 'no',      vector: 'no',      cirt: 'no',      nomad: 'yes' },
  { label: 'k-anonymity citizen check',                 hibp: 'yes',     spycloud: 'no',      vector: 'no',      cirt: 'no',      nomad: 'yes' },
  { label: 'Free / no enterprise paywall',              hibp: 'yes',     spycloud: 'no',      vector: 'yes',     cirt: 'partial', nomad: 'yes' },
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
            The first open-source platform<br />
            <span className="serif-italic-accent">that unites all four worlds.</span>
          </h2>
          <p className="comparison-sub reveal reveal-delay-2">
            HIBP tells you if your email leaked — but doesn't help a state SOC.
            Spycloud is closed and B2B. Vector Crítico tells the story but doesn't automate.
            CIRTs are slow and opaque. <strong>NOMAD bridges all of them in Spanish.</strong>
          </p>
        </div>

        <div className="comparison-table-wrap reveal reveal-delay-3">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="feature-col">Feature</th>
                {tools.map((t) => (
                  <th key={t} className={t === 'NOMAD' ? 'nomad-col' : ''}>{t}</th>
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
          Partial (·) indicates limited, paid, or non-systematic coverage. Data based on public product pages and Vector Crítico research, May 2026.
        </p>
      </div>
    </section>
  )
}

export default ComparisonSection
