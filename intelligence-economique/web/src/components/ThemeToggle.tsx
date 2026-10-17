import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function ThemeToggle() {
  const { theme, basculer } = useTheme()
  const sombre = theme === 'dark'
  return (
    <motion.button
      type="button"
      onClick={basculer}
      whileTap={{ scale: 0.9 }}
      aria-label={sombre ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-line bg-surface text-ink transition-colors hover:border-brand/50"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {sombre ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
