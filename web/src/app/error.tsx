'use client'

export default function RootPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-white/85 text-[15px] font-medium">Algo falló al cargar esta página.</p>
      <p className="text-white/40 text-[13px] max-w-lg leading-relaxed">
        Ejecutá <code className="text-white/50 font-mono text-[12px]">npm run dev</code> dentro de la carpeta{' '}
        <code className="text-white/50 font-mono text-[12px]">web</code> y revisá lo que imprime la terminal al abrir{' '}
        <code className="text-white/50 font-mono text-[12px]">http://localhost:3000</code>
        {' — '}ahí aparece la causa técnica (no suele estar en la pantalla del navegador).
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2.5 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90"
        >
          Reintentar
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2.5 rounded-xl border border-white/[0.12] text-white/70 text-[13px] font-medium hover:bg-white/[0.05]"
        >
          Ir al dashboard
        </a>
      </div>
      {process.env.NODE_ENV === 'development' && error?.message ? (
        <pre className="mt-6 max-w-2xl w-full overflow-auto rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-left text-[11px] font-mono text-white/35">
          {error.message}
        </pre>
      ) : null}
    </div>
  )
}
