import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Reveal from './Reveal'

/** Dernier appel à l'action : pas de formulaire ici, l'inscription et la connexion se font sur /connexion. */
export default function AppelAction() {
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
              Créez votre espace gratuit : historique des prix, feux de conformité par pays et bulletin du vendredi. Passez
              Premium quand vous voulez la semaine en cours.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <motion.a
                href="/connexion?mode=inscription"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#f5a524] px-6 py-3 font-semibold text-[#1a1203]"
              >
                Créer mon espace gratuit
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </motion.a>
              <a
                href="/connexion"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white transition-colors hover:border-white/60"
              >
                J'ai déjà un compte
              </a>
            </div>
            <p className="relative mt-4 text-sm text-white/60">Avec Google ou votre e-mail, sans mot de passe.</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
