import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { BellRing, CheckCheck, Clock, Radar, Sparkles, Smartphone } from 'lucide-react'
import EnTeteSection from './EnTeteSection'
import Reveal from './Reveal'
import { getSerieExemple, variation } from '../services/marketData'

type Mode = 'abonne' | 'gratuit'

const etapes = [
  {
    heure: 'Chaque semaine',
    icone: Radar,
    titre: 'Nous relevons les prix',
    texte: "Rungis, Rotterdam et les statistiques d'importation, produit par produit.",
  },
  {
    heure: 'Vendredi matin',
    icone: Sparkles,
    titre: 'Nous les analysons',
    texte: "Moyennes calculées, tendance lue par l'IA, conseil d'expédition rédigé.",
  },
  {
    heure: 'Vendredi 8 h',
    icone: Smartphone,
    titre: "Vous recevez l'essentiel",
    texte: 'Sur WhatsApp et par e-mail. Rien à installer, aucun mot de passe.',
  },
]

const DUREE_ETAPE_MS = 2600
const fmt = (n: number) => n.toFixed(2).replace('.', ',')

/** Section qui montre, en trois temps animés, ce que reçoit un abonné et ce que voit un visiteur gratuit. */
export default function VotreVendredi() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { margin: '-120px' })
  const reduit = useReducedMotion()
  const [etape, setEtape] = useState(0)
  const [mode, setMode] = useState<Mode>('abonne')

  // Les étapes défilent seules tant que la section est à l'écran ; la dernière reste affichée un peu plus longtemps.
  useEffect(() => {
    if (!visible || reduit) return
    const t = setTimeout(() => setEtape((e) => (e + 1) % (etapes.length + 1)), DUREE_ETAPE_MS)
    return () => clearTimeout(t)
  }, [visible, reduit, etape])
  const active = reduit ? etapes.length - 1 : Math.min(etape, etapes.length - 1)

  return (
    <section id="abonnes" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Abonnés Premium"
          titre="Votre vendredi, sans lever le petit doigt"
          texte="Nous collectons, analysons et vous envoyons l'essentiel. Vous n'avez qu'à lire et décider."
        />
        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,380px)] lg:gap-16">
          <ol className="relative space-y-4">
            {etapes.map((e, i) => {
              const faite = i < active
              const enCours = i === active
              return (
                <Reveal key={e.titre} delai={i * 0.08}>
                  <li
                    className={`relative flex gap-4 overflow-hidden rounded-2xl border p-5 transition-colors duration-500 ${
                      enCours ? 'border-brand/50 bg-surface shadow-xl shadow-brand/10' : 'border-line bg-surface/60'
                    }`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-500 ${
                        enCours || faite ? 'bg-brand text-white dark:text-[#06210f]' : 'bg-surface-2 text-muted'
                      }`}
                    >
                      <e.icone size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
                        <Clock size={12} /> {e.heure}
                      </p>
                      <p className="mt-1 font-display text-lg font-bold">{e.titre}</p>
                      <p className="mt-0.5 text-sm text-muted">{e.texte}</p>
                    </div>
                    {/* Barre de progression de l'étape en cours */}
                    {enCours && !reduit && (
                      <motion.span
                        key={`${i}-${etape}`}
                        aria-hidden
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: DUREE_ETAPE_MS / 1000, ease: 'linear' }}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-brand to-accent"
                      />
                    )}
                  </li>
                </Reveal>
              )
            })}
          </ol>

          <Reveal delai={0.15} className="mx-auto w-full max-w-[380px]">
            <div role="group" aria-label="Point de vue" className="mx-auto mb-5 flex w-fit rounded-full bg-surface-2 p-1">
              {(
                [
                  ['abonne', 'Abonné Premium'],
                  ['gratuit', 'Visiteur gratuit'],
                ] as const
              ).map(([cle, label]) => (
                <button
                  key={cle}
                  type="button"
                  aria-pressed={mode === cle}
                  onClick={() => setMode(cle)}
                  className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    mode === cle ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {mode === cle && (
                    <motion.span
                      layoutId="mode-vendredi"
                      className="absolute inset-0 rounded-full bg-surface shadow"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
            <Telephone mode={mode} etape={active} />
            <p className="mt-4 text-center text-xs text-muted">Illustration avec des données d'exemple.</p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Telephone({ mode, etape }: { mode: Mode; etape: number }) {
  const serie = getSerieExemple('mangue')!
  const pts = serie.points
  const dernier = pts.at(-1)!
  const ancien = pts.at(-5)!
  const v = variation(serie)
  const recu = mode === 'abonne' && etape === etapes.length - 1

  return (
    <motion.div
      animate={recu ? { rotate: [0, -2, 2, -1.5, 1.5, 0] } : { rotate: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto aspect-[9/16] w-full max-w-[300px] rounded-[2.6rem] border-[6px] border-[#16231c] bg-[#16231c] shadow-2xl shadow-black/25"
    >
      <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#16231c]" />
      <div className="flex h-full flex-col overflow-hidden rounded-[2.1rem] bg-[#efe9df] dark:bg-[#0d1712]">
        <div className="flex items-center gap-2.5 bg-[#146c43] px-4 pt-9 pb-3 text-white">
          <span className="grid size-8 place-items-center rounded-full bg-white/20 text-xs font-bold">IE</span>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold">Baromètre IE · Abonnés</p>
            <p className="text-[11px] text-white/70">
              {mode === 'abonne' && etape === 1 ? "en train d'écrire…" : 'groupe privé'}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-end gap-2 p-3 text-left text-[13px] leading-snug text-[#111b21]">
          <AnimatePresence mode="popLayout">
            {mode === 'abonne' ? (
              <>
                <Bulle key="jour" systeme>
                  Vendredi
                </Bulle>
                {etape === 1 && (
                  <Bulle key="ecrit">
                    <span className="flex gap-1 py-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="size-1.5 rounded-full bg-[#667781]"
                        />
                      ))}
                    </span>
                  </Bulle>
                )}
                {etape === 2 && (
                  <>
                    <Bulle key="prix" heure="08:00" lu>
                      <p className="font-bold">Baromètre mangue · {dernier.semaine}</p>
                      <p>
                        Rungis : <b>{fmt(dernier.prix)} €/kg</b>{' '}
                        <span className="font-semibold text-[#146c43]">
                          ({v >= 0 ? '+' : ''}
                          {v.toFixed(1).replace('.', ',')} %)
                        </span>
                      </p>
                      <p className="mt-1">
                        <b>Conseil :</b> prix au-dessus de la moyenne des 10 dernières semaines, expédiez cette semaine
                        si vos volumes sont prêts.
                      </p>
                    </Bulle>
                    <Bulle key="alerte" heure="08:01" lu delai={0.5}>
                      <p className="flex items-center gap-1.5 font-bold text-[#c2410c]">
                        <BellRing size={13} /> Alerte normes
                      </p>
                      <p>Nouvelle limite de résidus publiée : vérifiez vos traitements avant le prochain lot.</p>
                    </Bulle>
                  </>
                )}
              </>
            ) : (
              <>
                <Bulle key="vide" systeme>
                  Aucun message cette semaine
                </Bulle>
                <Bulle key="site" delai={0.15}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#667781]">Sur le site public</p>
                  <p className="mt-0.5">
                    Mangue {ancien.semaine} : <b>{fmt(ancien.prix)} €/kg</b>
                  </p>
                  <p className="text-[#667781]">Prix d'il y a 4 semaines, sans conseil d'expédition.</p>
                </Bulle>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function Bulle({
  children,
  systeme = false,
  heure,
  lu = false,
  delai = 0,
}: {
  children: ReactNode
  systeme?: boolean
  heure?: string
  lu?: boolean
  delai?: number
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, delay: delai, ease: [0.22, 1, 0.36, 1] }}
      className={
        systeme
          ? 'self-center rounded-lg bg-white/80 px-2.5 py-1 text-[11px] text-[#54656f] shadow-sm'
          : 'max-w-[88%] self-start rounded-xl rounded-tl-sm bg-white px-3 py-2 shadow-sm'
      }
    >
      {children}
      {heure && (
        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#667781]">
          {heure}
          {lu && <CheckCheck size={14} className="text-[#53bdeb]" />}
        </span>
      )}
    </motion.div>
  )
}
