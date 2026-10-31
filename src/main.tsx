import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/manrope'
import '@fontsource-variable/bricolage-grotesque'
import './index.css'
import App from './App'

// Trois pages : la landing page, la connexion et l'espace membre (chargés à part : ils embarquent le client Supabase).
const Connexion = lazy(() => import('./pages/Connexion'))
const Espace = lazy(() => import('./pages/Espace'))
const chemin = window.location.pathname.replace(/\/+$/, '') || '/'
const Page = chemin === '/espace' ? Espace : chemin === '/connexion' ? Connexion : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-screen" />}>
      <Page />
    </Suspense>
  </StrictMode>,
)
