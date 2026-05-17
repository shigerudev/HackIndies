'use client'

import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { API_URL } from '@/services/api/client'
import { useInstitutions } from '@/hooks/useInstitutions'

export default function InstitutionsDirectory() {
  const { institutions, loading, error } = useInstitutions()

  return (
    <motion.section
      id="organizaciones"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Ámbito</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
          Organizaciones{' '}
          <span className="serif-accent text-white/50">en el radar institucional.</span>
        </h2>
        <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
          Vista resumida de las instituciones bajo tu radar: nombre, sector, país y dominio ofuscado. Cada tarjeta
          corresponde a una organización dada de alta para seguimiento en tu despliegue.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-28 rounded-xl skeleton" aria-hidden />
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          className="card rounded-2xl p-8 text-center text-[13px] text-white/50 space-y-3"
          role="alert"
        >
          <p className="text-white/65">{error}</p>
          <p className="text-[11px] text-white/35 font-mono break-all">
            Base configurada: {API_URL}
          </p>
        </div>
      )}

      {!loading && !error && institutions.length === 0 && (
        <div className="card rounded-2xl p-12 text-center border border-white/[0.06] border-dashed">
          <Building2 size={22} strokeWidth={1.3} className="mx-auto text-white/25 mb-3" />
          <p className="text-[14px] text-white/55">Aún no hay organizaciones cargadas para mostrar en esta vista.</p>
        </div>
      )}

      {!loading && !error && institutions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {institutions.map((inst, idx) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.04, 0.35) }}
              className="card p-5 rounded-xl flex flex-col gap-2 min-h-[120px]"
            >
              <p className="text-[12px] font-semibold tracking-tight text-white/85 leading-snug">
                {inst.name}
              </p>
              <p className="text-[11px] text-white/40 uppercase tracking-wider">{inst.sector}</p>
              <p className="text-[11px] text-white/35 mt-auto">{inst.country}</p>
              <p className="text-[10.5px] font-mono text-white/33 truncate" title={inst.domain_obfuscated}>
                {inst.domain_obfuscated}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  )
}
