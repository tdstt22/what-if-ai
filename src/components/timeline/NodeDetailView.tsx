/**
 * Node Detail View Component
 * Shows full node information in a side panel (desktop) or full-screen (mobile)
 */

'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Users, Zap, GitBranch, Maximize2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/store/uiStore'
import { useTimelineStore } from '@/lib/store/timelineStore'
import { formatDate } from '@/lib/utils/helpers'

export function NodeDetailView() {
  const { nodeDetail, closeNodeDetail, openBranchModal } = useUIStore()
  const currentTimelineId = useTimelineStore(state => state.currentTimelineId)
  const node = useTimelineStore(state =>
    nodeDetail.nodeId ? state.getNodeById(nodeDetail.nodeId) : null
  )
  const theme = useUIStore(state => state.theme)

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && nodeDetail.isOpen) {
        closeNodeDetail()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [nodeDetail.isOpen, closeNodeDetail])

  // Prevent body scroll when open
  useEffect(() => {
    if (nodeDetail.isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [nodeDetail.isOpen])

  const handleCreateBranch = () => {
    if (nodeDetail.nodeId) {
      closeNodeDetail()
      openBranchModal(nodeDetail.nodeId)
    }
  }

  if (!nodeDetail.isOpen || !node) return null

  const accentColor = node.type === 'original'
    ? (theme === 'dark' ? 'rgb(0, 240, 255)' : 'rgb(30, 144, 255)')
    : (theme === 'dark' ? 'rgb(183, 148, 244)' : 'rgb(159, 122, 234)')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop - click to close on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeNodeDetail}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm md:cursor-pointer"
        />

        {/* Side Panel (Desktop) / Full Screen (Mobile) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative ml-auto w-full md:w-[600px] lg:w-[700px] h-full overflow-y-auto bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 backdrop-blur-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md -mx-6 -mt-6 md:-mx-8 md:-mt-8 px-6 md:px-8 py-4 border-b border-gray-200 dark:border-gray-700 z-10">
              <div className="flex items-center gap-3">
                <Maximize2 className="w-6 h-6" style={{ color: accentColor }} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Milestone Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Full information view
                  </p>
                </div>
              </div>
              <button
                onClick={closeNodeDetail}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close detail view"
              >
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Type Badge */}
            <div className="flex items-center gap-3">
              <div
                className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border"
                style={{
                  backgroundColor: `${accentColor}20`,
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
              >
                {node.type === 'original' ? '🌟 Original Timeline' : '🔀 Alternate Timeline'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Depth: Level {node.depth}
              </div>
            </div>

            {/* Date */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <Calendar className="w-6 h-6" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDate(node.date)}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Title */}
            <div>
              <h3
                className="text-3xl font-bold mb-2 leading-tight"
                style={{ color: accentColor }}
              >
                {node.title}
              </h3>
            </div>

            {/* Description */}
            <GlassCard className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  What Happened
                </h4>
              </div>
              <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {node.description}
              </p>
            </GlassCard>

            {/* Impact */}
            <GlassCard className="p-6 border-2" style={{ borderColor: `${accentColor}40` }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Impact & Significance
                </h4>
              </div>
              <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {node.impact}
              </p>
            </GlassCard>

            {/* Key Figures */}
            {node.keyFigures.length > 0 && (
              <GlassCard className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Key People Involved
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {node.keyFigures.map((person, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 rounded-lg bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200"
                    >
                      {person}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Actions */}
            <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 md:px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={closeNodeDetail}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateBranch}
                  className="flex-1"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Branch
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
