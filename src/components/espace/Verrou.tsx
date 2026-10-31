import { Lock } from 'lucide-react'
import { lienPremium } from '../../services/espace'

/** Encadré « réservé aux abonnés » avec le bouton pour passer Premium. */
export default function Verrou({ titre, texte, email }: { titre: string; texte: string; email: string }) {
  const lien = lienPremium(email)
  return (
    <div className="rounded-2xl border border-dashed border-accent/50 bg-accent-soft/60 p-5">
      <p className="flex items-center gap-2 font-semibold">
        <Lock size={16} className="text-accent" />
        {titre}
      </p>
      <p className="mt-1 text-sm text-muted">{texte}</p>
      <a
        href={lien.href}
        target={lien.externe ? '_blank' : undefined}
        rel={lien.externe ? 'noreferrer' : undefined}
        className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#1a1203] transition-transform hover:-translate-y-0.5"
      >
        Passer à Premium
      </a>
    </div>
  )
}
