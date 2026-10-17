import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Piliers from './components/Piliers'
import Alertes from './components/Alertes'
import Sources from './components/Sources'
import Offres from './components/Offres'
import AppelAction from './components/AppelAction'
import Footer from './components/Footer'

// Chargé à part : la librairie de graphiques est lourde.
const Barometre = lazy(() => import('./components/Barometre'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <Navbar />
      <main id="contenu">
        <Hero />
        <Piliers />
        <Suspense fallback={<div id="barometre" className="min-h-[600px]" />}>
          <Barometre />
        </Suspense>
        <Alertes />
        <Sources />
        <Offres />
        <AppelAction />
      </main>
      <Footer />
    </MotionConfig>
  )
}
