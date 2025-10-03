/**
 * New Timeline Modal Component
 * Allows users to create a new timeline from the sidebar
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/lib/store/uiStore'
import { useTimelineStore } from '@/lib/store/timelineStore'
import type { GenerateTimelineResponse } from '@/lib/types/api'

export function NewTimelineModal() {
  const router = useRouter()
  const { newTimelineModalOpen, closeNewTimelineModal, setGeneratingTimeline, isGeneratingTimeline } = useUIStore()
  const saveTimeline = useTimelineStore(state => state.saveTimeline)

  const [searchInput, setSearchInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (newTimelineModalOpen) {
      setSearchInput('')
      setError(null)
    }
  }, [newTimelineModalOpen])

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && newTimelineModalOpen && !isGeneratingTimeline) {
        closeNewTimelineModal()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [newTimelineModalOpen, isGeneratingTimeline, closeNewTimelineModal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchInput.trim()) {
      setError('Please enter a person name')
      return
    }

    setError(null)
    setGeneratingTimeline(true)

    try {
      const response = await fetch('/api/generate-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ person: searchInput.trim() }),
      })

      const data: GenerateTimelineResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to generate timeline')
      }

      // Save timeline to store (creates new or switches to existing)
      saveTimeline(data.data.person, data.data.milestones)

      // Close modal
      closeNewTimelineModal()

      // Navigate to timeline view if not already there
      if (window.location.pathname !== '/timeline') {
        router.push('/timeline')
      }
    } catch (err) {
      console.error('Error generating timeline:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate timeline')
    } finally {
      setGeneratingTimeline(false)
    }
  }

  if (!newTimelineModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isGeneratingTimeline && closeNewTimelineModal()}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Timeline
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Enter a celebrity or public figure name
                </p>
              </div>
              <button
                onClick={closeNewTimelineModal}
                disabled={isGeneratingTimeline}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="e.g., Albert Einstein, Marie Curie..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                  disabled={isGeneratingTimeline}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeNewTimelineModal}
                  disabled={isGeneratingTimeline}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isGeneratingTimeline || !searchInput.trim()}
                  className="flex-1"
                >
                  {isGeneratingTimeline ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Create Timeline'
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
