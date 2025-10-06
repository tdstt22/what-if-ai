/**
 * Custom Timeline Node Component for React Flow
 */

'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { Calendar, Users, Zap, GitBranch, Expand } from 'lucide-react'
import { TimelineNode as TimelineNodeType } from '@/lib/types/timeline'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDate } from '@/lib/utils/helpers'
import { useUIStore } from '@/lib/store/uiStore'

function TimelineNodeComponent({ data }: NodeProps<TimelineNodeType>) {
  const openBranchModal = useUIStore(state => state.openBranchModal)
  const openNodeDetail = useUIStore(state => state.openNodeDetail)
  const theme = useUIStore(state => state.theme)

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    openNodeDetail(data.id)
  }

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
      className="relative group"
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-cyan-500 !w-3 !h-3 !border-2 !border-white"
      />

      {/* Neon Glow Effect - Outer Glow (appears on hover) */}
      <div
        className="absolute -inset-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl"
        style={{
          background: `radial-gradient(circle at center, ${accentColor} 0%, ${accentColor}80 30%, ${accentColor}40 50%, transparent 70%)`,
        }}
      />

      {/* Neon Border Glow (appears on hover) */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}60, 0 0 90px ${accentColor}40, inset 0 0 30px ${accentColor}20`,
          border: `2px solid ${accentColor}`,
        }}
      />

      <GlassCard
        className="w-[300px] p-4 cursor-pointer relative z-10"
        hover
        onClick={handleExpandClick}
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

        {/* Action Buttons (appear on hover) */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={handleExpandClick}
            className="p-2 rounded-lg bg-cyan-500/80 hover:bg-cyan-600 text-white shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Expand details"
          >
            <Expand className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={handleBranchClick}
            className="p-2 rounded-lg bg-purple-500/80 hover:bg-purple-600 text-white shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Create branch"
          >
            <GitBranch className="w-4 h-4" />
          </motion.button>
        </div>
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
