import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

function initialTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem('sit-or-jump-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem('sit-or-jump-theme', theme)
    } catch {
      // The selected theme still works when storage is unavailable.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggleTheme }
}
