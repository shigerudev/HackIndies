import './CtaSection.css'

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL ?? 'http://localhost:3000'

const CtaSection = () => {
  return (
    <section className="cta-section">
      <div className="cta-noise" />
      <div className="section-container">
        <div className="cta-inner">
          <p className="section-eyebrow reveal cta-eyebrow">Open source · Apache 2.0</p>
          <h2 className="cta-heading reveal reveal-delay-1">
            Stop the breach.<br />
            <span className="cta-serif">Before it becomes</span><br />
            a headline.
          </h2>
          <p className="cta-body reveal reveal-delay-2">
            NOMAD Centinela is free, open-source, and built for teams with limited budgets.
            Deploy it, fork it, or contribute — the first line of defense should be
            available to every institution in LATAM.
          </p>
          <div className="cta-actions reveal reveal-delay-3">
            <a
              href="https://github.com/shigerudev/HackIndies"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary-btn pill"
            >
              View on GitHub
              <span className="btn-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
            <a
              href={`${DASHBOARD_URL}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-secondary-btn pill"
            >
              Open Dashboard
            </a>
          </div>
          <div className="cta-stack reveal reveal-delay-4">
            <span>Node.js</span>
            <span className="dot" />
            <span>Supabase</span>
            <span className="dot" />
            <span>Next.js 15</span>
            <span className="dot" />
            <span>Flutter</span>
            <span className="dot" />
            <span>MiniMax</span>
            <span className="dot" />
            <span>Vercel AI SDK</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
