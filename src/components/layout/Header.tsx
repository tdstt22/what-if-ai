/**
 * Header Component
 */

'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { motion } from 'framer-motion'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 dark:border-white/5 backdrop-blur-xl bg-white/50 dark:bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-8 h-8 text-cyan-500" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                WhatIfAI
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Explore Alternate Timelines
              </p>
            </div>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
