import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'

const MAX = 8 // inclinaison maximale en degrés

/** Carte qui s'incline légèrement en suivant le pointeur (souris uniquement). */
export default function TiltCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduit = useReducedMotion()
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const eclat = useSpring(0, { stiffness: 200, damping: 30 })
  const ressort = { stiffness: 200, damping: 20 }
  const rotateX = useSpring(useTransform(y, [0, 1], [MAX, -MAX]), ressort)
  const rotateY = useSpring(useTransform(x, [0, 1], [-MAX, MAX]), ressort)
  const reflet = useTransform(
    [x, y] as const,
    ([px, py]: number[]) =>
      `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgb(255 255 255 / 0.14), transparent 55%)`,
  )

  const bouger = (e: PointerEvent<HTMLDivElement>) => {
    if (reduit || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    eclat.set(1)
    x.set((e.clientX - r.left) / r.width)
    y.set((e.clientY - r.top) / r.height)
  }
  const sortir = () => {
    eclat.set(0)
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <div style={{ perspective: 1000 }} className={className}>
      <motion.div
        onPointerMove={bouger}
        onPointerLeave={sortir}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative h-full rounded-3xl"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: reflet, opacity: eclat }}
          className="pointer-events-none absolute inset-0 rounded-3xl"
        />
      </motion.div>
    </div>
  )
}
