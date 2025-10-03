/**
 * Timeline Sidebar Component
 * Shows list of saved timelines with navigation
 */

'use client'

import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'
import { Home, Trash2, Clock, Plus, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { useTimelineStore } from '@/lib/store/timelineStore'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function TimelineSidebar() {
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebarCollapse, openNewTimelineModal } = useUIStore()
  const allTimelines = useTimelineStore(state => state.timelines)
  const switchTimeline = useTimelineStore(state => state.switchTimeline)
  const deleteTimeline = useTimelineStore(state => state.deleteTimeline)
  const currentTimelineId = useTimelineStore(state => state.currentTimelineId)
  const theme = useUIStore(state => state.theme)

  // Sort timelines by lastAccessed (memoized to avoid infinite re-renders)
  const timelines = useMemo(() => {
    return [...allTimelines].sort((a, b) => b.lastAccessed - a.lastAccessed)
  }, [allTimelines])

  const handleTimelineClick = (timelineId: string) => {
    switchTimeline(timelineId)
  }

  const handleDeleteTimeline = (e: React.MouseEvent, timelineId: string) => {
    e.stopPropagation()
    if (confirm('Delete this timeline?')) {
      deleteTimeline(timelineId)
      // If no timelines left, go home
      if (timelines.length === 1) {
        router.push('/')
      }
    }
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  const accentColor = theme === 'dark' ? 'rgb(0, 240, 255)' : 'rgb(30, 144, 255)'

  return (
    <>
      {/* Sidebar - Always visible */}
      <div
        className={`
          fixed left-0 top-0 bottom-0 z-50
          ${sidebarCollapsed ? 'w-16' : 'w-80'}
          bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90
          backdrop-blur-xl shadow-2xl
          border-r border-gray-200 dark:border-gray-700
          overflow-y-auto
          transition-all duration-300
        `}
      >
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-4`}>
          {/* Logo/Header with Theme Toggle and Collapse Button */}
          <div className={`flex items-center ${sidebarCollapsed ? 'flex-col gap-4' : 'justify-between'} mb-2 py-2`}>
            {sidebarCollapsed ? (
              <>
                {/* Collapsed: Logo icon and expand button */}
                <Link href="/" className="w-full flex justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-500" />
                </Link>
                <button
                  onClick={toggleSidebarCollapse}
                  className="p-2 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200"
                  aria-label="Expand sidebar"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </>
            ) : (
              <>
                {/* Expanded: Full logo */}
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Sparkles className="w-7 h-7 text-cyan-500" />
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                      WhatIfAI
                    </h1>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400">
                      Explore Alternate Timelines
                    </p>
                  </div>
                </Link>
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Collapse Button */}
                  <button
                    onClick={toggleSidebarCollapse}
                    className="p-2 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200"
                    aria-label="Collapse sidebar"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  {/* Theme Toggle */}
                  <ThemeToggle />
                </div>
              </>
            )}
          </div>

          {/* Home Button */}
          {sidebarCollapsed ? (
            <button
              onClick={handleHomeClick}
              className="w-full p-2 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200"
              aria-label="Home"
              title="Home"
            >
              <Home className="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300" />
            </button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleHomeClick}
              className="w-full justify-start"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}

          {/* New Timeline Button */}
          {sidebarCollapsed ? (
            <button
              onClick={openNewTimelineModal}
              className="w-full p-2 rounded-lg bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-200"
              aria-label="New Timeline"
              title="New Timeline"
            >
              <Plus className="w-5 h-5 mx-auto text-gray-700 dark:text-gray-300" />
            </button>
          ) : (
            <Button
              variant="ghost"
              onClick={openNewTimelineModal}
              className="w-full justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Timeline
            </Button>
          )}

          {/* Divider */}
          {!sidebarCollapsed && (
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
          )}

          {/* Section Header */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 px-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Saved Timelines
              </p>
            </div>
          )}

          {/* Timeline List - Only show when expanded */}
          {!sidebarCollapsed && (
            <>
              {timelines.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No saved timelines yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Search for a person to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timelines.map((timeline) => {
                    const isActive = timeline.id === currentTimelineId

                    return (
                      <div key={timeline.id}>
                        <GlassCard
                          className={`
                            p-3 cursor-pointer group relative
                            transition-all duration-200
                            ${isActive ? 'ring-2' : 'hover:bg-white/20 dark:hover:bg-black/30'}
                          `}
                          style={isActive ? { ringColor: accentColor } : undefined}
                          onClick={() => handleTimelineClick(timeline.id)}
                        >
                          {/* Active Indicator */}
                          {isActive && (
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}

                          <div className="flex items-start justify-between gap-2 ml-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className={`
                                  text-sm font-semibold truncate
                                  ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}
                                `}
                                style={isActive ? { color: accentColor } : undefined}
                              >
                                {timeline.person}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {timeline.milestoneCount} milestones
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  •
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {getRelativeTime(timeline.lastAccessed)}
                                </span>
                              </div>
                            </div>

                            {/* Delete Button (appears on hover) */}
                            <button
                              onClick={(e) => handleDeleteTimeline(e, timeline.id)}
                              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                              aria-label="Delete timeline"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </GlassCard>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Footer Info */}
          {timelines.length > 0 && !sidebarCollapsed && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                {timelines.length} / 20 timelines saved
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Helper function to get relative time
function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
