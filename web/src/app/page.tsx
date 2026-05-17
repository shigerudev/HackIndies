'use client'

import dynamic from 'next/dynamic'

const LandingPage = dynamic(() => import('@/components/landing/LandingPage'), {
  loading: () => (
    <div
      className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"
      aria-busy="true"
      aria-label="Cargando página de inicio"
    >
      <p className="text-[13px] text-white/35">Cargando…</p>
    </div>
  ),
  ssr: false,
})

export default function HomePage() {
  return <LandingPage />
}
