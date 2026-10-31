import type { ReactNode } from 'react'
import { motion } from 'motion/react'

/** Carte du tableau de bord, avec une entrée douce. */
export default function Carte({
  titre,
  action,
  children,
  className = '',
}: {
  titre?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      {(titre || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {titre && <h2 className="font-display text-lg font-bold">{titre}</h2>}
          {action}
        </div>
      )}
      {children}
    </motion.section>
  )
}
