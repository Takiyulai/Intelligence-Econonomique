import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const lire = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(lire)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const basculer = useCallback(() => {
    setTheme((t) => {
      const suivant = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', suivant)
      } catch {
        /* stockage indisponible : le choix vaut pour la session */
      }
      return suivant
    })
  }, [])

  return { theme, basculer }
}
