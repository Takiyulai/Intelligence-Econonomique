import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import Reveal from './Reveal'
import type { Profil } from '../services/espace'

const profils: { valeur: Profil; label: string }[] = [
  { valeur: '', label: 'Vous êtes… (facultatif)' },
  { valeur: 'exportateur', label: 'Exportateur' },
  { valeur: 'cooperative', label: 'Coopérative ou producteur' },
  { valeur: 'acheteur', label: 'Acheteur ou importateur' },
  { valeur: 'institution', label: 'Institution ou projet' },
  { valeur: 'autre', label: 'Autre' },
]

export default function AppelAction() {
  const [contact, setContact] = useState('')
  const [profil, setProfil] = useState<Profil>('')
  const [consentement, setConsentement] = useState(false)
  const [siteWeb, setSiteWeb] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState<'' | 'envoye' | 'demo'>('')

  const soumettre = async (e: FormEvent) => {
    e.preventDefault()
    if (envoi) return
    setEnvoi(true)
    setErreur('')
    // Le client Supabase n'est chargé qu'à l'envoi, pour garder la landing page légère.
    const { envoyerLien } = await import('../services/espace')
    const r = siteWeb ? ({ ok: true } as const) : await envoyerLien(contact, { profil, consentement })
    setEnvoi(false)
    if (r.ok) setSucces('demo' in r && r.demo ? 'demo' : 'envoye')
    else setErreur(r.message)
  }

  return (
    <section id="rejoindre" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-[#0f2a1e] px-6 py-14 text-center text-white sm:px-14">
            <div aria-hidden className="absolute -top-20 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-[#f5a524]/25 blur-3xl" />
            <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              Rejoignez le pilote « Mangue »
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/75">
              Créez votre espace gratuit : historique des prix, feux de conformité par pays et bulletin du vendredi. Déjà
              inscrit ?{' '}
              <a href="/connexion" className="font-semibold text-white underline underline-offset-4">
                Se connecter
              </a>
            </p>
            <AnimatePresence mode="wait">
              {succes ? (
                <motion.p
                  key="ok"
                  role="status"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative mx-auto mt-8 inline-flex max-w-md items-start gap-2 rounded-3xl bg-white/10 px-5 py-3 text-left"
                >
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#4ade80]" />
                  {succes === 'demo' ? (
                    <span>
                      Démonstration : aucun e-mail envoyé.{' '}
                      <a href="/espace" className="font-semibold underline underline-offset-4">
                        Ouvrir l'espace d'exemple
                      </a>
                    </span>
                  ) : (
                    <span>
                      Vérifiez votre boîte mail : un lien vient de partir pour ouvrir votre espace gratuit, sans mot de passe
                      (pensez aux spams).
                    </span>
                  )}
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={soumettre}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative mx-auto mt-8 max-w-md space-y-3 text-left"
                >
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label htmlFor="contact" className="sr-only">
                      Adresse e-mail
                    </label>
                    <input
                      id="contact"
                      type="email"
                      required
                      autoComplete="email"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Votre adresse e-mail"
                      className="flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 focus:border-[#4ade80] focus:outline-none"
                    />
                    <motion.button
                      type="submit"
                      disabled={envoi}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5a524] px-6 py-3 font-semibold text-[#1a1203] disabled:opacity-70"
                    >
                      {envoi ? (
                        <>
                          Envoi… <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" />
                        </>
                      ) : (
                        <>
                          S'inscrire <Send size={16} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  <label htmlFor="profil" className="sr-only">
                    Votre profil
                  </label>
                  <select
                    id="profil"
                    value={profil}
                    onChange={(e) => setProfil(e.target.value as Profil)}
                    className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white focus:border-[#4ade80] focus:outline-none [&>option]:text-[#0f1a14]"
                  >
                    {profils.map((p) => (
                      <option key={p.valeur} value={p.valeur}>
                        {p.label}
                      </option>
                    ))}
                  </select>

                  {/* Piège à robots : invisible pour les humains et les lecteurs d'écran */}
                  <input
                    type="text"
                    name="site_web"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={siteWeb}
                    onChange={(e) => setSiteWeb(e.target.value)}
                    className="absolute -left-[9999px] size-px opacity-0"
                  />

                  <label className="flex cursor-pointer items-start gap-3 px-2 text-sm text-white/75">
                    <input
                      type="checkbox"
                      required
                      checked={consentement}
                      onChange={(e) => setConsentement(e.target.checked)}
                      className="mt-0.5 size-4 shrink-0 accent-[#4ade80]"
                    />
                    J'accepte de recevoir le bulletin gratuit du vendredi. Désinscription en un clic depuis mon espace ;
                    mes coordonnées ne sont jamais revendues.
                  </label>

                  {erreur && (
                    <p role="alert" className="rounded-2xl bg-[#c2410c]/25 px-4 py-2.5 text-sm text-white">
                      {erreur}
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
