import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'dashboard-theme'
const ThemeContext = createContext(null)

/** Lee el tema guardado; si no hay, usa la preferencia del sistema operativo. */
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage bloqueado (modo privado): seguimos con el valor por defecto
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  // Inicializador perezoso: localStorage se lee solo en el primer render
  const [theme, setTheme] = useState(getInitialTheme)

  // Efecto 1: sincroniza el tema con localStorage y con la clase del <body>
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // sin persistencia, pero la app sigue funcionando
    }
    document.body.classList.add(`theme-${theme}`)
    // Cleanup: quita la clase anterior antes de aplicar la nueva (o al desmontar)
    return () => document.body.classList.remove(`theme-${theme}`)
  }, [theme])

  // Efecto 2: si el usuario cambia el tema en OTRA pestaña, esta se actualiza
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage) // cleanup del listener
  }, [])

  // useCallback: la función mantiene la misma referencia entre renders
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  // useMemo: el objeto value solo cambia cuando cambia el tema,
  // así los consumidores no se re-renderizan por un objeto nuevo en cada render
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- patrón Provider + hook de consumo
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
