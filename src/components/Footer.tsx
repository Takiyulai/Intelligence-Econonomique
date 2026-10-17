import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted sm:flex-row sm:px-6">
        <Logo />
        <p>Intelligence économique agroalimentaire · Afrique de l'Ouest ↔ Europe</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
