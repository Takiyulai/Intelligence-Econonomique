import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import { BellRing, CheckCheck, Clock, Inbox, Radar, Sparkles, Smartphone } from 'lucide-react'
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
// Scénario joué en boucle : 3 étapes abonné, pause sur la réception, puis la vue « visiteur à la découverte ».
const SCENES: { mode: Mode; etape: number; duree: number }[] = [
  { mode: 'abonne', etape: 0, duree: DUREE_ETAPE_MS },
  { mode: 'abonne', etape: 1, duree: DUREE_ETAPE_MS },
  { mode: 'abonne', etape: 2, duree: 5200 },
  { mode: 'gratuit', etape: 2, duree: 4200 },
]
const fmt = (n: number) => n.toFixed(2).replace('.', ',')

/** Section qui montre, en trois temps animés, ce que reçoit un abonné et ce que voit un visiteur à la découverte. */
export default function VotreVendredi() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { amount: 0.25 })
  const reduit = useReducedMotion()
  const [scene, setScene] = useState(0)

  // Le scénario se joue tout seul dès que la section est à l'écran, sans clic (y compris avec « animations réduites »,
  // où seuls les changements d'état restent, sans mouvement). Les boutons permettent juste de sauter à une vue.
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => setScene((n) => (n + 1) % SCENES.length), SCENES[scene].duree)
    return () => clearTimeout(t)
  }, [visible, scene])
  const { mode, etape: active } = SCENES[scene]
  const setMode = (m: Mode) => setScene(m === 'abonne' ? 0 : SCENES.length - 1)

  return (
    <section id="abonnes" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Abonnés Premium"
          titre="Votre vendredi, sans lever le petit doigt"
          texte="Nous collectons, analysons et vous envoyons l'essentiel. Vous n'avez qu'à lire et décider."
        />
        <div ref={ref} className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,460px)] lg:gap-16">
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
                        key={`${i}-${scene}`}
                        aria-hidden
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: SCENES[scene].duree / 1000, ease: 'linear' }}
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-brand to-accent"
                      />
                    )}
                  </li>
                </Reveal>
              )
            })}
          </ol>

          <Reveal delai={0.15} className="mx-auto w-full max-w-[460px]">
            <div role="group" aria-label="Point de vue" className="mx-auto mb-5 flex w-fit rounded-full bg-surface-2 p-1">
              {(
                [
                  ['abonne', 'Abonné Premium'],
                  ['gratuit', 'Visiteur à la découverte (0 €)'],
                ] as const
              ).map(([cle, label]) => (
                <button
                  key={cle}
                  type="button"
                  aria-pressed={mode === cle}
                  onClick={() => setMode(cle)}
                  className={`relative whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
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
            <div className="relative">
              <div className="lg:ml-auto lg:w-[300px]">
                <Telephone mode={mode} etape={active} />
              </div>
              <EmailRecu mode={mode} etape={active} />
            </div>
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

/** Aperçu du même bulletin reçu par e-mail, posé à côté du téléphone. */
function EmailRecu({ mode, etape }: { mode: Mode; etape: number }) {
  const serie = getSerieExemple('mangue')!
  const dernier = serie.points.at(-1)!
  const v = variation(serie)
  const recu = mode === 'abonne' && etape === etapes.length - 1

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative z-20 mx-auto mt-6 w-full max-w-[320px] lg:absolute lg:bottom-14 lg:-left-12 lg:mt-0 lg:w-[220px]"
    >
      <div className="overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-2xl shadow-black/15">
        <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
          <span className="flex gap-1">
            <span className="size-2 rounded-full bg-[#f87171]" />
            <span className="size-2 rounded-full bg-[#fbbf24]" />
            <span className="size-2 rounded-full bg-[#4ade80]" />
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
            <Inbox size={12} /> Boîte de réception
          </span>
          <AnimatePresence>
            {recu && (
              <motion.span
                key="nouveau"
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { delay: 0.9 } }}
                exit={{ scale: 0 }}
                className="ml-auto rounded-full bg-accent px-1.5 text-[10px] font-bold text-white"
              >
                1
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          {recu ? (
            <motion.div
              key="mail"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.9, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="p-3"
            >
              <div className="flex items-baseline justify-between gap-2 text-[11px]">
                <span className="font-bold">Baromètre IE</span>
                <span className="text-muted">08:00</span>
              </div>
              <p className="mt-0.5 text-xs font-semibold leading-snug">
                Baromètre mangue {dernier.semaine} : {fmt(dernier.prix)} €/kg ({v >= 0 ? '+' : ''}
                {v.toFixed(1).replace('.', ',')} %)
              </p>
              {/* Miniature du bulletin e-mail */}
              <div className="mt-2 overflow-hidden rounded-lg border border-line">
                <div className="bg-[#146c43] px-2.5 py-1.5 text-[10px] font-semibold text-white">
                  Mangue · prix grossiste · Rungis
                </div>
                <div className="space-y-1.5 p-2.5">
                  <p className="font-display text-lg leading-none font-bold">
                    {fmt(dernier.prix)} <span className="text-[10px] font-medium text-muted">€/kg</span>
                  </p>
                  <div className="rounded border-l-2 border-accent bg-accent-soft px-2 py-1.5">
                    <p className="text-[9px] font-bold uppercase text-muted">Lecture de la semaine</p>
                    <span className="mt-1 block h-1.5 w-full rounded bg-ink/15" />
                    <span className="mt-1 block h-1.5 w-4/5 rounded bg-ink/15" />
                  </div>
                  <span className="block h-1.5 w-3/5 rounded bg-line" />
                  <span className="block h-1.5 w-2/5 rounded bg-line" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="vide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-6 text-center text-xs text-muted"
            >
              {mode === 'gratuit' ? 'Aucun bulletin : réservé aux abonnés' : 'Le bulletin arrive à 8 h…'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
