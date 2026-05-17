'use client'

interface StatusPillProps {
  state: 'online' | 'degraded' | 'offline' | 'loading'
  label: string
}

const STATE_STYLES: Record<StatusPillProps['state'], { dot: string; pulse: boolean }> = {
  online:   { dot: 'dot-ok',     pulse: true  },
  degraded: { dot: 'dot-warn',   pulse: true  },
  offline:  { dot: 'dot-down',   pulse: false },
  loading:  { dot: 'dot-info',   pulse: true  },
}

export function StatusPill({ state, label }: StatusPillProps) {
  const style = STATE_STYLES[state]
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass">
      <span className={`dot ${style.dot} ${style.pulse ? 'pulse-dot' : ''}`} />
      <span className="text-[11px] font-medium text-white/65 tracking-wide">{label}</span>
    </div>
  )
}