/**
 * Error Message Component
 */

'use client'

import { AlertCircle } from 'lucide-react'
import { GlassCard } from './GlassCard'
import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="primary" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
