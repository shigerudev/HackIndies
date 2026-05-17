'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, DollarSign, Tag, Loader2, Search } from 'lucide-react'
import { fetchPlaybook, searchPlaybooks, type Playbook } from '@/services/api/client'
import { cn } from '@/lib/utils'

/**
 * Sintéticos: sin Supabase el backend filtra estos términos contra `MOCK_PLAYBOOKS`
 * (`backend/src/data/mock.ts`). Con Supabase, los resultados pueden variar según tus datos.
 */
const DEMO_SEARCH_EXAMPLES = [
  { hint: 'Credenciales / rotación', query: 'credenciales' },
  { hint: 'Infostealer', query: 'infostealer' },
  { hint: 'MFA y endurecimiento', query: 'mfa' },
  { hint: 'CSP / cabeceras HTTP', query: 'csp' },
  { hint: 'API y límites de uso', query: 'rate' },
  { hint: 'Comunicar un incidente', query: 'comunicación' },
] as const

/** Slugs del mismo conjunto sintético; conviven con seed cuando hay tabla `playbooks`. */
const DEMO_SLUG_EXAMPLES = [
  { hint: 'Rotación masiva de credenciales', slug: 'rotate-credentials' },
  { hint: 'Habilitar 2FA legacy', slug: 'enable-2fa' },
  { hint: 'CSP y headers', slug: 'csp-headers' },
  { hint: 'Rate limiting en APIs', slug: 'api-rate-limit' },
  { hint: 'Comunicación a ciudadanos', slug: 'incident-comms' },
  { hint: 'Checklist compromiso por infostealer', slug: 'stealer-response' },
] as const

