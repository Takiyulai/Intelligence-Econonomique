import type { CouleurFeu } from '../../data/types'
import type { FeuMembre } from '../../services/espace'

const points: Record<CouleurFeu, { classe: string; label: string }> = {
  vert: { classe: 'bg-brand', label: 'Calme' },
  orange: { classe: 'bg-accent', label: 'Vigilance' },
  rouge: { classe: 'bg-red-600 dark:bg-red-500', label: 'Risque élevé' },
}

/** Feu tricolore par pays d'origine (mangue, alertes UE sur 3 et 12 mois). */
export default function FeuxPays({ feux, compact = false }: { feux: FeuMembre[]; compact?: boolean }) {
  return (
    <ul className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {feux.map((f) => (
        <li key={f.pays} className="rounded-2xl border border-line p-3">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 shrink-0 rounded-full ${points[f.couleur].classe}`} />
            <span className="truncate text-sm font-semibold">{f.nom}</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            {points[f.couleur].label}
            {!compact && ` · ${f.alertes3m} sur 3 mois, ${f.alertes12m} sur 12 mois`}
          </p>
        </li>
      ))}
    </ul>
  )
}
