'use client'

import './CasesSection.css'

const cases = [
  {
    id: 'A',
    severity: 'CRÍTICO',
    institution: 'DIGECAM',
    period: 'Abril 2026',
    window: '7 meses',
    title: 'Una alerta temprana que hubiera cambiado el escenario',
    description:
      'Credenciales del Catastro Nacional aparecieron en mercados clandestinos siete meses antes de la confirmación oficial del ataque. NOMAD habría ingerido la señal OSINT vía webhook Make.com, clasificado como crítico/defensa, ejecutado Investigator contra fuentes internas, encolado revisión HITL y entregado un playbook de rotación masiva en 24 horas.',
    steps: [
      'Webhook ingiere la señal OSINT',
      'Triage: severidad crítica, sector defensa',
      'Investigator: etiqueta evidencia_fuerte',
      'Revisor HITL aprueba tras validación',
      'Defensor: rotación masiva en 24 h, revisión de logs 60 días, aviso al CIRT GT',
    ],
    source: 'Investigación Vector Crítico, abril 2026',
  },
  {
    id: 'B',
    severity: 'MEDIO',
    institution: 'MINTRAB',
    period: 'Mayo 2026',
    window: '< 48 h',
    title: 'Resets sospechosos en cuentas del portal de empleadores',
    description:
      'Patrones anómalos de recuperación en cuentas de empleadores registrados en el portal del Ministerio de Trabajo. NOMAD habría priorizado notificar a los empleadores antes de la rotación, asumiendo que muchas pymes no monitorizan sus accesos.',
    steps: [
      'Webhook recibe informe de logs anómalos',
      'Triage: severidad media, sector trabajo',
      'Briefing defensor: avisar primero a empleadores, luego rotar',
      'Playbook: effort_hours 4, cost_estimate_usd 200',
    ],
    source: 'Logs de acceso MINTRAB, mayo 2026',
  },
  {
    id: 'C',
    severity: 'INFO',
    institution: 'RENAP',
    period: 'Mayo 2026',
    window: 'Inmediato',
    title: 'Comprobación ciudadana k-anonimato',
    description:
      'Un funcionario de RENAP sospecha que su correo institucional quedó comprometido tras una actualización. Abre la app móvil e introduce su email: solo se envían los primeros 5 caracteres del hash SHA-1. El correo completo no aparece en logs del servidor. Recibe un playbook de rotación focalizado.',
    steps: [
      'Funcionario abre la app Flutter',
      'El dispositivo calcula SHA-1 y envía solo el prefijo de 5 caracteres',
      'El servidor devuelve recuento parcial de coincidencias y recomendaciones genéricas',
      'Opcional: playbook específico sin registrar el correo completo',
    ],
    source: 'Protocolo k-anonimato (modelo HIBP)',
  },
]

const severityClass: Record<string, string> = {
  CRÍTICO: 'sev-critical',
  MEDIO: 'sev-medium',
  INFO: 'sev-info',
}

const CasesSection = () => {
  return (
    <section className="cases-section" id="cases">
      <div className="section-container">
        <div className="cases-header">
          <p className="section-eyebrow reveal">Casos reales</p>
          <h2 className="cases-heading reveal reveal-delay-1">
            Lo que NOMAD
            <br />
            <span className="serif-italic-accent">habría hecho.</span>
          </h2>
          <p className="cases-sub reveal reveal-delay-2">
            Tres escenarios documentados de la ola de ataques en Guatemala (abril–mayo
            2026). Los datos del simulacro son sintéticos; el patrón de ataque es real.
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
                  <span className="window-label">Ventana de detección</span>
                  <span className="window-value">{c.window}</span>
                </div>
              </div>

              <div className="case-body">
                <div className="case-left">
                  <span className="case-id">Caso {c.id}</span>
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
