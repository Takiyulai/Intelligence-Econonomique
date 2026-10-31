import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { ArrowLeft, LoaderCircle, MailCheck, Send } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { PROFILS, envoyerLien, espaceBranche, lireSession } from '../services/espace'
import type { Profil } from '../services/espace'

type Etape = 'email' | 'nouveau' | 'envoye'

/** Message laissé dans l'adresse par Supabase quand un lien magique a expiré ou a déjà servi. */
function erreurDuLien(): string {
  const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
  if (!p.get('error') && !p.get('error_code')) return ''
  return p.get('error_code') === 'otp_expired'
    ? 'Ce lien a expiré ou a déjà servi. Demandez-en un nouveau ci-dessous.'
    : "Ce lien n'a pas fonctionné. Demandez-en un nouveau ci-dessous."
}

export default function Connexion() {
  const [etape, setEtape] = useState<Etape>('email')
  const [email, setEmail] = useState(() => new URLSearchParams(window.location.search).get('email') ?? '')
  const [profil, setProfil] = useState<Profil>('')
  const [consentement, setConsentement] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState(erreurDuLien)

  useEffect(() => {
    document.title = 'Connexion · AgroCorridor'
    // déjà connecté : directement à l'espace
    lireSession().then((s) => s && window.location.replace('/espace'))
  }, [])

  const envoyer = async (e: FormEvent) => {
    e.preventDefault()
    if (envoi) return
    setEnvoi(true)
    setErreur('')
    const r = await envoyerLien(email, etape === 'nouveau' ? { profil, consentement } : undefined)
    setEnvoi(false)
    if (r.ok) {
      if (r.demo) window.location.assign('/espace')
      else setEtape('envoye')
    } else if (r.nouveau) setEtape('nouveau')
    else setErreur(r.message)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="grid flex-1 place-items-center px-4 pb-16">
          <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-black/5 sm:p-8">
            <AnimatePresence mode="wait">
              {etape === 'envoye' ? (
                <motion.div key="envoye" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center" role="status">
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                    <MailCheck size={28} />
                  </span>
                  <h1 className="mt-5 font-display text-2xl font-bold">Vérifiez votre boîte mail</h1>
                  <p className="mt-3 text-muted">
                    Un lien de connexion vient de partir à <strong className="text-ink">{email.trim().toLowerCase()}</strong>.
                    Cliquez dessus pour ouvrir votre espace : aucun mot de passe à retenir.
                  </p>
                  <p className="mt-4 text-sm text-muted">Rien reçu après 2 minutes ? Regardez dans les spams ou les promotions.</p>
                  <button
                    type="button"
                    onClick={() => setEtape('email')}
                    className="mt-6 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Utiliser une autre adresse
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={envoyer} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <h1 className="font-display text-2xl font-bold">
                    {etape === 'nouveau' ? 'Créer votre espace gratuit' : 'Accéder à mon espace'}
                  </h1>
                  <p className="mt-2 text-muted">
                    {etape === 'nouveau'
                      ? "Cette adresse n'a pas encore de compte. Deux précisions et le lien part."
                      : 'Indiquez votre e-mail : vous recevez un lien de connexion, sans mot de passe.'}
                  </p>
                  {!espaceBranche && (
                    <p className="mt-4 rounded-2xl border border-accent/40 bg-accent-soft px-4 py-2.5 text-sm text-ink">
                      Démonstration : aucun e-mail n'est envoyé, vous entrez directement dans un espace d'exemple.
                    </p>
                  )}

                  <label htmlFor="email" className="mt-6 block text-sm font-medium">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    readOnly={etape === 'nouveau'}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                    className="mt-1.5 w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 focus:border-brand focus:outline-none read-only:text-muted"
                  />

                  {etape === 'nouveau' && (
                    <>
                      <label htmlFor="profil" className="mt-4 block text-sm font-medium">
                        Vous êtes <span className="font-normal text-muted">(facultatif)</span>
                      </label>
                      <select
                        id="profil"
                        value={profil}
                        onChange={(e) => setProfil(e.target.value as Profil)}
                        className="mt-1.5 w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 focus:border-brand focus:outline-none"
                      >
                        <option value="">Choisir…</option>
                        {PROFILS.map((p) => (
                          <option key={p.valeur} value={p.valeur}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-muted">
                        <input
                          type="checkbox"
                          required
                          checked={consentement}
                          onChange={(e) => setConsentement(e.target.checked)}
                          className="mt-0.5 size-4 shrink-0 accent-[var(--brand)]"
                        />
                        J'accepte de recevoir le bulletin gratuit du vendredi. Désinscription en un clic depuis mon espace ;
                        mes coordonnées ne sont jamais revendues.
                      </label>
                    </>
                  )}

                  {erreur && (
                    <p role="alert" className="mt-4 rounded-2xl bg-accent-soft px-4 py-2.5 text-sm text-danger">
                      {erreur}
                    </p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={envoi}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white disabled:opacity-70 dark:text-[#06210f]"
                  >
                    {envoi ? (
                      <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Send size={16} />
                    )}
                    {etape === 'nouveau' ? 'Créer mon compte' : 'Recevoir mon lien de connexion'}
                  </motion.button>
                  {etape === 'nouveau' && (
                    <button
                      type="button"
                      onClick={() => setEtape('email')}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
                    >
                      <ArrowLeft size={14} /> Changer d'adresse
                    </button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </MotionConfig>
  )
}
