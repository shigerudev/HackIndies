'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldAlert, Mail, Loader2, Lock } from 'lucide-react'
import { useCitizenCheck } from '@/hooks/useCitizenCheck'
import { Disclosure } from './primitives/Disclosure'

/** Dominios `.invalid` — solo patrones de formato; no garantizan coincidencia en la API. */
const FORMAT_EXAMPLE_ITEMS = [
  { hint: 'Patrón tipo institución pública · ficticio', email: 'funcionario.demo@ministerio-ejemplo.invalid' },
  { hint: 'Correo laboral genérico · ficticio', email: 'mesa.ayuda@organismo-demostracion.invalid' },
  { hint: 'Nombre compuesto · ficticio', email: 'ana.maria.lopez@correo-prueba.invalid' },
  { hint: 'Usuario + año · ficticio', email: 'usuario.trabajo.2026@mailbox-demostracion.invalid' },
  { hint: 'Subdominio equipo · ficticio', email: 'yo@mail.equipo-demostracion.invalid' },
] as const

/**
 * SHA-1 (primeros 5 hex) alineados con `citizen_alerts` en seed (`a1b2c`, `d4e5f`, `f6a7b`) — solo sintéticos.
 * Misma lógica que el playground (`POST /api/citizen/check` con `hash_prefix`), ver docs en despliegue.
 */
const DEMO_EMAIL_ITEMS = [
  {
    hint: 'Sintético · prefijo SHA-1 `a1b2c` · incidente ejemplo Tu Empleo (MINTRAB)',
    email: 'nomad-demo-461215@prueba-demostracion.invalid',
  },
  {
    hint: 'Sintético · prefijo `d4e5f` · mismo incidente ejemplo Tu Empleo',
    email: 'nomad-demo-2737197@prueba-demostracion.invalid',
  },
  {
    hint: 'Sintético · prefijo `f6a7b` · incidente ejemplo DIGECAM',
    email: 'nomad-demo-915303@prueba-demostracion.invalid',
  },
] as const

