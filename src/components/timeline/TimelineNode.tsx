/**
 * Custom Timeline Node Component for React Flow
 */

'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Calendar, Users, Zap, GitBranch } from 'lucide-react'
import { TimelineNode as TimelineNodeType } from '@/lib/types/timeline'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDate } from '@/lib/utils/helpers'
import { useUIStore } from '@/lib/store/uiStore'

function TimelineNodeComponent({ data }: NodeProps<TimelineNodeType>) {
  const openBranchModal = useUIStore(state => state.openBranchModal)
  const theme = useUIStore(state => state.theme)

  const handleBranchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openBranchModal(data.id)
  }

  const accentColor = data.type === 'original'
    ? (theme === 'dark' ? 'rgb(0, 240, 255)' : 'rgb(30, 144, 255)')
    : (theme === 'dark' ? 'rgb(183, 148, 244)' : 'rgb(159, 122, 234)')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white"
      />

      <GlassCard
        className="w-[300px] p-4 group cursor-pointer"
        hover
        onClick={handleBranchClick}
      >
        {/* Node Type Badge */}
        <div
          className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-md border"
          style={{
            backgroundColor: `${accentColor}20`,
            borderColor: `${accentColor}40`,
            color: accentColor,
          }}
        >
          {data.type === 'original' ? 'Original' : 'Alternate'}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(data.date)}</span>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold mb-2 line-clamp-2"
          style={{ color: accentColor }}
        >
          {data.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
          {data.description}
        </p>

        {/* Impact */}
        <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-white/10 dark:bg-black/20">
          <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {data.impact}
          </p>
        </div>

        {/* Key Figures */}
        {data.keyFigures.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span className="line-clamp-1">{data.keyFigures.join(', ')}</span>
          </div>
        )}

        {/* Branch Button (appears on hover) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button
            onClick={handleBranchClick}
            className="p-2 rounded-lg bg-purple-500/80 hover:bg-purple-600 text-white shadow-lg"
            aria-label="Create branch"
          >
            <GitBranch className="w-4 h-4" />
          </button>
        </motion.div>
      </GlassCard>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white"
      />
    </motion.div>
  )
}

export const TimelineNode = memo(TimelineNodeComponent)
