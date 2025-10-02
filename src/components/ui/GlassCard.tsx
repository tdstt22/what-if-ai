/**
 * Glassmorphic Card Component
 */

'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  const baseClasses = `
    backdrop-blur-md bg-white/10 dark:bg-black/20
    border border-white/20 dark:border-white/10
    rounded-xl shadow-lg
    transition-all duration-300
  `

  const hoverClasses = hover
    ? 'hover:bg-white/20 dark:hover:bg-black/30 hover:border-white/30 dark:hover:border-white/20 hover:shadow-xl cursor-pointer'
    : ''

  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}
