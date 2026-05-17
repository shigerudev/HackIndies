'use client'

import './AudienceSection.css'

const audiences = [
  {
    num: '01',
    title: 'Ciudadano',
    subtitle: 'Funcionario público · Contratista · Periodista',
    description:
      'Comprueba si tu correo institucional aparece en una filtración sin enviar la dirección completa al servidor. NOMAD usa k-anonimato (prefijo SHA-1 de 5 caracteres): el backend nunca ve tu email.',
    action: 'Abrir app → escribir correo → ver resultado',
    wide: true,
  },
  {
    num: '02',
    title: 'Defensor / SOC',
    subtitle: 'Equipo de un ministerio · CIRT',
    description:
      'Señales tempranas y playbooks accionables en español con esfuerzo y costo estimados. No es un manual corporativo de 80 páginas: son 3–5 pasos ejecutables para equipos pequeños.',
    action: 'Abrir panel → revisar cola HITL → obtener briefing',
    wide: false,
  },
  {
    num: '03',
    title: 'Periodista',
    subtitle: 'Medio independiente · Investigador OSINT',
    description:
      'Líneas de tiempo auditables y borradores en español con fuentes citadas. Sin manipular volcados crudos: NOMAD consolida la señal, valida con HITL y entrega contexto.',
    action: 'Abrir casos → generar borrador → publicar con tu firma',
    wide: false,
  },
  {
    num: '04',
    title: 'Revisor HITL',
    subtitle: 'Liderazgo técnico · Cumplimiento',
    description:
      'Flujo rápido de aprobación o rechazo con trazabilidad. Cada decisión sobre brechas gubernamentales es sensible: el HITL deja registro defendible.',
    action: 'Abrir HITL → revisar evidencia → aprobar o rechazar',
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
            Cuatro perfiles.
            <br />
            <span className="serif-italic-accent">Una plataforma.</span>
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
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.5"
                    />
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
