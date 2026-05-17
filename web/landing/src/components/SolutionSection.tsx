import './SolutionSection.css'

const agents = [
  {
    id: '01',
    name: 'Router',
    role: 'Intent classifier',
    description: 'Classifies every incoming request and routes it to the right agent — Citizen or Defender — without exposing raw data.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: '02',
    name: 'Triage',
    role: 'Severity classifier',
    description: 'Assigns severity (critical / high / medium) and sector (defense, health, labor) to each incoming signal. Forces HITL on critical events.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: '03',
    name: 'Investigator',
    role: 'OSINT verifier',
    description: 'Cross-references signals against internal OSINT sources. Labels evidence as confirmed / strong_evidence / claimed before any publication.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="1.5" opacity="0.7"/>
        <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: '04',
    name: 'Citizen',
    role: 'k-anonymity checker',
    description: 'Receives only the first 5 chars of a SHA-1 hash. The full email never leaves the device. Returns exposure count + remediation steps.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="1.5" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: '05',
    name: 'Defender',
    role: 'SOC briefing',
    description: 'Generates 3–5 actionable steps with effort_hours and cost_estimate_usd for under-resourced security teams inside public institutions.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
    ),
  },
  {
    id: '06',
    name: 'Narrative',
    role: 'Draft generator',
    description: 'Produces journalist-ready drafts in Spanish with cited sources, key facts, and timeline — always gated behind the HITL review panel.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
        <polyline points="14 2 14 8 20 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
  },
]

const SolutionSection = () => {
  return (
    <section className="solution-section" id="platform-agents">
      <div className="section-container">
        <div className="solution-header">
          <p className="section-eyebrow reveal">Cómo funciona</p>
          <h2 className="solution-heading reveal reveal-delay-1">
            Six specialized agents.<br />
            <span className="serif-italic-accent">One coordinated response.</span>
          </h2>
          <p className="solution-sub reveal reveal-delay-2">
            Not a mega-chatbot. A pipeline of domain-focused agents that decompose
            every threat signal into verifiable, actionable intelligence —
            with a human reviewer at every publish decision.
          </p>
        </div>

        <div className="agents-grid">
          {agents.map((agent, i) => (
            <div
              key={agent.id}
              className={`agent-card glass reveal reveal-delay-${Math.min(i + 1, 6)}`}
            >
              <div className="agent-top">
                <div className="agent-icon-wrap">{agent.icon}</div>
                <span className="agent-id">{agent.id}</span>
              </div>
              <h3 className="agent-name">{agent.name}</h3>
              <span className="agent-role">{agent.role}</span>
              <p className="agent-desc">{agent.description}</p>
            </div>
          ))}
        </div>

        <div className="pipeline-note reveal">
          <div className="pipeline-line" />
          <span>Webhook ingestion → Triage → Investigator → HITL review → Defender / Narrative / Citizen output</span>
          <div className="pipeline-line" />
        </div>
      </div>
    </section>
  )
}

export default SolutionSection
