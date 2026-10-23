import { Check, Sparkles } from 'lucide-react'
import EnTeteSection from './EnTeteSection'
import Reveal from './Reveal'
import TiltCard from './TiltCard'

const offres = [
  {
    nom: 'Découverte',
    prix: '0 €',
    periode: '',
    detail: 'Gratuit, sans engagement',
    texte: 'Pour suivre les grandes tendances.',
    points: [
      'Tendances mensuelles sur le site',
      'Prix publics décalés de 4 semaines',
      'Début du commentaire de la semaine',
      'Bulletin résumé mensuel',
    ],
    fondateurs: '',
    vedette: false,
  },
  {
    nom: 'Premium',
    prix: '23 €',
    periode: '/mois',
    detail: 'ou 230 €/an (2 mois offerts) · ≈ 15 000 FCFA/mois',
    texte: 'Pour décider chaque semaine.',
    points: [
      'Prix de la semaine, chaque vendredi à 8 h',
      'Tous les produits et marchés suivis',
      "Analyse complète et conseil d'expédition",
      'Alertes normes le jour même sur WhatsApp',
      "1 question à l'analyste par mois",
      'Livré sur WhatsApp et par e-mail',
    ],
    fondateurs: 'Tarif fondateurs : 15 €/mois pour les 20 premiers abonnés, garanti un an.',
    vedette: true,
  },
  {
    nom: 'Rapports',
    prix: '115 €',
    periode: '/rapport',
    detail: 'Fiche marché seule : 53 € · ≈ 75 000 FCFA le rapport',
    texte: 'Pour préparer une filière ou un marché.',
    points: ['Analyse sectorielle complète', 'Exigences par pays', 'Mise en relation acheteurs'],
    fondateurs: '',
    vedette: false,
  },
]

export default function Offres() {
  return (
    <section id="offres" className="scroll-mt-20 bg-surface-2/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Offres"
          titre="Commencez gratuitement, passez Premium quand vous êtes prêt"
          texte="Le site montre la tendance. Les abonnés reçoivent la semaine en cours et le conseil pour agir."
        />
        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {offres.map((o, i) => (
            <Reveal key={o.nom} delai={i * 0.1}>
              <TiltCard className="h-full">
                <div
                  className={`flex h-full flex-col rounded-3xl border p-7 ${
                    o.vedette ? 'border-brand bg-surface shadow-2xl shadow-brand/15' : 'border-line bg-surface'
                  }`}
                >
                  {o.vedette && (
                    <span className="mb-4 self-start rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white dark:text-[#06210f]">
                      Recommandé
                    </span>
                  )}
                  <h3 className="font-display text-xl font-bold">{o.nom}</h3>
                  <p className="mt-1 text-muted">{o.texte}</p>
                  <p className="mt-6 font-display text-3xl font-extrabold tabular-nums">
                    {o.prix}
                    {o.periode && <span className="ml-1 text-base font-medium text-muted">{o.periode}</span>}
                  </p>
                  <p className="mt-1 text-xs text-muted">{o.detail}</p>
                  {o.fondateurs && (
                    <p className="mt-4 flex gap-2 rounded-2xl border border-accent/40 bg-accent-soft px-3 py-2.5 text-sm font-medium text-ink">
                      <Sparkles size={16} className="mt-0.5 shrink-0 text-accent" />
                      {o.fondateurs}
                    </p>
                  )}
                  <ul className="mt-6 flex-1 space-y-3">
                    {o.points.map((p) => (
                      <li key={p} className="flex gap-3 text-sm">
                        <Check size={18} className="shrink-0 text-brand" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#rejoindre"
                    className={`mt-8 rounded-full px-5 py-3 text-center font-semibold transition-all hover:-translate-y-0.5 ${
                      o.vedette ? 'bg-brand text-white dark:text-[#06210f]' : 'border border-line hover:border-brand/50'
                    }`}
                  >
                    {o.vedette ? 'Devenir membre fondateur' : 'Je suis intéressé'}
                  </a>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
