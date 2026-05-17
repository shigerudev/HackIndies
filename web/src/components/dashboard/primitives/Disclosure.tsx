'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface DisclosureProps {
  label: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

/**
 * Hides technical detail behind a calm, on-brand "Ver detalles" toggle.
 * Used to keep the surface humanized without losing power-user depth.
 */
export function Disclosure({ label, children, defaultOpen = false, className }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      <button
        onClick={() => setOpen(!open)}
        className="group flex items-center gap-2 text-[11px] font-medium text-white/35 hover:text-white/70 transition-colors"
      >
        <ChevronDown
          size={11}
          strokeWidth={1.8}
          className={`transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
        />
        <span className="tracking-wide">{label}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