export default function CitizenCheck() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const { result, prefix, loading, error, check, reset } = useCitizenCheck()

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!email.trim()) return
    await check(email)
  }

  const fillExampleEmail = (addr: string) => {
    reset()
    setEmail(addr)
    queueMicrotask(() => inputRef.current?.focus())
  }

  return (
    <motion.section
      id="citizen-check"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: explanation + form */}
        <div className="lg:col-span-5">
          <p className="eyebrow">¿Estás expuesto?</p>
          <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight mb-3">
            Verifica si tu correo apareció{' '}
            <span className="serif-accent text-white/50">en una brecha.</span>
          </h2>
          <p className="text-[14px] text-white/45 leading-relaxed mb-7 max-w-md">
            Tu correo no se envía completo al servidor: solo los primeros 5 caracteres hex del
            SHA-1 (k-anonimato), igual que el cuerpo <code className="text-white/55 text-[12px]">hash_prefix</code> del{' '}
            <code className="text-white/55 text-[12px]">POST /api/citizen/check</code> en el{' '}
            <a
              href="https://web-de988z53r-shigerudev.vercel.app/playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 underline decoration-white/25 underline-offset-2 hover:text-white"
            >
              playground público
            </a>
            . Los incidentes mostrados vienen del seed sintético; no usamos correos reales de brechas.
          </p>

          <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            <div className="relative">
              <Mail size={14} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                ref={inputRef}
                type="email"
                id="citizen-check-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                aria-describedby="citizen-check-examples-intro citizen-check-examples-region"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/[0.2] focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div id="citizen-check-examples-region" className="space-y-4">
              <p id="citizen-check-examples-intro" className="text-[10px] text-white/25 leading-snug">
                Toca una línea para copiar el correo al campo. Los de formato son fictivos (.invalid). Los tres últimos están
                calculados para coincidir con el seed (prefijos como en el ejemplo{' '}
                <code className="text-white/40">a1b2c</code> del playground) cuando la API usa esa base de datos.
              </p>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/28 mb-2">
                  Ejemplos de formato · ficticios
                </p>
                <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                  {FORMAT_EXAMPLE_ITEMS.map(({ hint, email: addr }) => (
                    <li key={addr}>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => fillExampleEmail(addr)}
                        aria-label={`Usar ejemplo de formato ficticio: ${addr}`}
                        className="w-full text-left rounded-xl px-3.5 py-2.5 bg-white/[0.025] hover:bg-white/[0.055] disabled:opacity-40 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                      >
                        <span className="block text-[10px] text-white/35 mb-0.5">{hint}</span>
                        <span className="block font-mono text-[11px] tracking-tight text-white/55">{addr}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/28 mb-2">
                  Ejemplos sintéticos (prueba rápida en demo)
                </p>
                <ul className="flex flex-col gap-1.5 list-none m-0 p-0">
                  {DEMO_EMAIL_ITEMS.map(({ hint, email: addr }) => (
                    <li key={addr}>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => fillExampleEmail(addr)}
                        aria-label={`Usar correo sintético de ejemplo: ${addr}`}
                        className="w-full text-left rounded-xl px-3.5 py-2.5 bg-white/[0.025] hover:bg-white/[0.055] disabled:opacity-40 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                      >
                        <span className="block text-[10px] text-white/35 mb-0.5">{hint}</span>
                        <span className="block font-mono text-[11px] tracking-tight text-white/55">{addr}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-[13px] font-semibold transition-colors hover:bg-white/92 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={13} className="animate-spin" /> Verificando…</>
              ) : (
                <>Verificar exposición</>
              )}
            </button>
          </form>

          <p className="text-[10.5px] text-white/30 mt-4 flex items-center gap-1.5">
            <Lock size={10} strokeWidth={1.5} /> K-anonymity SHA-1 · sin almacenamiento de PII
          </p>
        </div>

        {/* Right: result */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card h-full min-h-[280px] rounded-2xl flex flex-col items-center justify-center gap-4 p-10"
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-white/35"
                    />
                  ))}
                </div>
                <p className="text-[12px] text-white/40">Calculando hash y consultando…</p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card h-full min-h-[280px] rounded-2xl flex flex-col items-center justify-center gap-3 p-10 text-center"
              >
                <ShieldAlert size={20} className="text-white/35" strokeWidth={1.5} />
                <p className="text-[13px] text-white/65">No se pudo verificar</p>
                <p className="text-[11px] text-white/35 max-w-xs">{error}</p>
              </motion.div>
            )}

            {!loading && !error && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="card p-6 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      result.exposed
                        ? 'bg-white/[0.08]'
                        : 'bg-white/[0.04]'
                    }`}>
                      {result.exposed ? (
                        <ShieldAlert size={18} className="text-white/80" strokeWidth={1.5} />
                      ) : (
                        <ShieldCheck size={18} className="text-white/65" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30 mb-1.5">
                        {result.exposed ? 'Exposición detectada' : 'Sin exposición conocida'}
                      </p>
                      <h3 className="text-[18px] font-semibold tracking-tight text-white leading-snug">
                        {result.exposed
                          ? `Tu correo aparece en ${result.events.length} ${result.events.length === 1 ? 'incidente' : 'incidentes'}.`
                          : 'No encontramos tu correo en brechas registradas.'}
                      </h3>
                      <p className="text-[13px] text-white/50 leading-relaxed mt-2">
                        {result.exposed
                          ? 'Te recomendamos actuar de inmediato siguiendo los pasos abajo.'
                          : 'Esto no garantiza que no aparezca en el futuro. Te recomendamos seguir buenas prácticas igualmente.'}
                      </p>
                    </div>
                  </div>
                </div>

                {result.exposed && result.events.length > 0 && (
                  <div className="card p-6 rounded-2xl">
                    <p className="eyebrow !mb-4">Incidentes relacionados</p>
                    <ul className="space-y-2.5">
                      {result.events.map((ev) => (
                        <li key={ev.id} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/35 mt-2 shrink-0" />
                          <div>
                            <p className="text-[13px] text-white/85 font-medium leading-snug">{ev.title}</p>
                            <p className="text-[11px] text-white/35 mt-0.5">{ev.institution_name}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="card p-6 rounded-2xl">
                  <p className="eyebrow !mb-4">Recomendaciones</p>
                  <ol className="space-y-3">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[10px] font-mono font-semibold text-white/35 w-5 shrink-0 pt-0.5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-[13px] text-white/75 leading-relaxed">{r}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <Disclosure label="Ver detalles técnicos de la verificación">
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-white/35">Hash prefix enviado</span>
                      <code className="text-white/75 font-mono bg-white/[0.04] px-2 py-0.5 rounded">{prefix}</code>
                    </div>
                    <pre className="text-[11px] font-mono text-white/45 bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 overflow-auto">
{JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </Disclosure>
              </motion.div>
            )}

            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card h-full min-h-[280px] rounded-2xl flex flex-col items-center justify-center gap-4 p-10"
              >
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center">
                  <ShieldCheck size={16} className="text-white/45" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] text-white/55 text-center max-w-xs leading-relaxed">
                  Introduce tu correo y pulsa Verificar para consultar `/api/citizen/check`.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}
