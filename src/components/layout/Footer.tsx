/**
 * Footer Component
 */

'use client'

import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 dark:border-white/5 backdrop-blur-xl bg-white/50 dark:bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 WhatIfAI. Powered by Claude Sonnet 4.5
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
