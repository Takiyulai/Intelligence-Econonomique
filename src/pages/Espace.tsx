import { useCallback, useEffect, useState } from 'react'
import { MotionConfig, motion } from 'motion/react'
import { BellRing, CreditCard, FileText, LayoutDashboard, LineChart, LoaderCircle, LogOut, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import PastilleStatut from '../components/espace/PastilleStatut'
import VueEnsemble from '../components/espace/VueEnsemble'
import PrixMembre from '../components/espace/PrixMembre'
import ConformiteMembre from '../components/espace/ConformiteMembre'
import BulletinsMembre from '../components/espace/BulletinsMembre'
import AbonnementMembre from '../components/espace/AbonnementMembre'
import ProfilMembre from '../components/espace/ProfilMembre'
import type { Onglet } from '../components/espace/types'
import { deconnecter, espaceBranche, lireMembre, lireSession, lireTableau, surChangementSession } from '../services/espace'
import type { Membre, Tableau } from '../services/espace'

const onglets: { cle: Onglet; label: string; icone: LucideIcon }[] = [
  { cle: 'apercu', label: "Vue d'ensemble", icone: LayoutDashboard },
  { cle: 'prix', label: 'Prix', icone: LineChart },
  { cle: 'conformite', label: 'Conformité', icone: BellRing },
  { cle: 'bulletins', label: 'Bulletins', icone: FileText },
  { cle: 'abonnement', label: 'Abonnement', icone: CreditCard },
  { cle: 'profil', label: 'Profil', icone: UserRound },
]
const titres: Record<Onglet, string> = {
  apercu: "Vue d'ensemble",
  prix: 'Prix de la mangue',
  conformite: 'Conformité UE',
  bulletins: 'Bulletins',
  abonnement: 'Abonnement',
  profil: 'Profil',
}

/** Onglet lu dans l'adresse (#prix…), en ignorant le fragment de connexion laissé par le lien magique. */
const ongletDeLAdresse = (): Onglet => {
  const h = window.location.hash.slice(1)
  return onglets.some((o) => o.cle === h) ? (h as Onglet) : 'apercu'
}

export default function Espace() {
  const [pret, setPret] = useState(!espaceBranche)
  const [membre, setMembre] = useState<Membre>()
  const [tableau, setTableau] = useState<Tableau>()
  const [erreur, setErreur] = useState('')
  const [onglet, setOnglet] = useState<Onglet>(ongletDeLAdresse)

  // Sans session : vers la page de connexion (en gardant un éventuel message d'erreur du lien).
  useEffect(() => {
    document.title = 'Mon espace · AgroCorridor'
    if (!espaceBranche) return
    let actif = true
    lireSession().then((s) => {
      if (!actif) return
      if (!s) window.location.replace(`/connexion${window.location.hash.includes('error') ? window.location.hash : ''}`)
      else setPret(true)
    })
    const fin = surChangementSession((s) => !s && window.location.replace('/connexion'))
    return () => {
      actif = false
      fin()
    }
  }, [])

  const charger = useCallback(() => {
    setErreur('')
    Promise.all([lireMembre(), lireTableau()])
      .then(([m, t]) => {
        setMembre(m)
        setTableau(t)
      })
      .catch(() => setErreur("Impossible de charger votre espace pour l'instant."))
  }, [])
  useEffect(() => {
    if (pret) charger()
  }, [pret, charger])

  const aller = (o: Onglet) => {
    setOnglet(o)
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${o}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortir = async () => {
    await deconnecter()
    window.location.assign(espaceBranche ? '/connexion' : '/')
  }

  if (!membre || !tableau) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        {erreur ? (
          <div>
            <p className="text-muted">{erreur}</p>
            <button onClick={charger} className="mt-4 rounded-full bg-brand px-5 py-2.5 font-semibold text-white dark:text-[#06210f]">
              Réessayer
            </button>
          </div>
        ) : (
          <LoaderCircle className="animate-spin text-brand motion-reduce:animate-none" aria-label="Chargement" />
        )}
      </div>
    )
  }

  const premiumDemo = new URLSearchParams(window.location.search).get('demo') === 'premium'

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
        {/* Barre latérale (ordinateur) */}
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
          <div className="px-2">
            <Logo />
          </div>
          <nav aria-label="Espace membre" className="mt-8 flex-1">
            <ul className="space-y-1">
              {onglets.map((o) => (
                <li key={o.cle}>
                  <button
                    type="button"
                    onClick={() => aller(o.cle)}
                    aria-current={onglet === o.cle ? 'page' : undefined}
                    className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      onglet === o.cle ? 'text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'
                    }`}
                  >
                    {onglet === o.cle && (
                      <motion.span layoutId="onglet-espace" className="absolute inset-0 rounded-xl bg-surface-2" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                    )}
                    <o.icone size={18} className="relative" />
                    <span className="relative">{o.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rounded-2xl border border-line p-3">
            <p className="truncate text-sm font-semibold">{membre.nom || membre.email}</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <PastilleStatut abonnement={membre.abonnement} />
              <button onClick={sortir} className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                <LogOut size={14} /> Sortir
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
              <div className="lg:hidden">
                <Logo />
              </div>
              <h1 className="hidden font-display text-xl font-bold lg:block">{titres[onglet]}</h1>
              <div className="flex items-center gap-2">
                <a href="/" className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-ink sm:inline-block">
                  Retour au site
                </a>
                <ThemeToggle />
                <button
                  onClick={sortir}
                  aria-label="Se déconnecter"
                  className="grid size-10 place-items-center rounded-full border border-line text-muted hover:text-ink lg:hidden"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
            {/* Onglets (mobile et tablette) */}
            <nav aria-label="Espace membre" className="lg:hidden">
              <ul className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
                {onglets.map((o) => (
                  <li key={o.cle} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => aller(o.cle)}
                      aria-current={onglet === o.cle ? 'page' : undefined}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
                        onglet === o.cle ? 'bg-ink text-bg' : 'text-muted'
                      }`}
                    >
                      <o.icone size={15} />
                      {o.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {tableau.exemple && (
              <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3 text-sm">
                <span>
                  <strong>Démonstration</strong> : données d'exemple, Supabase n'est pas encore branché.
                </span>
                <a href={premiumDemo ? '/espace' : '/espace?demo=premium'} className="font-semibold text-accent underline-offset-4 hover:underline">
                  Voir la vue {premiumDemo ? 'gratuite' : 'Premium'}
                </a>
              </p>
            )}
            <div className="mb-6 lg:hidden">
              <h1 className="font-display text-2xl font-bold">{titres[onglet]}</h1>
            </div>
            {onglet === 'apercu' && (
              <p className="mb-6 text-muted">
                Bonjour{membre.nom ? ` ${membre.nom}` : ''} ! Voici l'essentiel du marché de la mangue cette semaine.
              </p>
            )}
            <motion.div key={onglet} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {onglet === 'apercu' && <VueEnsemble membre={membre} tableau={tableau} aller={aller} />}
              {onglet === 'prix' && <PrixMembre membre={membre} tableau={tableau} />}
              {onglet === 'conformite' && <ConformiteMembre membre={membre} tableau={tableau} />}
              {onglet === 'bulletins' && <BulletinsMembre membre={membre} tableau={tableau} />}
              {onglet === 'abonnement' && <AbonnementMembre membre={membre} />}
              {onglet === 'profil' && <ProfilMembre membre={membre} surMaj={setMembre} />}
            </motion.div>
          </main>
        </div>
      </div>
    </MotionConfig>
  )
}
