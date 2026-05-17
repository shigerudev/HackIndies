import './ProblemSection.css'

const ProblemSection = () => {
  return (
    <section className="problem-section" id="platform">
      <div className="section-container">
        <div className="problem-grid">
          <div className="problem-left">
            <p className="section-eyebrow reveal">El problema</p>
            <h2 className="problem-heading reveal reveal-delay-1">
              Defenders learn<br />
              <span className="serif-italic-accent">too late.</span>
            </h2>
            <p className="problem-body reveal reveal-delay-2">
              Between April and May 2026, Guatemala faced a wave of cyberattacks
              against state institutions — DIGECAM, MINTRAB, MSPAS, MINEDUC among
              others. Research by Vector Crítico uncovered a recurring pattern:
              employee credentials appearing in clandestine markets
              <em> months before the attack</em>, with no mass rotation or
              generalized 2FA in place.
            </p>
            <p className="problem-body reveal reveal-delay-3">
              Defenders hear about it after the breach. Citizens, even later.
              NOMAD closes that gap.
            </p>
          </div>

          <div className="problem-right">
            <div className="stat-card glass reveal reveal-delay-2">
              <span className="stat-number">7</span>
              <span className="stat-unit">months</span>
              <p className="stat-label">Detection window before DIGECAM's official attack confirmation</p>
            </div>
            <div className="stat-card glass reveal reveal-delay-3">
              <span className="stat-number">4+</span>
              <span className="stat-unit">institutions</span>
              <p className="stat-label">State bodies compromised in a single 60-day window in Guatemala</p>
            </div>
            <div className="stat-card glass reveal reveal-delay-4">
              <span className="stat-number">0</span>
              <span className="stat-unit">2FA enforced</span>
              <p className="stat-label">Generalized two-factor authentication across most affected agencies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
