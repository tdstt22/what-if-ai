/**
 * Input Component
 */

'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = `
      w-full px-4 py-3 rounded-lg
      bg-white/10 dark:bg-black/20
      border border-white/20 dark:border-white/10
      backdrop-blur-md
      text-gray-900 dark:text-white
      placeholder-gray-500 dark:placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400
      focus:border-transparent
      transition-all duration-200
    `

    const errorClasses = error
      ? 'border-red-500 focus:ring-red-500'
      : ''

    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
