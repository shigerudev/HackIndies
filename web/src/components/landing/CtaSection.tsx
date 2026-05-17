'use client'

import './CtaSection.css'

const CtaSection = () => {
  return (
    <section className="cta-section">
      <div className="cta-noise" />
      <div className="section-container">
        <div className="cta-inner">
          <p className="section-eyebrow reveal cta-eyebrow">Código abierto · Apache 2.0</p>
          <h2 className="cta-heading reveal reveal-delay-1">
            Corta la brecha.
            <br />
            <span className="cta-serif">Antes de que sea</span>
            <br />
            titular.
          </h2>
          <p className="cta-body reveal reveal-delay-2">
            NOMAD Centinela es gratuito, de código abierto y pensado para equipos con poco
            presupuesto. Despliégalo, haz fork o contribuye: la primera línea de defensa
            debería estar al alcance de cada institución en LATAM.
          </p>
          <div className="cta-actions reveal reveal-delay-3">
            <a
              href="https://github.com/shigerudev/HackIndies"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-primary-btn pill"
            >
              Ver en GitHub
              <span className="btn-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 17L17 7M17 7H7M17 7V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
            <a href="/dashboard" className="cta-secondary-btn pill">
              Abrir panel
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaSection
