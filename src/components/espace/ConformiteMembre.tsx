import { ExternalLink } from 'lucide-react'
import Carte from './Carte'
import FeuxPays from './FeuxPays'
import Verrou from './Verrou'
import type { Membre, Tableau } from '../../services/espace'
import { dateCourte } from '../../services/marketData'

const moisLong = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
const SOURCES: Record<string, string> = { rasff: 'RASFF', europhyt: 'EUROPHYT', agrinfo: 'AGRINFO', manuel: 'Veille IE', 'ue-lmr': 'LMR UE' }

export default function ConformiteMembre({ membre, tableau }: { membre: Membre; tableau: Tableau }) {
  return (
    <div className="space-y-5">
      <Carte titre="Risque aux frontières de l'UE par origine">
        <FeuxPays feux={tableau.feux} />
        <p className="mt-3 text-xs text-muted">
          Rouge : 3 alertes ou plus sur 90 jours ; orange : au moins une sur 12 mois. Sources : RASFF et interceptions EUROPHYT.
          {tableau.veille_maj_le && ` Veille du ${dateCourte(tableau.veille_maj_le)}.`}
        </p>
      </Carte>

      <Carte titre="Alertes récentes sur la mangue">
        {tableau.alertes === null ? (
          <Verrou
            email={membre.email}
            titre={`${tableau.alertes_30j} alerte(s) ces 30 derniers jours`}
            texte="Le détail (pays, motif, décision, lien officiel) est réservé aux abonnés Premium, avec l'alerte le jour même sur WhatsApp."
          />
        ) : tableau.alertes.length ? (
          <ul className="divide-y divide-line">
            {tableau.alertes.map((a, i) => (
              <li key={`${a.date}-${i}`} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <span>{dateCourte(a.date)}</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5">{SOURCES[a.source] ?? a.source}</span>
                  {a.pays && <span>{a.pays}</span>}
                </div>
                <p className="mt-1 font-semibold">{a.titre}</p>
                <p className="text-sm text-muted">
                  {[a.danger !== 'autre' ? a.danger : '', a.decision].filter(Boolean).join(' · ')}
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-brand hover:underline">
                      Source <ExternalLink size={12} />
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Aucune alerte enregistrée sur la mangue.</p>
        )}
      </Carte>

      {tableau.infos !== null && (
        <Carte titre="Infos terrain de l'analyste">
          {tableau.infos.length ? (
            <ul className="space-y-3">
              {tableau.infos.map((info, i) => (
                <li key={i} className="rounded-2xl border border-line p-4">
                  <p className="text-xs text-muted">{dateCourte(info.date)} · {info.categorie}{info.pays && ` · ${info.pays}`}</p>
                  <p className="mt-1 font-semibold">{info.titre}</p>
                  {info.detail && <p className="mt-1 text-sm text-muted">{info.detail}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Pas encore d'info terrain.</p>
          )}
        </Carte>
      )}

      {tableau.note_mensuelle && (
        <Carte titre={`Note mensuelle du commerce · ${moisLong(tableau.note_mensuelle.mois)}`}>
          <p className="whitespace-pre-line leading-relaxed">{tableau.note_mensuelle.texte}</p>
          <p className="mt-3 text-xs text-muted">D'après Eurostat Comext et UN Comtrade.</p>
        </Carte>
      )}
    </div>
  )
}
