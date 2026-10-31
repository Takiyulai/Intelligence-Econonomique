import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Lock } from 'lucide-react'
import Carte from './Carte'
import Verrou from './Verrou'
import type { Membre, Tableau } from '../../services/espace'
import { semaineDe } from '../../services/espace'

export default function BulletinsMembre({ membre, tableau }: { membre: Membre; tableau: Tableau }) {
  const textes = new Map(tableau.commentaires.map((c) => [c.cle, c]))
  const [ouvert, setOuvert] = useState(tableau.commentaires[0]?.cle ?? '')

  return (
    <div className="space-y-5">
      {!tableau.premium && (
        <Verrou
          email={membre.email}
          titre="Archive réservée aux abonnés"
          texte="Retrouvez chaque lecture de la semaine et chaque conseil d'expédition, semaine par semaine."
        />
      )}
      <Carte titre="Lectures de la semaine">
        {tableau.archive.length ? (
          <ul className="divide-y divide-line">
            {tableau.archive.map((cle) => {
              const c = textes.get(cle)
              const visible = ouvert === cle && c
              return (
                <li key={cle}>
                  <button
                    type="button"
                    disabled={!c}
                    aria-expanded={Boolean(visible)}
                    onClick={() => setOuvert(visible ? '' : cle)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left disabled:cursor-not-allowed"
                  >
                    <span className="font-semibold">Semaine {semaineDe(cle).slice(1)} <span className="font-normal text-muted">· {cle.slice(0, 4)}</span></span>
                    {c ? (
                      <ChevronDown size={18} className={`text-muted transition-transform ${visible ? 'rotate-180' : ''}`} />
                    ) : (
                      <Lock size={16} className="text-muted" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {visible && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="pb-4 leading-relaxed">{c.texte}</p>
                        {!c.complet && <p className="pb-4 text-sm text-muted">Début du texte : la suite est réservée aux abonnés.</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-muted">Pas encore de bulletin publié.</p>
        )}
        <p className="mt-3 text-xs text-muted">Commentaires rédigés par IA à partir des seules cotations de la semaine.</p>
      </Carte>
    </div>
  )
}
