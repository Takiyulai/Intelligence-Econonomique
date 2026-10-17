export default function BadgeExemple({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-accent/40 bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent ${className}`}
      title="Valeurs fictives de démonstration, pas des cotations réelles"
    >
      Données d'exemple
    </span>
  )
}
