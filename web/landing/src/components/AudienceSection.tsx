import './AudienceSection.css'

const audiences = [
  {
    num: '01',
    title: 'Ciudadano',
    subtitle: 'Public employee · Contractor · Journalist',
    description:
      'Check if your institutional email appears in a breach — without your full address ever leaving the device. NOMAD uses k-anonymity (SHA-1 prefix, 5 chars only) so the server never sees your email.',
    action: 'Open app → enter email → get results',
    wide: true,
  },
  {
    num: '02',
    title: 'Defensor / SOC',
    subtitle: 'Ministry security team · CIRT',
    description:
      'Early signals + actionable playbooks in Spanish with estimated effort and cost. Not an 80-page corporate manual — 3–5 executable steps sized for 2–5 person teams with limited budgets.',
    action: 'Open dashboard → review HITL queue → get briefing',
    wide: false,
  },
  {
    num: '03',
    title: 'Periodista',
    subtitle: 'Independent media · OSINT researcher',
    description:
      'Auditable incident timelines and Spanish narrative drafts with cited sources. No need to touch raw dumps — NOMAD aggregates the signal, validates with HITL, and delivers context.',
    action: 'Open /casos → generate narrative draft → publish with own byline',
    wide: false,
  },
  {
    num: '04',
    title: 'Revisor HITL',
    subtitle: 'Lead technical · Compliance officer',
    description:
      'Fast approve/reject workflow with full auditability. Every publish decision on government breaches is politically sensitive — HITL gives you traceable, legally defensible records.',
    action: 'Open /hitl → review evidence → approve or reject',
    wide: true,
  },
]

const AudienceSection = () => {
  return (
    <section className="audience-section" id="solutions">
      <div className="section-container">
        <div className="audience-header">
          <p className="section-eyebrow reveal">Para quién</p>
          <h2 className="audience-heading reveal reveal-delay-1">
            Four stakeholders.<br />
            <span className="serif-italic-accent">One platform.</span>
          </h2>
        </div>

        <div className="audience-bento">
          {audiences.map((a, i) => (
            <div
              key={a.num}
              className={`audience-card glass reveal reveal-delay-${i + 1} ${a.wide ? 'card-wide' : ''}`}
            >
              <div className="audience-num">{a.num}</div>
              <div className="audience-body">
                <h3 className="audience-title">{a.title}</h3>
                <span className="audience-subtitle">{a.subtitle}</span>
                <p className="audience-desc">{a.description}</p>
                <div className="audience-action">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                  <span>{a.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AudienceSection
