/**
 * Branch Modal Component
 * Modal for creating alternate timeline branches
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { useUIStore } from '@/lib/store/uiStore'
import { useTimelineStore } from '@/lib/store/timelineStore'
import type { GenerateBranchResponse } from '@/lib/types/api'

const SUGGESTED_SCENARIOS = [
  'What if this decision had the opposite outcome?',
  'What if they had chosen a different path at this moment?',
  'What if external circumstances had prevented this from happening?',
]

export function BranchModal() {
  const { branchModal, closeBranchModal, isGeneratingBranch, setGeneratingBranch } = useUIStore()
  const currentTimelineId = useTimelineStore(state => state.currentTimelineId)
  const getNodePath = useTimelineStore(state => state.getNodePath)
  const addBranch = useTimelineStore(state => state.addBranch)
  const node = useTimelineStore(state =>
    branchModal.nodeId ? state.getNodeById(branchModal.nodeId) : null
  )

  const [customScenario, setCustomScenario] = useState('')
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (branchModal.isOpen) {
      setCustomScenario('')
      setSelectedScenario(null)
      setError(null)
    }
  }, [branchModal.isOpen])

  const handleCreateBranch = async () => {
    if (!node || !branchModal.nodeId) return

    const scenario = selectedScenario || customScenario.trim()

    if (!scenario) {
      setError('Please select or enter an alternate scenario')
      return
    }

    setError(null)
    setGeneratingBranch(true)

    try {
      // Get the path from root to this node for context
      const path = getNodePath(branchModal.nodeId)

      const response = await fetch('/api/generate-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentNodeId: branchModal.nodeId,
          parentTimeline: path,
          alternateScenario: scenario,
          depth: node.depth,
        }),
      })

      const data: GenerateBranchResponse = await response.json()

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to generate branch')
      }

      // Add branch to timeline store
      addBranch(branchModal.nodeId, data.data.milestones, scenario)

      // Close modal
      closeBranchModal()
    } catch (err) {
      console.error('Error generating branch:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate branch')
    } finally {
      setGeneratingBranch(false)
    }
  }

  if (!branchModal.isOpen || !node) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBranchModal}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create Alternate Timeline
                  </h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore what could have happened differently
                </p>
              </div>
              <button
                onClick={closeBranchModal}
                className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Node Info */}
            <div className="mb-6 p-4 rounded-lg bg-white/10 dark:bg-black/20">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Branching from:
              </p>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {node.title}
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {node.date}
              </p>
            </div>

            {/* Suggested Scenarios */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Suggested Scenarios
              </h3>
              <div className="space-y-2">
                {SUGGESTED_SCENARIOS.map((scenario, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedScenario(scenario)
                      setCustomScenario('')
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedScenario === scenario
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/10 hover:border-purple-500/50'
                    }`}
                  >
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {scenario}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Scenario */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Or Create Your Own
              </h3>
              <textarea
                value={customScenario}
                onChange={(e) => {
                  setCustomScenario(e.target.value)
                  setSelectedScenario(null)
                }}
                placeholder="Describe your alternate scenario... (e.g., 'What if they had accepted the job offer in Paris instead?')"
                className="w-full px-4 py-3 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isGeneratingBranch}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={closeBranchModal}
                disabled={isGeneratingBranch}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleCreateBranch}
                disabled={isGeneratingBranch || (!selectedScenario && !customScenario.trim())}
                className="flex-1"
              >
                {isGeneratingBranch ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Create Branch'
                )}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