/** Minimal markdown renderer for headings, lists, bold — enough for body_md */
function renderMarkdown(md: string) {
  const lines = md.split('\n')
  const blocks: React.ReactNode[] = []
  let listBuf: string[] = []

  const flushList = () => {
    if (listBuf.length === 0) return
    blocks.push(
      <ol key={`l-${blocks.length}`} className="space-y-2 my-3 ml-1">
        {listBuf.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[13px] text-white/75 leading-relaxed">
            <span className="text-[10px] font-mono font-semibold text-white/30 w-5 shrink-0 pt-1">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="text-white/90 font-semibold">$1</strong>'
                ),
              }}
            />
          </li>
        ))}
      </ol>
    )
    listBuf = []
  }

  lines.forEach((line, i) => {
    const numbered = line.match(/^\s*\d+\.\s+(.+)/)
    const headerL2 = line.match(/^##\s+(.+)/)
    const headerL1 = line.match(/^#\s+(.+)/)

    if (numbered) {
      listBuf.push(numbered[1])
    } else if (headerL2) {
      flushList()
      blocks.push(
        <h4 key={i} className="text-[13px] font-semibold text-white/90 tracking-tight mt-5 mb-2">
          {headerL2[1]}
        </h4>
      )
    } else if (headerL1) {
      flushList()
      blocks.push(
        <h3 key={i} className="text-[15px] font-semibold text-white tracking-tight mt-5 mb-2">
          {headerL1[1]}
        </h3>
      )
    } else if (line.trim()) {
      flushList()
      blocks.push(
        <p
          key={i}
          className="text-[13px] text-white/65 leading-relaxed my-2"
          dangerouslySetInnerHTML={{
            __html: line.replace(
              /\*\*(.+?)\*\*/g,
              '<strong class="text-white/90 font-semibold">$1</strong>'
            ),
          }}
        />
      )
    }
  })
  flushList()
  return blocks
}

export default function PlaybookExplorer() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const slugInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'fts' | 'vector' | 'auto'>('auto')
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Playbook[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  const [slugInput, setSlugInput] = useState('')
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [detail, setDetail] = useState<Playbook | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const runSearch = useCallback(async (overrideQuery?: string, searchMode?: typeof mode) => {
    const raw = overrideQuery !== undefined ? overrideQuery : query
    const trimmed = raw.trim()
    if (!trimmed) {
      setHits([])
      setSearchError('Escribí palabras en el cuadro de búsqueda (ej.: «credenciales»).')
      return
    }
    setSearching(true)
    setSearchError(null)
    const effectiveMode = searchMode ?? mode
    try {
      const { data } = await searchPlaybooks(trimmed, effectiveMode)
      setHits(Array.isArray(data) ? data : [])
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : 'No pudimos obtener resultados. Comprobá que el backend esté en marcha.'
      )
      setHits([])
    } finally {
      setSearching(false)
    }
  }, [query, mode])

  const loadBySlug = useCallback(async (slug: string) => {
    const trimmed = slug.trim()
    if (!trimmed) {
      setDetailError('Slug vacío.')
      setDetail(null)
      return
    }
    setLoadingDetail(true)
    setDetailError(null)
    setSelectedSlug(trimmed)
    try {
      const { data } = await fetchPlaybook(trimmed)
      setDetail(data)
    } catch (err) {
      setDetail(null)
      setDetailError(err instanceof Error ? err.message : 'No se pudo cargar el playbook')
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  return (
    <motion.section
      id="playbooks"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring' as const, stiffness: 280, damping: 28 }}
      className="section-pad border-b border-white/[0.06]"
    >
      <div className="mb-10 max-w-2xl">
        <p className="eyebrow">Biblioteca</p>
        <h2 className="text-[26px] font-semibold tracking-tight text-white leading-tight">
          Playbooks de respuesta —{' '}
          <span className="serif-accent text-white/50">vía API</span>
        </h2>
        <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
          Búsqueda en <span className="font-mono text-white/55">GET /api/playbooks/search?q=</span> y
          carga del cuerpo con <span className="font-mono text-white/55">GET /api/playbooks/:slug</span>.
          Sin catálogo fijo en el front: solo lo que responda tu backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-5 space-y-5">
          <div className="card p-5 rounded-2xl space-y-3">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30">Buscar</p>
            <div className="flex gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void runSearch()}
                placeholder="ej. infostealer, credenciales, MFA…"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-white/[0.2]"
              />
              <button
                type="button"
                onClick={() => void runSearch()}
                disabled={searching}
                className="inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-white text-black text-[12px] font-semibold hover:bg-white/92 disabled:opacity-40 shrink-0"
              >
                {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>
            {/* FTS / Vector / Auto mode tabs */}
            <div className="flex gap-1 mt-2">
              {(['fts', 'vector', 'auto'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    if (query.trim()) void runSearch(query)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                    mode === m
                      ? 'bg-white/10 text-white border-white/[0.15]'
                      : 'text-white/35 hover:text-white/60 border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
              {hits.length > 0 && (
                <span className="ml-2 text-[10px] text-white/25 font-mono self-center">
                  modo: {mode}
                </span>
              )}
            </div>
            {searchError && <p className="text-[12px] text-white/45">{searchError}</p>}
            {!searching && hits.length === 0 && query.trim() && !searchError && (
              <p className="text-[12px] text-white/35">Sin resultados para esta consulta.</p>
            )}
            {hits.length > 0 && (
              <div className="space-y-1.5 pt-2 max-h-[340px] overflow-y-auto border-t border-white/[0.06]">
                <p className="text-[9.5px] font-bold tracking-[0.16em] uppercase text-white/25 py-2">
                  Resultados · {hits.length}
                </p>
                {hits.map((hit) => (
                  <button
                    key={`${hit.slug}-${hit.title_es}`}
                    type="button"
                    onClick={() => loadBySlug(hit.slug)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all border',
                      selectedSlug === hit.slug
                        ? 'bg-white/[0.07] border-white/[0.12]'
                        : 'border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                    )}
                  >
                    <p className="text-[12.5px] text-white/85 leading-snug font-medium">{hit.title_es}</p>
                    <p className="text-[10.5px] font-mono text-white/35 mt-1">{hit.slug}</p>
                  </button>
                ))}
              </div>
            )}
            <div className="pt-3 border-t border-white/[0.06]" aria-labelledby="playbooks-search-demo-heading">
              <p id="playbooks-search-demo-heading" className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/28 mb-2.5">
                Ejemplos de búsqueda (sintéticos / demo típico)
              </p>
              <ul className="flex flex-col gap-1.5">
                {DEMO_SEARCH_EXAMPLES.map(({ hint, query: q }) => (
                  <li key={q}>
                    <button
                      type="button"
                      disabled={searching}
                      onClick={() => {
                        setQuery(q)
                        void runSearch(q)
                        queueMicrotask(() => searchInputRef.current?.focus())
                      }}
                      aria-label={`Buscar ejemplo: ${q}`}
                      className="w-full text-left rounded-xl px-3.5 py-2.5 bg-white/[0.025] hover:bg-white/[0.055] disabled:opacity-40 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                    >
                      <span className="block text-[10px] text-white/35 mb-0.5">{hint}</span>
                      <span className="block font-mono text-[11.5px] tracking-tight text-white/55">{q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-5 rounded-2xl space-y-3">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30">
              Por slug conocido
            </p>
            <div className="flex gap-2">
              <input
                ref={slugInputRef}
                type="text"
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void loadBySlug(slugInput)}
                placeholder="slug del playbook"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[13px] text-white font-mono placeholder:text-white/25 focus:outline-none focus:border-white/[0.2]"
              />
              <button
                type="button"
                onClick={() => void loadBySlug(slugInput)}
                disabled={loadingDetail}
                className="px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-[12px] font-medium text-white/85 hover:bg-white/[0.1] shrink-0"
              >
                Cargar
              </button>
            </div>
            <div className="pt-3 border-t border-white/[0.06]" aria-labelledby="playbooks-slug-demo-heading">
              <p id="playbooks-slug-demo-heading" className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white/28 mb-2.5">
                Ejemplos de slug (sintéticos / demo típico)
              </p>
              <ul className="flex flex-col gap-1.5">
                {DEMO_SLUG_EXAMPLES.map(({ hint, slug }) => (
                  <li key={slug}>
                    <button
                      type="button"
                      disabled={loadingDetail}
                      onClick={() => {
                        setSlugInput(slug)
                        void loadBySlug(slug)
                        queueMicrotask(() => slugInputRef.current?.focus())
                      }}
                      aria-label={`Cargar playbook por slug: ${slug}`}
                      className="w-full text-left rounded-xl px-3.5 py-2.5 bg-white/[0.025] hover:bg-white/[0.055] disabled:opacity-40 border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                    >
                      <span className="block text-[10px] text-white/35 mb-0.5">{hint}</span>
                      <span className="block font-mono text-[11.5px] tracking-tight text-white/55">{slug}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-7">
          <div className="card rounded-2xl min-h-[420px]">
            {loadingDetail ? (
              <div className="p-8 space-y-3">
                <div className="skeleton h-6 w-2/3 rounded-lg" />
                <div className="skeleton h-3 w-1/3 rounded-lg" />
                <div className="space-y-2 pt-3">
                  <div className="skeleton h-3 w-full rounded-lg" />
                  <div className="skeleton h-3 w-11/12 rounded-lg" />
                </div>
              </div>
            ) : detail ? (
              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-white/[0.06]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-white/30 mb-2">
                      Playbook
                    </p>
                    <h3 className="text-[20px] font-semibold tracking-tight text-white leading-tight">
                      {detail.title_es}
                    </h3>
                    <p className="text-[11px] font-mono text-white/35 mt-2">{detail.slug}</p>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} strokeWidth={1.5} className="text-white/35" />
                      <span className="text-[12px] text-white/65 font-medium">
                        {detail.effort_hours}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={11} strokeWidth={1.5} className="text-white/35" />
                      <span className="text-[12px] text-white/65 font-medium">
                        {detail.cost_estimate_usd === 0 ? 'Gratis' : `$${detail.cost_estimate_usd}`}
                      </span>
                    </div>
                  </div>
                </div>

                {detail.tags?.length > 0 && (
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Tag size={10} strokeWidth={1.5} className="text-white/30" />
                    {detail.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono uppercase tracking-[0.1em] text-white/45 px-2 py-0.5 rounded border border-white/[0.07]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="prose prose-invert max-w-none">{renderMarkdown(detail.body_md)}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[420px] gap-3 p-10 text-center">
                <BookOpen size={20} strokeWidth={1.5} className="text-white/30" />
                <p className="text-[13px] text-white/55 max-w-md">
                  {detailError ??
                    'Busca por texto o introduce un slug. El contenido aparecerá cuando el backend devuelva un playbook válido.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
