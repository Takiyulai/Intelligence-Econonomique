import BadgeExemple from './BadgeExemple'
import { dateCourte } from '../services/marketData'
import type { SeriePrix } from '../data/types'

/** Indique d'un coup d'œil si la série affichée est réelle (et de quand) ou d'exemple. */
export default function StatutDonnees({ serie }: { serie: SeriePrix }) {
  if (serie.exemple) return <BadgeExemple />
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-brand" />
      </span>
      Cotations réelles{serie.majLe ? ` · ${dateCourte(serie.majLe)}` : ''}
    </span>
  )
}
