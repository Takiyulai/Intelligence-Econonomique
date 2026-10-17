import EnTeteSection from './EnTeteSection'
import Reveal from './Reveal'

const sources = [
  { nom: 'Trade Map', org: 'ITC', apport: 'Tendances et parts de marché' },
  { nom: 'Global Trade Helpdesk', org: 'ITC · OMC · CNUCED', apport: 'Règles d’accès aux marchés' },
  { nom: 'RNM', org: 'FranceAgriMer', apport: 'Cotations des marchés de gros' },
  { nom: 'MANSA', org: 'Afreximbank', apport: 'Entreprises africaines vérifiées' },
]

export default function Sources() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Sources"
          titre="Des données institutionnelles, rendues lisibles"
          texte="Nous agrégeons et traduisons des bases publiques reconnues. Chaque chiffre publié cite sa source et sa date."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((s, i) => (
            <Reveal key={s.nom} delai={i * 0.08}>
              <div className="group h-full rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg">
                <p className="font-display text-lg font-bold">{s.nom}</p>
                <p className="text-sm text-muted">{s.org}</p>
                <p className="mt-4 text-sm font-medium text-brand">{s.apport}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
