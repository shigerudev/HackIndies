'use client'

import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { CitizenChat } from '@/components/CitizenChat'

export default function CitizenAssistantSection() {
  return (
    <motion.section
      id="citizen-assistant"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <p className="eyebrow">Asistente</p>
          <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight mb-3">
            Dudas sobre{' '}
            <span className="serif-accent text-white/50">exposición y buenas prácticas.</span>
          </h2>
          <p className="text-[14px] text-white/45 leading-relaxed max-w-md">
            Consejos generales según cómo esté configurada tu central: si el modelo no está disponible, el equipo
            verá mensajes sustitutos. No sirve para comprobar credenciales ni compartir secretos — para eso usá la
            verificación de correo de arriba.
          </p>
          <div className="mt-8 flex items-center gap-3 text-[12px] text-white/30">
            <MessageCircle size={14} strokeWidth={1.4} />
            <span>Las preguntas se envían al servidor; revisa políticas locales si aplicas en producción.</span>
          </div>
        </div>
        <div className="lg:col-span-7">
          <CitizenChat variant="dashboard" />
        </div>
      </div>
    </motion.section>
  )
}
