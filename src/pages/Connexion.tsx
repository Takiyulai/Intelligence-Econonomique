import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ArrowLeft, Check, LoaderCircle, MailCheck, Send } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { PROFILS, connexionGoogle, envoyerLien, espaceBranche, lireSession } from '../services/espace'
import type { Profil, ResultatLien } from '../services/espace'

type Mode = 'connexion' | 'inscription'

/** Message laissé dans l'adresse par Supabase quand un lien a expiré ou qu'une connexion a échoué. */
function erreurDuLien(): string {
  const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
  if (!p.get('error') && !p.get('error_code')) return ''
  return p.get('error_code') === 'otp_expired'
    ? 'Ce lien a expiré ou a déjà servi. Demandez-en un nouveau ci-dessous.'
    : "La connexion n'a pas abouti. Réessayez ci-dessous."
}

const avantages = ['Historique des prix de la mangue', 'Feux de conformité UE par pays', 'Bulletin gratuit chaque vendredi']

/** Logo « G » de Google (couleurs officielles). */
function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Connexion() {
  const [mode, setMode] = useState<Mode>(() =>
    new URLSearchParams(window.location.search).get('mode') === 'inscription' ? 'inscription' : 'connexion',
  )
  const [envoye, setEnvoye] = useState(false)
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get('email') ?? '')
  const [profil, setProfil] = useState<Profil>('')
  const [consentement, setConsentement] = useState(false)
  const [envoi, setEnvoi] = useState<'' | 'email' | 'google'>('')
  const [erreur, setErreur] = useState(erreurDuLien)
  const [info, setInfo] = useState('')

  useEffect(() => {
    document.title = `${mode === 'inscription' ? 'Créer un compte' : 'Connexion'} · AgroCorridor`
  }, [mode])
  useEffect(() => {
    // déjà connecté : directement à l'espace
    lireSession().then((s) => s && window.location.replace('/espace'))
  }, [])

  const changerMode = (m: Mode) => {
    setMode(m)
    setErreur('')
    setInfo('')
    history.replaceState(null, '', m === 'inscription' ? '/connexion?mode=inscription' : '/connexion')
  }

  const traiter = (r: ResultatLien, apresEnvoi: () => void) => {
    if (r.ok) {
      if (r.demo) window.location.assign('/espace')
      else apresEnvoi()
    } else if (r.nouveau) {
      setMode('inscription')
      setInfo("Pas encore de compte avec cette adresse : créez-le en une étape.")
    } else setErreur(r.message)
  }

  const avecEmail = async (e: FormEvent) => {
    e.preventDefault()
    if (envoi) return
    setEnvoi('email')
    setErreur('')
    const r = await envoyerLien(email, mode === 'inscription' ? { profil, consentement } : undefined)
    setEnvoi('')
    traiter(r, () => setEnvoye(true))
  }

  const avecGoogle = async () => {
    if (envoi) return
    setErreur('')
    if (mode === 'inscription' && !consentement) {
      setErreur("Cochez la case d'accord pour créer votre compte.")
      return
    }
    setEnvoi('google')
    const r = await connexionGoogle(mode === 'inscription' ? { profil, consentement } : undefined)
    // en cas de succès, le navigateur part chez Google : on ne remet pas le bouton à zéro
    if (!r.ok || r.demo) setEnvoi('')
    traiter(r, () => {})
  }

  const inscription = mode === 'inscription'

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <a href="/" className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-ink sm:inline-block">
              Retour au site
            </a>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-4 pb-16 pt-4 lg:grid-cols-[1fr_440px]">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">Espace membre</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">
              Le marché de la mangue en Europe, au même endroit
            </h1>
            <p className="mt-4 max-w-md text-muted">
              Votre espace réunit les prix, les alertes aux frontières et vos bulletins. Gratuit pour commencer, Premium quand vous
              voulez la semaine en cours.
            </p>
            <ul className="mt-8 space-y-3">
              {avantages.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-full bg-brand-soft text-brand">
                    <Check size={15} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">
            <AnimatePresence mode="wait">
              {envoye ? (
                <motion.div key="envoye" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center" role="status">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <MailCheck size={28} />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-bold">Vérifiez votre boîte mail</h2>
                  <p className="mt-3 text-muted">
                    Un lien vient de partir à <strong className="text-ink">{email.trim().toLowerCase()}</strong>. Cliquez dessus pour
                    ouvrir votre espace : aucun mot de passe à retenir.
                  </p>
                  <p className="mt-4 text-sm text-muted">Rien reçu après 2 minutes ? Regardez dans les spams ou les promotions.</p>
                  <button
                    type="button"
                    onClick={() => setEnvoye(false)}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    <ArrowLeft size={14} /> Utiliser une autre adresse
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div role="tablist" aria-label="Connexion ou inscription" className="grid grid-cols-2 rounded-full bg-surface-2 p-1">
                    {(
                      [
                        ['connexion', 'Se connecter'],
                        ['inscription', 'Créer un compte'],
                      ] as const
                    ).map(([m, label]) => (
                      <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => changerMode(m)}
                        className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          mode === m ? 'text-ink' : 'text-muted hover:text-ink'
                        }`}
                      >
                        {mode === m && (
                          <motion.span
                            layoutId="mode-connexion"
                            className="absolute inset-0 rounded-full bg-surface shadow"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span className="relative">{label}</span>
                      </button>
                    ))}
                  </div>

                  <h2 className="mt-6 font-display text-2xl font-bold">{inscription ? 'Créer votre espace gratuit' : 'Bon retour !'}</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {inscription ? 'Gratuit, sans carte bancaire. Premium quand vous le souhaitez.' : 'Connectez-vous à votre espace membre.'}
                  </p>
                  {!espaceBranche && (
                    <p className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-2.5 text-sm text-ink">
                      Démonstration : aucune connexion réelle, vous entrez directement dans un espace d'exemple.
                    </p>
                  )}
                  {info && <p className="mt-4 rounded-2xl bg-brand-soft px-4 py-2.5 text-sm text-ink">{info}</p>}

                  {inscription && (
                    <div className="mt-5 space-y-3">
                      <label htmlFor="profil" className="block text-sm font-medium">
                        Vous êtes <span className="font-normal text-muted">(facultatif)</span>
                      </label>
                      <select
                        id="profil"
                        value={profil}
                        onChange={(e) => setProfil(e.target.value as Profil)}
                        className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 focus:border-brand focus:outline-none"
                      >
                        <option value="">Choisir…</option>
                        {PROFILS.map((p) => (
                          <option key={p.valeur} value={p.valeur}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex cursor-pointer items-start gap-3 text-sm text-muted">
                        <input
                          type="checkbox"
                          checked={consentement}
                          onChange={(e) => setConsentement(e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                        />
                        J'accepte de recevoir le bulletin gratuit du vendredi. Désinscription en un clic depuis mon espace ; mes
                        coordonnées ne sont jamais revendues.
                      </label>
                    </div>
                  )}

                  <motion.button
                    type="button"
                    onClick={avecGoogle}
                    disabled={Boolean(envoi)}
                    whileTap={{ scale: 0.98 }}
                    className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-full border border-line bg-surface px-6 py-3 font-semibold transition-colors hover:border-brand/50 hover:bg-surface-2 disabled:opacity-70"
                  >
                    {envoi === 'google' ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" /> : <LogoGoogle />}
                    {inscription ? "S'inscrire avec Google" : 'Continuer avec Google'}
                  </motion.button>

                  <div className="my-5 flex items-center gap-3 text-xs text-muted">
                    <span className="h-px flex-1 bg-line" />
                    ou avec votre e-mail
                    <span className="h-px flex-1 bg-line" />
                  </div>

                  <form onSubmit={avecEmail}>
                    <label htmlFor="email" className="sr-only">
                      Adresse e-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@entreprise.com"
                      className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 focus:border-brand focus:outline-none"
                    />
                    {erreur && (
                      <p role="alert" className="mt-3 rounded-2xl bg-accent-soft px-4 py-2.5 text-sm text-danger">
                        {erreur}
                      </p>
                    )}
                    <motion.button
                      type="submit"
                      disabled={Boolean(envoi)}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-70 dark:text-[#06210f]"
                    >
                      {envoi === 'email' ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" /> : <Send size={16} />}
                      {inscription ? 'Créer mon compte' : 'Recevoir mon lien de connexion'}
                    </motion.button>
                    <p className="mt-3 text-center text-xs text-muted">Pas de mot de passe : vous recevez un lien valable une heure.</p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
