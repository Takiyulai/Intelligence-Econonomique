export default function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" className="fill-brand" />
        <path d="M8 21c3-8 9-12 16-12-1 7-5 13-13 14l-3-2z" className="fill-accent" />
      </svg>
      <span>
        Agro<span className="text-brand">Corridor</span>
      </span>
    </a>
  )
}
