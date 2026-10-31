import { Check, MessageCircle } from 'lucide-react'
import Carte from './Carte'
import PastilleStatut from './PastilleStatut'
import type { Membre } from '../../services/espace'
import { lienPremium } from '../../services/espace'
import { dateCourte } from '../../services/marketData'

const avantages = [
  'Prix de la semaine en cours, chaque vendredi à 8 h',
  "Analyse complète et conseil d'expédition",
  'Détail des alertes aux frontières, le jour même sur WhatsApp',
  'Archive des bulletins et infos terrain',
  "1 question à l'analyste par mois",
]

export default function AbonnementMembre({ membre }: { membre: Membre }) {
  const a = membre.abonnement
  const bientot = a.statut === 'premium' && a.jours_restants != null && a.jours_restants <= 7
  const lien = lienPremium(membre.email, a.statut !== 'gratuit')
  const duree = a.depuis && a.date_fin ? Math.max(1, (Date.parse(a.date_fin) - Date.parse(a.depuis)) / 864e5) : null
  const part = duree && a.jours_restants != null ? Math.min(100, Math.max(0, (a.jours_restants / duree) * 100)) : null

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Carte titre="Mon abonnement" action={<PastilleStatut abonnement={a} />}>
        {a.statut === 'premium' && (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">Formule</dt>
              <dd className="mt-0.5 font-semibold capitalize">{a.formule}</dd>
            </div>
            <div>
              <dt className="text-muted">Depuis le</dt>
              <dd className="mt-0.5 font-semibold">{a.depuis ? dateCourte(a.depuis) : '—'}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted">Fin de période</dt>
              <dd className="mt-0.5 font-semibold">
                {a.date_fin ? `${dateCourte(a.date_fin)} · ${a.jours_restants} jour(s) restant(s)` : 'Sans date de fin'}
              </dd>
              {part !== null && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="presentation">
                  <div className={`h-full rounded-full ${bientot ? 'bg-accent' : 'bg-brand'}`} style={{ width: `${part}%` }} />
                </div>
              )}
            </div>
          </dl>
        )}
        {a.statut === 'expire' && (
          <p className="text-muted">
            Votre abonnement {a.formule} a pris fin{a.date_fin ? ` le ${dateCourte(a.date_fin)}` : ''}. Vous gardez l'accès gratuit
            en attendant : renouvelez pour retrouver la semaine en cours et le détail des alertes.
          </p>
        )}
        {a.statut === 'gratuit' && (
          <p className="text-muted">
            Vous êtes en accès gratuit : prix décalés de 4 semaines, début du commentaire, feux de conformité et bulletin gratuit du
            vendredi.
          </p>
        )}
        {(a.statut !== 'premium' || bientot) && (
          <a
            href={lien.href}
            target={lien.externe ? '_blank' : undefined}
            rel={lien.externe ? 'noreferrer' : undefined}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5 dark:text-[#06210f]"
          >
            <MessageCircle size={16} />
            {a.statut === 'gratuit' ? 'Passer à Premium' : "Renouveler l'abonnement"}
          </a>
        )}
        <p className="mt-4 text-xs text-muted">
          Paiement par Mobile Money (Wave, Orange Money) ou virement : nous activons votre accès dès réception, en général le jour même.
        </p>
      </Carte>

      <Carte titre={a.statut === 'premium' ? 'Inclus dans votre abonnement' : 'Ce que Premium ajoute'}>
        <p className="font-display text-3xl font-extrabold">
          23 € <span className="text-base font-medium text-muted">/mois</span>
        </p>
        <p className="text-sm text-muted">ou 230 €/an (2 mois offerts) · tarif fondateurs 15 €/mois pour les 20 premiers</p>
        <ul className="mt-5 space-y-3">
          {avantages.map((t) => (
            <li key={t} className="flex gap-3 text-sm">
              <Check size={18} className="shrink-0 text-brand" />
              {t}
            </li>
          ))}
        </ul>
      </Carte>
    </div>
  )
}
