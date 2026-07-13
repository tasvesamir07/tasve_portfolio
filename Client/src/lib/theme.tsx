'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeCtx = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
})

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('theme') as Theme | null
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [theme])

  const toggle = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeCtx)
}
