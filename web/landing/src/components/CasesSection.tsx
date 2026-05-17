import './CasesSection.css'

const cases = [
  {
    id: 'A',
    severity: 'CRITICAL',
    institution: 'DIGECAM',
    period: 'April 2026',
    window: '7 months',
    title: 'Early warning that could have changed everything',
    description:
      'Credentials from Guatemala\'s Catastro Nacional appeared in clandestine markets 7 months before the official attack confirmation. NOMAD would have ingested the OSINT signal via Make.com webhook, triaged it as critical/defense, ran Investigator against internal sources, queued it for HITL review, and delivered a Defender playbook with mass rotation in 24 hours.',
    steps: [
      'Make webhook ingests OSINT signal',
      'Triage: severity critical, sector defense',
      'Investigator: strong_evidence label',
      'HITL reviewer approves after validation',
      'Defender: mass rotation in 24h, 60-day log review, CIRT GT notification',
    ],
    source: 'Vector Crítico investigation, April 2026',
  },
  {
    id: 'B',
    severity: 'MEDIUM',
    institution: 'MINTRAB',
    period: 'May 2026',
    window: '< 48 h',
    title: 'Suspicious resets on employer portal accounts',
    description:
      'Anomalous reset patterns on accounts of employers registered in Guatemala\'s Ministry of Labor employment portal. NOMAD would have prioritized notifying affected employers before rotation, acknowledging that most small companies don\'t monitor their accounts.',
    steps: [
      'Webhook receives anomalous log report',
      'Triage: severity medium, sector labor',
      'Defender briefing: notify employers first, then rotate',
      'Playbook: effort_hours 4, cost_estimate_usd 200',
    ],
    source: 'MINTRAB access logs, May 2026',
  },
  {
    id: 'C',
    severity: 'INFO',
    institution: 'RENAP',
    period: 'May 2026',
    window: 'Instant',
    title: 'Citizen k-anonymity check',
    description:
      'A RENAP official suspects their institutional email was compromised after a system update. They open the mobile app, enter their email — only the first 5 characters of the SHA-1 hash are sent. No full email ever touches a server log. They receive a targeted rotation playbook.',
    steps: [
      'Official opens Flutter app',
      'Device computes SHA-1, sends only 5-char prefix',
      'Server returns partial match count + generic recommendations',
      'Optional: specific playbook sent without full email in any log',
    ],
    source: 'k-anonymity protocol (HIBP model)',
  },
]

const severityClass: Record<string, string> = {
  CRITICAL: 'sev-critical',
  MEDIUM: 'sev-medium',
  INFO: 'sev-info',
}

const CasesSection = () => {
  return (
    <section className="cases-section" id="cases">
      <div className="section-container">
        <div className="cases-header">
          <p className="section-eyebrow reveal">Casos reales</p>
          <h2 className="cases-heading reveal reveal-delay-1">
            What NOMAD<br />
            <span className="serif-italic-accent">would have done.</span>
          </h2>
          <p className="cases-sub reveal reveal-delay-2">
            Three documented scenarios from Guatemala's April–May 2026 attack wave.
            All outcomes are reconstructed — the data is synthetic, the attack pattern is real.
          </p>
        </div>

        <div className="cases-list">
          {cases.map((c, i) => (
            <div key={c.id} className={`case-card glass reveal reveal-delay-${i + 1}`}>
              <div className="case-top">
                <div className="case-meta">
                  <span className={`case-severity ${severityClass[c.severity]}`}>{c.severity}</span>
                  <span className="case-institution">{c.institution}</span>
                  <span className="case-period">{c.period}</span>
                </div>
                <div className="case-window">
                  <span className="window-label">Detection window</span>
                  <span className="window-value">{c.window}</span>
                </div>
              </div>

              <div className="case-body">
                <div className="case-left">
                  <span className="case-id">Case {c.id}</span>
                  <h3 className="case-title">{c.title}</h3>
                  <p className="case-desc">{c.description}</p>
                  <p className="case-source">{c.source}</p>
                </div>

                <div className="case-steps">
                  {c.steps.map((step, si) => (
                    <div key={si} className="step-item">
                      <span className="step-num">{String(si + 1).padStart(2, '0')}</span>
                      <span className="step-text">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CasesSection
