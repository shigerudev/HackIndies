'use client'

import { motion } from 'framer-motion'
import { Webhook, Brain, UserCheck, ShieldAlert } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: Webhook,
    title: 'Conectas una fuente',
    description:
      'Cualquier feed OSINT, webhook de Make.com o llamada directa a la API. Nunca almacenamos credenciales en claro.',
    hint: 'Webhook, ingestión manual o automatización controlada por tu equipo.',
  },
  {
    num: '02',
    icon: Brain,
    title: 'La IA clasifica la señal',
    description:
      'Nuestro agente Triage asigna severidad y resume la amenaza. Pasa a Investigator si necesita más contexto.',
    hint: 'La IA puede ejecutarse como mock si el modelo no está disponible (ver `mock:true` en la respuesta).',
  },
  {
    num: '03',
    icon: UserCheck,
    title: 'Un humano aprueba',
    description:
      'Antes de publicar cualquier alerta, tu equipo revisa la propuesta. Auditoría completa, sin publicación automática.',
    hint: 'HITL y estado del evento viven en el backend; el front solo refleja el API.',
  },
  {
    num: '04',
    icon: ShieldAlert,
    title: 'Encuentra un playbook',
    description:
      'Consultá la biblioteca de respuesta desde el servidor: buscás por texto o abrís una guía usando el slug (identificador corto). Los resultados son siempre los que devolvió el backend.',
    hint: 'Sin datos en biblioteca → la lista vacía; no hay listas ocultas en el front.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 26 } },
}

export default function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="section-pad border-b border-white/[0.06]"
    >
      <motion.div variants={item} className="mb-10 max-w-2xl">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
          De la señal a la acción{' '}
          <span className="serif-accent text-white/50">en cuatro pasos.</span>
        </h2>
        <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
          NOMAD combina ingesta automatizada, IA y revisión humana para que tu equipo se concentre
          solo en lo que requiere decisión.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 xl:gap-7">
        {/* Connecting line for desktop — alineado al centro vertical del icono */}
        <div className="hidden lg:block absolute top-[58px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent pointer-events-none" />

        {STEPS.map(({ num, icon: Icon, title, description, hint }) => (
          <motion.div
            key={num}
            variants={item}
            whileHover={{ y: -3 }}
            transition={{ type: 'spring' as const, stiffness: 380, damping: 22 }}
            className="card p-8 sm:p-9 rounded-2xl cursor-default relative flex flex-col lg:min-h-[320px]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="icon-wrap">
                <Icon size={16} className="text-white/70" strokeWidth={1.6} />
              </div>
              <span className="text-[10px] font-bold tracking-[0.14em] text-white/25 font-mono">
                {num}
              </span>
            </div>
            <h3 className="text-[16px] font-semibold text-white/90 mb-4 leading-snug tracking-tight">
              {title}
            </h3>
            <p className="text-[13px] text-white/45 leading-[1.75] mb-8 flex-1">
              {description}
            </p>
            <p className="text-[11px] text-white/30 italic tracking-tight leading-relaxed mt-auto pt-4 border-t border-white/[0.05]">
              {hint}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
