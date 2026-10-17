import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import EnTeteSection from './EnTeteSection'
import Reveal from './Reveal'
import BadgeExemple from './BadgeExemple'
import { getProduits, getSeriePrix, variation } from '../services/marketData'
import type { Produit, ProduitId, SeriePrix } from '../data/types'

export default function Barometre() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [actif, setActif] = useState<ProduitId>('mangue')
  const [serie, setSerie] = useState<SeriePrix>()

  useEffect(() => {
    getProduits().then(setProduits)
  }, [])
  useEffect(() => {
    getSeriePrix(actif).then(setSerie)
  }, [actif])

  const produit = produits.find((p) => p.id === actif)
  const v = serie ? variation(serie) : 0

  return (
    <section id="barometre" className="scroll-mt-20 bg-surface-2/60 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Baromètre des prix"
          titre="Savoir quand expédier, et à quel prix"
          texte="Un tableau de bord hebdomadaire des cours européens, produit par produit."
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
              <BadgeExemple />
            </div>

            {serie && (
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_240px]">
                <div className="h-72 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={serie.points} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="degrade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
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
                        tickFormatter={(n: number) => n.toFixed(1)}
                      />
                      <Tooltip
                        cursor={{ stroke: 'var(--muted)', strokeDasharray: '4 4' }}
                        contentStyle={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                          color: 'var(--text)',
                        }}
                        formatter={(val) => [`${Number(val).toFixed(2)} ${serie.unite}`, 'Prix']}
                      />
                      <Area
                        key={actif}
                        type="monotone"
                        dataKey="prix"
                        stroke="var(--brand)"
                        strokeWidth={2.5}
                        fill="url(#degrade)"
                        animationDuration={700}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                  <Stat label="Dernier prix" valeur={`${serie.points.at(-1)!.prix.toFixed(2)} ${serie.unite}`} />
                  <Stat
                    label="Sur une semaine"
                    valeur={`${v >= 0 ? '+' : ''}${v.toFixed(1)} %`}
                    ton={v >= 0 ? 'text-brand' : 'text-danger'}
                  />
                  <Stat label="Code SH" valeur={produit?.codeSH ?? '—'} />
                  <Stat label="Origines suivies" valeur={produit?.origines.join(', ') ?? '—'} petit />
                </dl>
              </div>
            )}
            {serie && <p className="mt-6 text-xs text-muted">Source : {serie.source}.</p>}
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
