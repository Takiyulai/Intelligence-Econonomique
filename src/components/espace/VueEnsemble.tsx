import { ArrowDownRight, ArrowRight, ArrowUpRight, UserRound } from 'lucide-react'
import Carte from './Carte'
import FeuxPays from './FeuxPays'
import PastilleStatut from './PastilleStatut'
import Verrou from './Verrou'
import type { Onglet } from './types'
import type { Membre, Tableau } from '../../services/espace'
import { semaineDe } from '../../services/espace'
import { dateCourte } from '../../services/marketData'

const lienCarte = 'inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline underline-offset-4'

export default function VueEnsemble({ membre, tableau, aller }: { membre: Membre; tableau: Tableau; aller: (o: Onglet) => void }) {
  const dernier = tableau.prix.at(-1)
  const avant = tableau.prix.at(-2)
  const v = dernier && avant ? ((dernier.prix - avant.prix) / avant.prix) * 100 : null
  const commentaire = tableau.commentaires[0]
  const a = membre.abonnement
  const profilIncomplet = !membre.nom || !membre.profil

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Carte titre="Prix de la mangue" className="lg:col-span-2" action={<button className={lienCarte} onClick={() => aller('prix')}>Détail <ArrowRight size={14} /></button>}>
        {dernier ? (
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="font-display text-4xl font-extrabold tabular-nums">
              {dernier.prix.toFixed(2).replace('.', ',')} <span className="text-base font-medium text-muted">€/kg</span>
            </p>
            {v !== null && (
              <p className={`inline-flex items-center gap-1 font-semibold ${v >= 0 ? 'text-brand' : 'text-danger'}`}>
                {v >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {`${v >= 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')} % sur une semaine`}
              </p>
            )}
            <p className="w-full text-sm text-muted">
              {semaineDe(dernier.cle)} · {tableau.marche} · prix moyen grossiste
              {tableau.decalage_semaines > 0 && ` · décalé de ${tableau.decalage_semaines} semaines`}
            </p>
          </div>
        ) : (
          <p className="text-muted">Pas encore de cotations publiées.</p>
        )}
        {commentaire && (
          <div className="mt-5 rounded-2xl border-l-4 border-accent bg-accent-soft/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lecture de la semaine {semaineDe(commentaire.cle)}</p>
            <p className="mt-1.5 leading-relaxed">{commentaire.texte}</p>
            {!commentaire.complet && <p className="mt-2 text-sm text-muted">La suite et le conseil d'expédition sont réservés aux abonnés.</p>}
          </div>
        )}
      </Carte>

      <Carte titre="Mon abonnement" action={<PastilleStatut abonnement={a} />}>
        {a.statut === 'premium' ? (
          <>
            <p className="text-sm text-muted">{a.date_fin ? `Valable jusqu'au ${dateCourte(a.date_fin)}` : 'Sans date de fin'}</p>
            {a.jours_restants != null && (
              <p className="mt-2 font-display text-3xl font-extrabold tabular-nums">
                {a.jours_restants} <span className="text-base font-medium text-muted">jour(s) restant(s)</span>
              </p>
            )}
            <button className={`${lienCarte} mt-4`} onClick={() => aller('abonnement')}>Gérer <ArrowRight size={14} /></button>
          </>
        ) : (
          <Verrou
            email={membre.email}
            titre={a.statut === 'expire' ? 'Votre abonnement a expiré' : 'Vous êtes en accès gratuit'}
            texte="Premium : le prix de la semaine en cours, l'analyse complète, le détail des alertes et l'archive des bulletins."
          />
        )}
      </Carte>

      <Carte titre="Conformité UE" className="lg:col-span-2" action={<button className={lienCarte} onClick={() => aller('conformite')}>Détail <ArrowRight size={14} /></button>}>
        <FeuxPays feux={tableau.feux} />
        <p className="mt-3 text-sm text-muted">
          {tableau.alertes_30j
            ? `${tableau.alertes_30j} alerte(s) sur la mangue ces 30 derniers jours.`
            : 'Aucune alerte sur la mangue ces 30 derniers jours.'}
          {tableau.veille_maj_le && ` Veille du ${dateCourte(tableau.veille_maj_le)}.`}
        </p>
      </Carte>

      <Carte titre={profilIncomplet ? 'Complétez votre profil' : 'Mon profil'}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
            <UserRound size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{membre.nom || membre.email}</p>
            <p className="text-sm text-muted">
              {profilIncomplet ? 'Votre nom et votre activité nous aident à vous envoyer ce qui compte pour vous.' : `Membre depuis le ${dateCourte(membre.membre_depuis)}`}
            </p>
          </div>
        </div>
        <button className={`${lienCarte} mt-4`} onClick={() => aller('profil')}>
          {profilIncomplet ? 'Compléter' : 'Modifier'} <ArrowRight size={14} />
        </button>
      </Carte>
    </div>
  )
}
