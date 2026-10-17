import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const liens = [
  { href: '#piliers', label: 'Le service' },
  { href: '#barometre', label: 'Baromètre' },
  { href: '#alertes', label: 'Alertes' },
  { href: '#offres', label: 'Offres' },
]

export default function Navbar() {
  const { scrollY } = useScroll()
  const [defile, setDefile] = useState(false)
  const [ouvert, setOuvert] = useState(false)
  useMotionValueEvent(scrollY, 'change', (v) => setDefile(v > 12))

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        defile ? 'border-b border-line/70 bg-bg/75 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {liens.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#rejoindre"
            className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:inline-block"
          >
            Rejoindre le pilote
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line md:hidden"
            onClick={() => setOuvert((o) => !o)}
            aria-expanded={ouvert}
            aria-label="Menu"
          >
            {ouvert ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {ouvert && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-4 mb-3 rounded-2xl border border-line bg-surface p-2 shadow-xl md:hidden"
          >
            {[...liens, { href: '#rejoindre', label: 'Rejoindre le pilote' }].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOuvert(false)}
                  className="block rounded-xl px-4 py-3 font-medium hover:bg-surface-2"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
