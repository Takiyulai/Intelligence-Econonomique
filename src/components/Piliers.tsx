import { BarChart3, ShieldCheck, Ship } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import EnTeteSection from './EnTeteSection'
import Reveal from './Reveal'
import TiltCard from './TiltCard'

const piliers: { icone: LucideIcon; titre: string; frequence: string; texte: string }[] = [
  {
    icone: BarChart3,
    titre: 'Prix des marchés',
    frequence: 'Chaque semaine',
    texte: "Les cours grossistes à Rungis et Rotterdam pour fixer vos prix d'achat local et vos offres export.",
  },
  {
    icone: Ship,
    titre: 'Volumes et flux',
    frequence: 'Chaque mois',
    texte: 'Les importations européennes par pays et par produit pour anticiper saturations et pénuries de conteneurs.',
  },
  {
    icone: ShieldCheck,
    titre: 'Normes et certifications',
    frequence: 'En alerte',
    texte: 'Les changements de règles sanitaires et phytosanitaires de l’UE, résumés en actions à mener.',
  },
]

export default function Piliers() {
  return (
    <section id="piliers" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <EnTeteSection
          surtitre="Le service"
          titre="L'information qui compte, au bon rythme"
          texte="Pour les produits périssables, la valeur n'est pas dans la seconde près mais dans une information fraîche et régulière."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {piliers.map((p, i) => (
            <Reveal key={p.titre} delai={i * 0.1}>
              <TiltCard className="h-full">
                <article className="group h-full rounded-3xl border border-line bg-surface p-7 transition-colors hover:border-brand/40">
                  <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <p.icone size={22} />
                  </span>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-accent">{p.frequence}</p>
                  <h3 className="mt-2 font-display text-xl font-bold">{p.titre}</h3>
                  <p className="mt-3 text-muted">{p.texte}</p>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
