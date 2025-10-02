/**
 * Theme Toggle Button
 */

'use client'

import { Sun, Moon } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const theme = useUIStore(state => state.theme)
  const toggleTheme = useUIStore(state => state.toggleTheme)

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 360, opacity: 1 }}
        transition={{ duration: 0.3 }}
        key={theme}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-yellow-400" />
        ) : (
          <Moon className="w-5 h-5 text-blue-600" />
        )}
      </motion.div>
    </motion.button>
  )
}
