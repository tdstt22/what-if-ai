'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Search } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { GlassCard } from '@/components/ui/GlassCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useTimelineStore } from '@/lib/store/timelineStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { GenerateTimelineResponse } from '@/lib/types/api'

export default function Home() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const initializeTimeline = useTimelineStore(state => state.initializeTimeline)
  const setGeneratingTimeline = useUIStore(state => state.setGeneratingTimeline)
  const isGenerating = useUIStore(state => state.isGeneratingTimeline)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchInput.trim()) {
      setError('Please enter a celebrity name')
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

      // Initialize timeline in store
      initializeTimeline(data.data.person, data.data.milestones)

      // Navigate to timeline view
      router.push('/timeline')
    } catch (err) {
      console.error('Error generating timeline:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate timeline')
    } finally {
      setGeneratingTimeline(false)
    }
  }

  return (
    <Container className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-16 h-16 text-cyan-500" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-[family-name:var(--font-space-grotesk)]">
            WhatIfAI
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4">
            Explore Alternate Timelines with AI
          </p>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover how history could have unfolded differently. Enter any celebrity or public figure
            and explore branching narratives of their life powered by Claude AI.
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlassCard className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="celebrity-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter a Celebrity or Public Figure
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="celebrity-search"
                    type="text"
                    placeholder="e.g., Albert Einstein, Marie Curie, Steve Jobs..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                    disabled={isGenerating}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isGenerating}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating Timeline...' : 'Generate Timeline'}
              </Button>
            </form>

            {error && (
              <div className="mt-4">
                <ErrorMessage
                  message={error}
                  onRetry={() => {
                    setError(null)
                    setSearchInput('')
                  }}
                />
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mt-12"
        >
          {[
            {
              title: '10 Key Milestones',
              description: 'AI generates a comprehensive timeline of major life events',
            },
            {
              title: 'Infinite Branches',
              description: 'Create alternate scenarios at any point in the timeline',
            },
            {
              title: 'Beautiful Visualization',
              description: 'Interactive, animated timeline with glassmorphic design',
            },
          ].map((feature, i) => (
            <GlassCard key={i} className="p-6 text-center" hover>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </Container>
  )
}
