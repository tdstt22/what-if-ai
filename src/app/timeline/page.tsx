/**
 * Timeline Page
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home } from 'lucide-react'
import { TimelineFlow } from '@/components/timeline/TimelineFlow'
import { BranchModal } from '@/components/timeline/BranchModal'
import { Button } from '@/components/ui/Button'
import { useTimelineStore } from '@/lib/store/timelineStore'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

export default function TimelinePage() {
  const router = useRouter()
  const { rootId, allIds } = useTimelineStore(state => state.nodes)
  const currentPerson = useTimelineStore(state => state.currentPerson)

  // Redirect to home if no timeline is loaded
  useEffect(() => {
    if (!rootId || allIds.length === 0) {
      router.push('/')
    }
  }, [rootId, allIds, router])

  if (!rootId || allIds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="!px-3"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>

          {currentPerson && (
            <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-4 py-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPerson}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {allIds.length} milestone{allIds.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
          Click any milestone to create an alternate branch
        </div>
      </motion.div>

      {/* Timeline Visualization */}
      <TimelineFlow />

      {/* Branch Modal */}
      <BranchModal />
    </div>
  )
}
