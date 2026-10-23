import { motion } from 'motion/react'
import { ArrowRight, Lock, Sparkles } from 'lucide-react'
import BadgeExemple from './BadgeExemple'
import { extraitPublic } from '../services/marketData'
import type { SeriePrix } from '../data/types'

const mots = {
  cache: { opacity: 0, y: 6, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

/**
 * Commentaire IA de la semaine mis en vedette : la première phrase est publique,
 * la suite (analyse complète + conseil) est réservée aux abonnés et n'est jamais envoyée au navigateur.
 */
export default function LectureSemaine({ serie }: { serie: SeriePrix }) {
  const extrait = extraitPublic(serie)
  if (!extrait) return null
  const semaine = serie.points.at(-1)?.semaine

  return (
    <motion.figure
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-8 overflow-hidden rounded-3xl p-[1.5px] shadow-xl shadow-brand/10"
    >
      {/* Liseré dégradé qui tourne lentement autour de la carte */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'conic-gradient(from 0deg, var(--brand), var(--accent), transparent 40%, transparent 60%, var(--brand))',
        }}
      />
      <div className="relative rounded-[calc(1.5rem-1.5px)] bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <figcaption className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent text-white shadow-lg shadow-brand/25 dark:text-[#06210f]">
              <Sparkles size={20} />
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-tight">Lecture de la semaine</span>
              <span className="text-xs text-muted">
                {semaine ? `Semaine ${semaine.slice(1)} · ` : ''}rédigée par IA à partir des cotations
              </span>
            </span>
          </figcaption>
          {serie.exemple && <BadgeExemple />}
        </div>

        <motion.blockquote
          initial="cache"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.035, delayChildren: 0.2 }}
          className="mt-5 font-display text-xl leading-snug font-semibold text-pretty sm:text-2xl"
        >
          {extrait.split(' ').map((m, i) => (
            <motion.span key={i} variants={mots} className="inline-block">
              {m}&nbsp;
            </motion.span>
          ))}
        </motion.blockquote>

        {/* Suite floutée : texte générique, le vrai commentaire complet n'est envoyé qu'aux abonnés */}
        <div className="relative mt-3">
          <p aria-hidden className="select-none text-muted blur-[5px]">
            Comparaison avec la moyenne des douze dernières semaines, lecture des volumes importés et conseil
            précis pour votre prochaine expédition, chaque vendredi.
          </p>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Lock size={15} className="shrink-0 text-accent" />
            Analyse complète et conseil d'expédition réservés aux abonnés Premium.
          </p>
          <a
            href="#offres"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 dark:text-[#06210f]"
          >
            Lire l'analyse complète
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </motion.figure>
  )
}
