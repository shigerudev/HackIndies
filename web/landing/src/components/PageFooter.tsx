import './PageFooter.css'

const PageFooter = () => {
  return (
    <footer className="page-footer">
      <div className="section-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.7" />
                <circle cx="16" cy="8" r="4" fill="white" fillOpacity="0.7" />
                <circle cx="8" cy="16" r="4" fill="white" fillOpacity="0.7" />
                <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.7" />
              </svg>
              <span className="footer-brand-name">NOMAD</span>
            </div>
            <p className="footer-tagline">
              Early warning for credential exposure<br />
              in LATAM public institutions.
            </p>
            <p className="footer-team">
              Equipo <strong>NOMAD security</strong> · Track Def/Acc — hack@latam
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">Platform</h4>
              <ul>
                <li><a href="#platform">How it works</a></li>
                <li><a href="#platform-agents">Agents</a></li>
                <li><a href="#solutions">Audiences</a></li>
                <li><a href="#customers">Comparison</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <ul>
                <li>
                  <a href="https://github.com/shigerudev/HackIndies" target="_blank" rel="noopener noreferrer">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="https://github.com/shigerudev/HackIndies/blob/main/docs/PHASES.md" target="_blank" rel="noopener noreferrer">
                    Roadmap (PHASES.md)
                  </a>
                </li>
                <li>
                  <a href="https://github.com/shigerudev/HackIndies/blob/main/docs/DEMO-SCRIPT.md" target="_blank" rel="noopener noreferrer">
                    Demo Script
                  </a>
                </li>
                <li>
                  <a href="https://github.com/shigerudev/HackIndies/blob/main/AGENTS.md" target="_blank" rel="noopener noreferrer">
                    AGENTS.md
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Stack</h4>
              <ul>
                <li><span className="stack-item">Node.js · Fastify</span></li>
                <li><span className="stack-item">Vercel AI SDK · Zod</span></li>
                <li><span className="stack-item">Supabase · pgvector</span></li>
                <li><span className="stack-item">Next.js 15 · Flutter</span></li>
                <li><span className="stack-item">MiniMax · Make.com</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-license">Apache 2.0 License · NOMAD security team · 2026</span>
          <span className="footer-credit">
            Inspired by{' '}
            <a href="https://vectorcritico.com" target="_blank" rel="noopener noreferrer">
              Vector Crítico
            </a>{' '}
            · Agent patterns:{' '}
            <a href="https://mastra.ai" target="_blank" rel="noopener noreferrer">
              Mastra
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default PageFooter
