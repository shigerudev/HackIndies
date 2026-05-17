'use client'

import Image from 'next/image'
import './PageFooter.css'

const PageFooter = () => {
  return (
    <footer className="page-footer" id="contacto">
      <div className="section-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <Image
                src="/logo-horizontal.png"
                alt="NOMAD Centinela"
                width={220}
                height={56}
                className="footer-logo-img"
              />
            </div>
            <p className="footer-tagline">
              Alerta temprana por exposición de credenciales
              <br />
              en instituciones públicas de LATAM.
            </p>
            <p className="footer-team">
              Equipo <strong>NOMAD security</strong> · Track Def/Acc — hack@latam
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4 className="footer-col-title">Plataforma</h4>
              <ul>
                <li>
                  <a href="#platform">Cómo funciona</a>
                </li>
                <li>
                  <a href="#platform-agents">Agentes</a>
                </li>
                <li>
                  <a href="#solutions">Audiencias</a>
                </li>
                <li>
                  <a href="#customers">Comparativa</a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Recursos</h4>
              <ul>
                <li>
                  <a href="https://github.com/shigerudev/HackIndies" target="_blank" rel="noopener noreferrer">
                    Repositorio en GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/shigerudev/HackIndies/blob/main/docs/PHASES.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hoja de ruta (PHASES.md)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/shigerudev/HackIndies/blob/main/docs/DEMO-SCRIPT.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Guión de demo
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/shigerudev/HackIndies/blob/main/AGENTS.md"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    AGENTS.md
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Stack</h4>
              <ul>
                <li>
                  <span className="stack-item">Node.js · Fastify</span>
                </li>
                <li>
                  <span className="stack-item">Vercel AI SDK · Zod</span>
                </li>
                <li>
                  <span className="stack-item">Supabase · pgvector</span>
                </li>
                <li>
                  <span className="stack-item">Next.js 15 · Flutter</span>
                </li>
                <li>
                  <span className="stack-item">MiniMax · Make.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-license">Licencia Apache 2.0 · Equipo NOMAD security · 2026</span>
          <span className="footer-credit">
            Inspirado en{' '}
            <a href="https://vectorcritico.com" target="_blank" rel="noopener noreferrer">
              Vector Crítico
            </a>{' '}
            · Patrones de agentes:{' '}
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
