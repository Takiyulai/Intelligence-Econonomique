import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/** Apparition douce au défilement. */
export default function Reveal({
  children,
  delai = 0,
  className,
}: {
  children: ReactNode
  delai?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: delai, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
