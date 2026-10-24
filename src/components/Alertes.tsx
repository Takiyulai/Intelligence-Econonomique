import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, Info, ShieldCheck, Siren } from 'lucide-react'
import EnTeteSection from './EnTeteSection'
import BadgeExemple from './BadgeExemple'
import { dateCourte, getConformite } from '../services/marketData'
import type { Conformite, CouleurFeu, FeuPays, NiveauAlerte } from '../data/types'

const styles: Record<NiveauAlerte, { icone: typeof Info; classe: string; label: string }> = {
  urgent: { icone: Siren, classe: 'bg-accent-soft text-danger', label: 'Urgent' },
  attention: { icone: AlertTriangle, classe: 'bg-accent-soft text-accent', label: 'Attention' },
  info: { icone: Info, classe: 'bg-brand-soft text-brand', label: 'Info' },
}

const feux: Record<CouleurFeu, { point: string; label: string }> = {
  vert: { point: 'bg-brand', label: 'Calme' },
  orange: { point: 'bg-accent', label: 'Vigilance' },
  // rouge franc : en mode sombre, « danger » et « accent » sont deux orangés trop proches pour un feu
  rouge: { point: 'bg-red-600 dark:bg-red-500', label: 'Risque élevé' },
}

function CarteFeu({ feu, i }: { feu: FeuPays; i: number }) {
  const f = feux[feu.couleur]
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.4 }}
      className="rounded-2xl border border-line bg-surface p-4"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex size-3">
          {feu.couleur === 'rouge' && (
            <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden ${f.point}`} />
          )}
          <span className={`relative inline-flex size-3 rounded-full ${f.point}`} />
        </span>
        <span className="font-semibold">{feu.nom}</span>
      </div>
      <p className="mt-1 text-sm font-medium">{f.label}</p>
      <p className="mt-1 text-xs text-muted">
        {feu.alertes12m
          ? `${feu.alertes3m} alerte(s) sur 3 mois, ${feu.alertes12m} sur 12 mois`
          : 'Aucune alerte enregistrée sur 12 mois'}
      </p>
    </motion.li>
  )
}

export default function Alertes() {
  const [donnees, setDonnees] = useState<Conformite>()
  useEffect(() => {
    getConformite().then(setDonnees)
  }, [])
  const alertes = donnees?.alertes ?? []
  const reelles = donnees && !donnees.exemple

  return (
    <section id="alertes" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Alertes normes"
          titre="Soyez prévenu avant d'être bloqué à la frontière"
          texte="Limites de résidus, contrôles renforcés, nouvelles exigences : l'essentiel, en clair, dès que ça change."
        />

        {reelles && (
          <div className="mb-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} className="text-brand" />
                Mangue : risque aux frontières de l'UE par origine
              </h3>
              {donnees.majLe && <span className="text-xs text-muted">Veille du {dateCourte(donnees.majLe)}</span>}
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {donnees.feux.map((f, i) => (
                <CarteFeu key={f.pays} feu={f} i={i} />
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              Sources : {donnees.sources}. Rouge : 3 alertes ou plus sur 90 jours ; orange : au moins une sur 12 mois.
            </p>
          </div>
        )}

        <ul className="space-y-4">
          {reelles && !alertes.length && (
            <li className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
              Aucune alerte récente sur la mangue, le piment ou l'ananas d'Afrique de l'Ouest.
            </li>
          )}
          {alertes.map((a, i) => {
            const s = styles[a.niveau]
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ x: 4 }}
                className="flex gap-4 rounded-2xl border border-line bg-surface p-5"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${s.classe}`}>
                  <s.icone size={20} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.classe}`}>{s.label}</span>
                    <span className="text-xs capitalize text-muted">{a.produit}</span>
                    {a.exemple ? <BadgeExemple /> : a.date && <span className="text-xs text-muted">{dateCourte(a.date)}</span>}
                  </div>
                  <h3 className="mt-2 font-semibold">{a.titre}</h3>
                  <p className="mt-1 text-sm text-muted">{a.resume}</p>
                </div>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
