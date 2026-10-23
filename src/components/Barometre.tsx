import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartSpline, Table2 } from 'lucide-react'
import EnTeteSection from './EnTeteSection'
import LectureSemaine from './LectureSemaine'
import Reveal from './Reveal'
import StatutDonnees from './StatutDonnees'
import { getProduits, getSerieExemple, getSeriePrix, variation } from '../services/marketData'
import type { Produit, ProduitId, SeriePrix } from '../data/types'

type Vue = 'graphique' | 'tableau'

export default function Barometre() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [actif, setActif] = useState<ProduitId>('mangue')
  const [serie, setSerie] = useState<SeriePrix | undefined>(() => getSerieExemple('mangue'))
  const [vue, setVue] = useState<Vue>('graphique')

  useEffect(() => {
    getProduits().then(setProduits)
  }, [])
  useEffect(() => {
    let actuel = true
    getSeriePrix(actif).then((s) => actuel && setSerie(s))
    return () => {
      actuel = false
    }
  }, [actif])

  const produit = produits.find((p) => p.id === actif)
  const v = serie ? variation(serie) : 0
  const dernier = serie?.points.at(-1)

  return (
    <section id="barometre" className="scroll-mt-20 bg-surface-2/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Baromètre des prix"
          titre="Savoir quand expédier, et à quel prix"
          texte="Le prix moyen grossiste de la semaine, produit par produit, avec la lecture de la tendance."
        />
        <Reveal>
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-xl shadow-black/5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div role="tablist" aria-label="Produit" className="flex gap-1 rounded-full bg-surface-2 p-1">
                {produits.map((p) => (
                  <button
                    key={p.id}
                    role="tab"
                    aria-selected={actif === p.id}
                    onClick={() => setActif(p.id)}
                    className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      actif === p.id ? 'text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {actif === p.id && (
                      <motion.span
                        layoutId="onglet-actif"
                        className="absolute inset-0 rounded-full bg-surface shadow"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative">{p.nom}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {serie && <StatutDonnees serie={serie} />}
                <div className="flex rounded-full border border-line p-0.5" role="group" aria-label="Affichage">
                  {(
                    [
                      ['graphique', ChartSpline, 'Graphique'],
                      ['tableau', Table2, 'Tableau'],
                    ] as const
                  ).map(([cle, Icone, label]) => (
                    <button
                      key={cle}
                      type="button"
                      aria-pressed={vue === cle}
                      aria-label={label}
                      title={label}
                      onClick={() => setVue(cle)}
                      className={`grid size-8 place-items-center rounded-full transition-colors ${
                        vue === cle ? 'bg-surface-2 text-ink' : 'text-muted hover:text-ink'
                      }`}
                    >
                      <Icone size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {serie && dernier && (
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_240px]">
                <div className="min-w-0">
                  {vue === 'graphique' ? (
                    <div className="h-72 w-full">
                      <ResponsiveContainer>
                        <AreaChart data={serie.points} margin={{ top: 28, right: 24, left: -8, bottom: 0 }}>
                          <defs>
                            <linearGradient id="degrade" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                          <XAxis dataKey="semaine" stroke="var(--muted)" tickLine={false} axisLine={false} fontSize={12} />
                          <YAxis
                            stroke="var(--muted)"
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                            domain={['dataMin - 0.2', 'dataMax + 0.2']}
                            tickFormatter={(n: number) => n.toFixed(2)}
                            width={56}
                          />
                          <Tooltip
                            cursor={{ stroke: 'var(--muted)', strokeDasharray: '4 4' }}
                            contentStyle={{
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 12,
                              color: 'var(--text)',
                            }}
                            labelStyle={{ color: 'var(--muted)' }}
                            formatter={(val) => [`${Number(val).toFixed(2)} ${serie.unite}`, 'Prix moyen']}
                          />
                          <Area
                            key={`${actif}-${serie.exemple}`}
                            type="monotone"
                            dataKey="prix"
                            stroke="var(--brand)"
                            strokeWidth={2}
                            fill="url(#degrade)"
                            activeDot={{ r: 5, stroke: 'var(--surface)', strokeWidth: 2 }}
                            animationDuration={700}
                          />
                          {/* Point final mis en avant, avec sa valeur en étiquette directe */}
                          <ReferenceDot
                            x={dernier.semaine}
                            y={dernier.prix}
                            r={5}
                            fill="var(--brand)"
                            stroke="var(--surface)"
                            strokeWidth={2}
                            label={{
                              value: dernier.prix.toFixed(2),
                              position: 'top',
                              fill: 'var(--text)',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-auto rounded-2xl border border-line">
                      <table className="w-full text-sm tabular-nums">
                        <caption className="sr-only">
                          Prix moyen {produit?.nom ?? ''} par semaine, en {serie.unite}
                        </caption>
                        <thead className="sticky top-0 bg-surface-2 text-left text-xs text-muted">
                          <tr>
                            <th scope="col" className="px-4 py-2 font-medium">Semaine</th>
                            <th scope="col" className="px-4 py-2 text-right font-medium">Prix ({serie.unite})</th>
                            <th scope="col" className="px-4 py-2 text-right font-medium">Évolution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...serie.points].reverse().map((p, i, inv) => {
                            const prec = inv[i + 1]
                            const e = prec ? ((p.prix - prec.prix) / prec.prix) * 100 : null
                            return (
                              <tr key={p.semaine} className="border-t border-line">
                                <th scope="row" className="px-4 py-2 text-left font-medium">{p.semaine}</th>
                                <td className="px-4 py-2 text-right">{p.prix.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right text-muted">
                                  {e === null ? '—' : `${e >= 0 ? '+' : ''}${e.toFixed(1)} %`}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                  <Stat label="Dernier prix" valeur={`${dernier.prix.toFixed(2)} ${serie.unite}`} />
                  <Stat
                    label="Sur une semaine"
                    valeur={serie.points.length < 2 ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)} %`}
                    ton={serie.points.length < 2 ? '' : v >= 0 ? 'text-brand' : 'text-danger'}
                  />
                  <Stat label="Code SH" valeur={produit?.codeSH ?? '—'} />
                  <Stat label="Origines suivies" valeur={produit?.origines.join(', ') ?? '—'} petit />
                </dl>
              </div>
            )}

            {serie && <LectureSemaine serie={serie} />}
            {serie && (
              <p className="mt-6 text-xs text-muted">
                Source : {serie.source} · Marché : {serie.marche}.
                {!!serie.decalageSemaines &&
                  ` Prix publics décalés de ${serie.decalageSemaines} semaines : les abonnés reçoivent la semaine en cours.`}
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Stat({ label, valeur, ton = '', petit = false }: { label: string; valeur: string; ton?: string; petit?: boolean }) {
  return (
    <div className="rounded-2xl border border-line p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-1 font-display font-bold tabular-nums ${petit ? 'text-sm' : 'text-xl'} ${ton}`}>{valeur}</dd>
    </div>
  )
}
