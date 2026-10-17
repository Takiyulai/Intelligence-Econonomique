import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, Info, Siren } from 'lucide-react'
import EnTeteSection from './EnTeteSection'
import BadgeExemple from './BadgeExemple'
import { getAlertes } from '../services/marketData'
import type { AlerteNorme, NiveauAlerte } from '../data/types'

const styles: Record<NiveauAlerte, { icone: typeof Info; classe: string; label: string }> = {
  urgent: { icone: Siren, classe: 'bg-accent-soft text-danger', label: 'Urgent' },
  attention: { icone: AlertTriangle, classe: 'bg-accent-soft text-accent', label: 'Attention' },
  info: { icone: Info, classe: 'bg-brand-soft text-brand', label: 'Info' },
}

export default function Alertes() {
  const [alertes, setAlertes] = useState<AlerteNorme[]>([])
  useEffect(() => {
    getAlertes().then(setAlertes)
  }, [])

  return (
    <section id="alertes" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Alertes normes"
          titre="Soyez prévenu avant d'être bloqué à la frontière"
          texte="Limites de résidus, contrôles renforcés, nouvelles exigences : l'essentiel, en clair, dès que ça change."
        />
        <ul className="space-y-4">
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
                    {a.exemple && <BadgeExemple />}
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
