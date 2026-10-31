import { Crown } from 'lucide-react'
import type { Abonnement } from '../../services/espace'

const styles = {
  premium: 'border-brand/30 bg-brand-soft text-brand',
  expire: 'border-accent/40 bg-accent-soft text-danger',
  gratuit: 'border-line bg-surface-2 text-muted',
}
const libelles = { premium: 'Premium', expire: 'Abonnement expiré', gratuit: 'Gratuit' }

export default function PastilleStatut({ abonnement }: { abonnement: Abonnement }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[abonnement.statut]}`}>
      {abonnement.statut === 'premium' && <Crown size={12} />}
      {libelles[abonnement.statut]}
    </span>
  )
}
