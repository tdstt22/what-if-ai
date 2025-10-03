/**
 * Timeline Page
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TimelineFlow } from '@/components/timeline/TimelineFlow'
import { BranchModal } from '@/components/timeline/BranchModal'
import { NodeDetailView } from '@/components/timeline/NodeDetailView'
import { TimelineSidebar } from '@/components/timeline/TimelineSidebar'
import { NewTimelineModal } from '@/components/timeline/NewTimelineModal'
import { useTimelineStore } from '@/lib/store/timelineStore'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

export default function TimelinePage() {
  const router = useRouter()
  const currentTimelineId = useTimelineStore(state => state.currentTimelineId)
  const nodes = useTimelineStore(state => state.getNodes())
  const currentPerson = useTimelineStore(state => state.getCurrentPerson())

  // Redirect to home if no timeline is loaded
  useEffect(() => {
    if (!nodes || !nodes.rootId || nodes.allIds.length === 0) {
      router.push('/')
    }
  }, [nodes, router])

  if (!nodes || !nodes.rootId || nodes.allIds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      {/* Sidebar */}
      <TimelineSidebar />

      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-10"
      >
        <div className="backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
          Click milestone to view details • Hover for actions
        </div>
      </motion.div>

      {/* Timeline Visualization */}
      <TimelineFlow />

      {/* Node Detail View */}
      <NodeDetailView />

      {/* Branch Modal */}
      <BranchModal />

      {/* New Timeline Modal */}
      <NewTimelineModal />
    </div>
  )
}
