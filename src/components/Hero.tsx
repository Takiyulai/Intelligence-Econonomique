import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, BellRing, Ship, TrendingUp } from 'lucide-react'
import TiltCard from './TiltCard'
import StatutDonnees from './StatutDonnees'
import { getSerieExemple, getSeriePrix, variation } from '../services/marketData'
import type { SeriePrix } from '../data/types'

// Courbe de tendance tracée à l'échelle : même échelle pour la ligne, le point final et les repères min/max.
const L = 320
const H = 120
const MARGE = 10

function Tendance({ serie }: { serie: SeriePrix }) {
  const pts = serie.points.slice(-8)
  const prix = pts.map((p) => p.prix)
  const min = Math.min(...prix)
  const max = Math.max(...prix)
  const ecart = max - min || 1
  const x = (i: number) => MARGE + (i * (L - 2 * MARGE)) / Math.max(pts.length - 1, 1)
  const y = (v: number) => MARGE + (1 - (v - min) / ecart) * (H - 2 * MARGE)
  const ligne = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.prix).toFixed(1)}`).join(' ')
  const aire = `${ligne} L${x(pts.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`
  const fin = pts.length - 1

  return (
    <figure className="mt-6" style={{ transform: 'translateZ(30px)' }}>
      <div className="relative">
        <svg viewBox={`0 0 ${L} ${H}`} className="h-32 w-full overflow-visible" role="img"
          aria-label={`Prix de la mangue sur ${pts.length} semaines, de ${min.toFixed(2)} à ${max.toFixed(2)} ${serie.unite}`}>
          <defs>
            <linearGradient id="hero-aire" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {[min, max].map((v) => (
            <line key={v} x1={0} x2={L} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray="3 5" />
          ))}
          <motion.path d={aire} fill="url(#hero-aire)" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }} />
          <motion.path d={ligne} fill="none" stroke="var(--brand)" strokeWidth={2.5} strokeLinecap="round"
            strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 1.1, ease: 'easeInOut' }} />
          <motion.circle cx={x(fin)} cy={y(pts[fin].prix)} r={5} fill="var(--accent)" stroke="var(--surface)"
            strokeWidth={2.5} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4 }} />
        </svg>
        <span className="pointer-events-none absolute left-0 top-0 -translate-y-full text-[11px] tabular-nums text-muted">
          max {max.toFixed(2)}
        </span>
        <span className="pointer-events-none absolute bottom-0 left-0 translate-y-full text-[11px] tabular-nums text-muted">
          min {min.toFixed(2)}
        </span>
      </div>
      <figcaption className="mt-5 flex justify-between text-[11px] text-muted">
        <span>{pts[0].semaine}</span>
        <span>{pts[fin].semaine}</span>
      </figcaption>
    </figure>
  )
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Parallaxe : chaque couche défile à sa propre vitesse.
  const yFond = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const yTexte = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const yCarte = useTransform(scrollYProgress, [0, 1], ['0%', '-10%'])
  const opacite = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const [mangue, setMangue] = useState<SeriePrix>(() => getSerieExemple('mangue')!)
  useEffect(() => {
    getSeriePrix('mangue').then((s) => s && setMangue(s))
  }, [])
  const v = variation(mangue)

  return (
    <section ref={ref} className="grain relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <motion.div aria-hidden style={{ y: yFond }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute top-40 -right-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </motion.div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div style={{ y: yTexte, opacity: opacite }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-sm text-muted backdrop-blur"
          >
            <span className="size-2 animate-pulse rounded-full bg-brand" />
            Corridor Afrique de l'Ouest → Europe
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Vendez vos fruits et légumes <span className="text-brand">au juste prix</span> en Europe.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6 max-w-xl text-lg text-muted text-pretty"
          >
            Prix des marchés européens, tendances d'importation et alertes sur les normes, traduits en décisions
            simples pour les exportateurs, coopératives et PME d'Afrique de l'Ouest.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a
              href="#rejoindre"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30 active:translate-y-0 dark:text-[#06210f]"
            >
              Recevoir le bulletin
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#barometre"
              className="inline-flex items-center rounded-full border border-line bg-surface px-6 py-3 font-semibold transition-colors hover:border-brand/50"
            >
              Voir le baromètre
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: yCarte }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <TiltCard>
            <div className="rounded-3xl border border-line bg-surface/90 p-6 shadow-2xl shadow-black/10 backdrop-blur dark:shadow-black/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted">Mangue · prix grossiste · {mangue.marche}</p>
                  <p className="mt-1 font-display text-4xl font-bold tabular-nums">
                    {mangue.points.at(-1)!.prix.toFixed(2)}
                    <span className="ml-1 text-lg font-medium text-muted">{mangue.unite}</span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                    v >= 0 ? 'bg-brand-soft text-brand' : 'bg-accent-soft text-danger'
                  }`}
                >
                  <TrendingUp size={14} className={v < 0 ? 'rotate-180' : ''} />
                  {v >= 0 ? '+' : ''}
                  {v.toFixed(1)} %
                </span>
              </div>
              <Tendance key={String(mangue.exemple)} serie={mangue} />
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <StatutDonnees serie={mangue} />
                <span className="text-xs text-muted">Mise à jour chaque vendredi</span>
              </div>
            </div>
          </TiltCard>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-4 -bottom-14 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-xl sm:flex"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
              <BellRing size={18} />
            </span>
            <div className="text-sm">
              <p className="font-semibold">Alerte normes</p>
              <p className="text-muted">LMR mise à jour</p>
            </div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -top-16 right-4 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-xl sm:flex"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-brand">
              <Ship size={18} />
            </span>
            <p className="text-sm font-semibold">Abidjan → Rotterdam</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
