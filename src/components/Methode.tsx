import { motion } from 'motion/react'
import { ClipboardCheck, Send, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Reveal from './Reveal'

// Les étapes réelles du baromètre hebdomadaire (workflow n8n « 01 Baromètre mangue »).
const etapes: { icone: LucideIcon; titre: string; texte: string; repere: string }[] = [
  {
    icone: ClipboardCheck,
    titre: 'Relevé des cotations',
    texte:
      "Chaque vendredi, les prix grossistes de la mangue sont relevés sur le RNM de FranceAgriMer, par origine et par variété, puis contrôlés avant d'être enregistrés.",
    repere: 'RNM · stade grossiste · €/kg',
  },
  {
    icone: Sparkles,
    titre: 'Lecture de la semaine',
    texte:
      "Le prix moyen est calculé, puis une IA rédige trois phrases de lecture à partir des seuls chiffres. Elle commente, elle ne calcule rien et n'invente rien.",
    repere: 'Moyenne hebdo · semaine ISO',
  },
  {
    icone: Send,
    titre: 'Diffusion',
    texte:
      'Le baromètre de ce site se met à jour et le bulletin part vers les abonnés, par WhatsApp ou par e-mail, avec la source et la date de chaque chiffre.',
    repere: 'Vendredi soir',
  },
]

export default function Methode() {
  return (
    <section id="methode" className="scroll-mt-20 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand">Méthode</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Du marché de Rungis à votre téléphone, chaque semaine
          </h2>
          <p className="mt-4 text-lg text-muted text-pretty">
            Une chaîne courte et vérifiable : chaque prix publié renvoie à une cotation officielle datée.
          </p>
        </Reveal>

        <ol className="relative space-y-6">
          <span aria-hidden className="absolute bottom-8 left-[23px] top-8 w-px bg-line" />
          {etapes.map((e, i) => (
            <motion.li
              key={e.titre}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex gap-5"
            >
              <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-brand shadow-sm transition-colors duration-300 group-hover:border-brand/50 group-hover:bg-brand-soft">
                <e.icone size={20} />
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-line bg-surface p-5 transition-shadow duration-300 group-hover:shadow-lg">
                <p className="text-xs font-semibold tabular-nums text-muted">Étape {i + 1}</p>
                <h3 className="mt-1 font-display text-lg font-bold">{e.titre}</h3>
                <p className="mt-2 text-muted text-pretty">{e.texte}</p>
                <p className="mt-4 inline-flex rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink">
                  {e.repere}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}
