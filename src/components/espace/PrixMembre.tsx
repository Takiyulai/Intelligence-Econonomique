import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Carte from './Carte'
import Verrou from './Verrou'
import type { Membre, Tableau } from '../../services/espace'
import { dateCourte } from '../../services/marketData'

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

export default function PrixMembre({ membre, tableau }: { membre: Membre; tableau: Tableau }) {
  const points = tableau.prix
  return (
    <div className="space-y-5">
      {tableau.decalage_semaines > 0 && (
        <Verrou
          email={membre.email}
          titre={`Prix décalés de ${tableau.decalage_semaines} semaines`}
          texte="En accès gratuit, vous voyez les prix avec un mois de retard. Les abonnés Premium voient la semaine en cours, chaque vendredi à 8 h."
        />
      )}
      <Carte titre={`Mangue · ${tableau.marche}`}>
        {points.length ? (
          <>
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <AreaChart data={points} margin={{ top: 16, right: 16, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="degrade-membre" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="semaine" stroke="var(--muted)" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis stroke="var(--muted)" tickLine={false} axisLine={false} fontSize={12} width={56}
                    domain={['dataMin - 0.2', 'dataMax + 0.2']} tickFormatter={(n: number) => n.toFixed(2)} />
                  <Tooltip
                    cursor={{ stroke: 'var(--muted)', strokeDasharray: '4 4' }}
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }}
                    labelStyle={{ color: 'var(--muted)' }}
                    formatter={(val) => [`${fmt(Number(val))} €/kg`, 'Prix moyen']}
                  />
                  <Area type="monotone" dataKey="prix" stroke="var(--brand)" strokeWidth={2} fill="url(#degrade-membre)"
                    activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }} animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 max-h-80 overflow-auto rounded-2xl border border-line">
              <table className="w-full text-sm tabular-nums">
                <caption className="sr-only">Prix de la mangue par semaine, en €/kg</caption>
                <thead className="sticky top-0 bg-surface-2 text-left text-xs text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-medium">Semaine</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Moyen</th>
                    <th scope="col" className="hidden px-4 py-2 text-right font-medium sm:table-cell">Min – max</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Évolution</th>
                    <th scope="col" className="hidden px-4 py-2 text-right font-medium sm:table-cell">Cotations</th>
                  </tr>
                </thead>
                <tbody>
                  {[...points].reverse().map((p, i, inv) => {
                    const prec = inv[i + 1]
                    const e = prec ? ((p.prix - prec.prix) / prec.prix) * 100 : null
                    return (
                      <tr key={p.cle} className="border-t border-line">
                        <th scope="row" className="px-4 py-2 text-left font-medium">{p.semaine}</th>
                        <td className="px-4 py-2 text-right font-semibold">{fmt(p.prix)}</td>
                        <td className="hidden px-4 py-2 text-right text-muted sm:table-cell">{fmt(p.min)} – {fmt(p.max)}</td>
                        <td className={`px-4 py-2 text-right ${e === null ? 'text-muted' : e >= 0 ? 'text-brand' : 'text-danger'}`}>
                          {e === null ? '—' : `${e >= 0 ? '+' : ''}${e.toFixed(1).replace('.', ',')} %`}
                        </td>
                        <td className="hidden px-4 py-2 text-right text-muted sm:table-cell">{p.nb}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted">
              Source : RNM FranceAgriMer, cotations grossistes{points.at(-1)?.derniere ? `, dernière le ${dateCourte(points.at(-1)!.derniere)}` : ''}.
              {tableau.exemple && ' Données d’exemple.'}
            </p>
          </>
        ) : (
          <p className="text-muted">Pas encore de cotations publiées.</p>
        )}
      </Carte>
    </div>
  )
}
