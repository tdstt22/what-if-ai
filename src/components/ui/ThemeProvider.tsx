/**
 * Theme Provider Component
 * Syncs theme with DOM and provides context
 */

'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/lib/store/uiStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore(state => state.theme)
  const setTheme = useUIStore(state => state.setTheme)

  useEffect(() => {
    // Check for saved theme or system preference on mount
    const savedTheme = localStorage.getItem('whatifai-ui-storage')

    if (!savedTheme) {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    } else {
      // Sync DOM with stored theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme, setTheme])

  return <>{children}</>
}
