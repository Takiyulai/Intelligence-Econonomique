import Reveal from './Reveal'

export default function EnTeteSection({
  surtitre,
  titre,
  texte,
}: {
  surtitre: string
  titre: string
  texte?: string
}) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand">{surtitre}</p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{titre}</h2>
      {texte && <p className="mt-4 text-lg text-muted text-pretty">{texte}</p>}
    </Reveal>
  )
}
