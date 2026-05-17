'use client'

import './ProblemSection.css'

const ProblemSection = () => {
  return (
    <section className="problem-section" id="platform">
      <div className="section-container">
        <div className="problem-grid">
          <div className="problem-left">
            <p className="section-eyebrow reveal">El problema</p>
            <h2 className="problem-heading reveal reveal-delay-1">
              Los defensores se enteran
              <br />
              <span className="serif-italic-accent">demasiado tarde.</span>
            </h2>
            <p className="problem-body reveal reveal-delay-2">
              Entre abril y mayo de 2026, Guatemala enfrentó una ola de ciberataques contra
              instituciones estatales — DIGECAM, MINTRAB, MSPAS, MINEDUC, entre otras.
              Investigaciones de Vector Crítico revelaron un patrón recurrente: credenciales
              de funcionarios apareciendo en mercados clandestinos{' '}
              <em>meses antes del ataque</em>, sin rotación masiva ni 2FA generalizado.
            </p>
            <p className="problem-body reveal reveal-delay-3">
              Los equipos de seguridad lo saben después de la brecha; la ciudadanía, aún más
              tarde. NOMAD reduce esa brecha.
            </p>
          </div>

          <div className="problem-right">
            <div className="stat-card glass reveal reveal-delay-2">
              <span className="stat-number">7</span>
              <span className="stat-unit">meses</span>
              <p className="stat-label">
                Ventana de detección antes de la confirmación oficial del ataque a DIGECAM
              </p>
            </div>
            <div className="stat-card glass reveal reveal-delay-3">
              <span className="stat-number">4+</span>
              <span className="stat-unit">instituciones</span>
              <p className="stat-label">
                Organismos estatales comprometidos en una ventana de 60 días en Guatemala
              </p>
            </div>
            <div className="stat-card glass reveal reveal-delay-4">
              <span className="stat-number">0</span>
              <span className="stat-unit">2FA obligatorio</span>
              <p className="stat-label">
                Autenticación de dos factores generalizada en la mayoría de los organismos
                afectados
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProblemSection
