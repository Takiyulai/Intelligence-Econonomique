import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Send } from 'lucide-react'
import Reveal from './Reveal'

export default function AppelAction() {
  const [envoye, setEnvoye] = useState(false)

  // Démo : aucune donnée n'est envoyée tant qu'aucun service d'inscription n'est branché.
  const soumettre = (e: FormEvent) => {
    e.preventDefault()
    setEnvoye(true)
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
              Recevez gratuitement les premiers bulletins hebdomadaires et aidez-nous à construire l'outil dont votre
              filière a besoin.
            </p>
            <AnimatePresence mode="wait">
              {envoye ? (
                <motion.p
                  key="ok"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3"
                >
                  <CheckCircle2 size={20} className="text-[#4ade80]" />
                  Merci ! (version de démonstration : aucune donnée n'a été envoyée)
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={soumettre}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                >
                  <label htmlFor="contact" className="sr-only">
                    E-mail ou numéro WhatsApp
                  </label>
                  <input
                    id="contact"
                    required
                    placeholder="E-mail ou numéro WhatsApp"
                    className="flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 focus:border-[#4ade80] focus:outline-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5a524] px-6 py-3 font-semibold text-[#1a1203]"
                  >
                    S'inscrire <Send size={16} />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
