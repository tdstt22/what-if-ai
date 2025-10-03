/**
 * Zustand store for timeline state management
 * Refactored to support multiple saved timelines
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimelineNode, CachedResponse, Milestone, SavedTimeline } from '../types/timeline'
import { generateId, getNodePath, getAllLeafNodes, getMaxDepth } from '../utils/helpers'

const MAX_TIMELINES = 20 // Maximum number of saved timelines

interface TimelineState {
  // Multi-timeline support
  timelines: SavedTimeline[]
  currentTimelineId: string | null

  // UI State
  loading: boolean
  error: string | null

  // LLM Cache
  llmCache: Record<string, CachedResponse>

  // ============ NEW ACTIONS ============
  // Save a new timeline
  saveTimeline: (person: string, milestones: Milestone[]) => string // returns timeline ID

  // Switch to a different timeline
  switchTimeline: (timelineId: string) => void

  // Delete a timeline
  deleteTimeline: (timelineId: string) => void

  // Get all timelines (for sidebar)
  getAllTimelines: () => SavedTimeline[]

  // Get current timeline
  getCurrentTimeline: () => SavedTimeline | null

  // ============ EXISTING ACTIONS (updated to work with current timeline) ============
  addBranch: (parentId: string, milestones: Milestone[], alternateScenario: string) => void
  selectNode: (nodeId: string) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed getters
  getNodePath: (nodeId: string) => TimelineNode[]
  getAllLeafNodes: () => TimelineNode[]
  getDepth: () => number
  getNodeById: (nodeId: string) => TimelineNode | undefined
  getCurrentPerson: () => string | null
  getNodes: () => { byId: Record<string, TimelineNode>; allIds: string[]; rootId: string | null } | null
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      timelines: [],
      currentTimelineId: null,
      loading: false,
      error: null,
      llmCache: {},

      // ============ NEW ACTIONS IMPLEMENTATION ============

      // Save a new timeline
      saveTimeline: (person: string, milestones: Milestone[]) => {
        const state = get()

        // Check if timeline for this person already exists
        const existingTimeline = state.timelines.find(
          t => t.person.toLowerCase() === person.toLowerCase()
        )

        if (existingTimeline) {
          // Switch to existing timeline instead of creating duplicate
          set({ currentTimelineId: existingTimeline.id })
          return existingTimeline.id
        }

        // Generate new timeline ID
        const timelineId = generateId()
        const rootId = generateId()
        const nodes: Record<string, TimelineNode> = {}
        const allIds: string[] = []

        // Create nodes for each milestone
        milestones.forEach((milestone, index) => {
          const nodeId = index === 0 ? rootId : generateId()
          const parentId = index === 0 ? null : allIds[index - 1]

          const node: TimelineNode = {
            id: nodeId,
            parentId,
            childIds: [],
            depth: index,
            title: milestone.title,
            date: milestone.date,
            description: milestone.description,
            impact: milestone.impact,
            keyFigures: milestone.keyFigures,
            type: 'original',
            createdAt: Date.now(),
            expanded: true,
            selected: false,
          }

          nodes[nodeId] = node
          allIds.push(nodeId)

          // Update parent's children
          if (parentId && nodes[parentId]) {
            nodes[parentId].childIds.push(nodeId)
          }
        })

        // Create new saved timeline
        const newTimeline: SavedTimeline = {
          id: timelineId,
          person,
          nodes: { byId: nodes, allIds, rootId },
          currentPath: [rootId],
          createdAt: Date.now(),
          lastAccessed: Date.now(),
          milestoneCount: allIds.length,
        }

        // Add to timelines array
        let updatedTimelines = [...state.timelines, newTimeline]

        // Enforce max timelines limit (FIFO)
        if (updatedTimelines.length > MAX_TIMELINES) {
          // Remove oldest timeline (by createdAt)
          updatedTimelines.sort((a, b) => a.createdAt - b.createdAt)
          updatedTimelines = updatedTimelines.slice(1)
        }

        set({
          timelines: updatedTimelines,
          currentTimelineId: timelineId,
          error: null,
        })

        return timelineId
      },

      // Switch to a different timeline
      switchTimeline: (timelineId: string) => {
        const state = get()
        const timeline = state.timelines.find(t => t.id === timelineId)

        if (!timeline) {
          console.error('Timeline not found:', timelineId)
          return
        }

        // Update lastAccessed
        const updatedTimelines = state.timelines.map(t =>
          t.id === timelineId
            ? { ...t, lastAccessed: Date.now() }
            : t
        )

        set({
          timelines: updatedTimelines,
          currentTimelineId: timelineId,
        })
      },

      // Delete a timeline
      deleteTimeline: (timelineId: string) => {
        const state = get()
        const updatedTimelines = state.timelines.filter(t => t.id !== timelineId)

        // If we deleted the current timeline, switch to the most recent one
        let newCurrentId = state.currentTimelineId
        if (state.currentTimelineId === timelineId) {
          if (updatedTimelines.length > 0) {
            // Switch to most recently accessed timeline
            const sorted = [...updatedTimelines].sort((a, b) => b.lastAccessed - a.lastAccessed)
            newCurrentId = sorted[0].id
          } else {
            newCurrentId = null
          }
        }

        set({
          timelines: updatedTimelines,
          currentTimelineId: newCurrentId,
        })
      },

      // Get all timelines (for sidebar)
      getAllTimelines: () => {
        const state = get()
        // Return sorted by last accessed (most recent first)
        return [...state.timelines].sort((a, b) => b.lastAccessed - a.lastAccessed)
      },

      // Get current timeline
      getCurrentTimeline: () => {
        const state = get()
        if (!state.currentTimelineId) return null
        return state.timelines.find(t => t.id === state.currentTimelineId) || null
      },

      // ============ EXISTING ACTIONS (updated) ============

      // Add a branch to a parent node in current timeline
      addBranch: (parentId: string, milestones: Milestone[], alternateScenario: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()

        if (!currentTimeline) {
          console.error('No current timeline')
          return
        }

        const parent = currentTimeline.nodes.byId[parentId]
        if (!parent) {
          console.error('Parent node not found')
          return
        }

        // Check depth limit
        if (parent.depth >= 10) {
          set({ error: 'Maximum branching depth (10) reached' })
          return
        }

        const updatedById = { ...currentTimeline.nodes.byId }
        const updatedAllIds = [...currentTimeline.nodes.allIds]
        const newNodeIds: string[] = []

        // Create new nodes for the branch
        milestones.forEach((milestone, index) => {
          const nodeId = generateId()
          const nodeParentId = index === 0 ? parentId : newNodeIds[index - 1]

          const node: TimelineNode = {
            id: nodeId,
            parentId: nodeParentId,
            childIds: [],
            depth: parent.depth + index + 1,
            title: milestone.title,
            date: milestone.date,
            description: milestone.description,
            impact: milestone.impact,
            keyFigures: milestone.keyFigures,
            type: 'alternate',
            createdAt: Date.now(),
            expanded: true,
            selected: false,
          }

          updatedById[nodeId] = node
          updatedAllIds.push(nodeId)
          newNodeIds.push(nodeId)

          // Update parent's children
          if (index === 0) {
            updatedById[parentId] = {
              ...updatedById[parentId],
              childIds: [...updatedById[parentId].childIds, nodeId],
            }
          } else {
            const prevNodeId = newNodeIds[index - 1]
            updatedById[prevNodeId].childIds.push(nodeId)
          }
        })

        // Update the timeline in the array
        const updatedTimelines = state.timelines.map(t =>
          t.id === state.currentTimelineId
            ? {
                ...t,
                nodes: {
                  byId: updatedById,
                  allIds: updatedAllIds,
                  rootId: currentTimeline.nodes.rootId,
                },
                milestoneCount: updatedAllIds.length,
                lastAccessed: Date.now(),
              }
            : t
        )

        set({
          timelines: updatedTimelines,
          error: null,
        })
      },

      // Select a node
      selectNode: (nodeId: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return

        const node = currentTimeline.nodes.byId[nodeId]
        if (!node) return

        const updatedById = { ...currentTimeline.nodes.byId }

        // Deselect all nodes
        Object.keys(updatedById).forEach(id => {
          updatedById[id] = { ...updatedById[id], selected: false }
        })

        // Select the target node
        updatedById[nodeId] = { ...updatedById[nodeId], selected: true }

        const updatedTimelines = state.timelines.map(t =>
          t.id === state.currentTimelineId
            ? {
                ...t,
                nodes: {
                  ...currentTimeline.nodes,
                  byId: updatedById,
                },
                currentPath: getNodePath(updatedById, nodeId).map(n => n.id),
              }
            : t
        )

        set({ timelines: updatedTimelines })
      },

      // Expand a node
      expandNode: (nodeId: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return

        const node = currentTimeline.nodes.byId[nodeId]
        if (!node) return

        const updatedTimelines = state.timelines.map(t =>
          t.id === state.currentTimelineId
            ? {
                ...t,
                nodes: {
                  ...currentTimeline.nodes,
                  byId: {
                    ...currentTimeline.nodes.byId,
                    [nodeId]: { ...node, expanded: true },
                  },
                },
              }
            : t
        )

        set({ timelines: updatedTimelines })
      },

      // Collapse a node
      collapseNode: (nodeId: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return

        const node = currentTimeline.nodes.byId[nodeId]
        if (!node) return

        const updatedTimelines = state.timelines.map(t =>
          t.id === state.currentTimelineId
            ? {
                ...t,
                nodes: {
                  ...currentTimeline.nodes,
                  byId: {
                    ...currentTimeline.nodes.byId,
                    [nodeId]: { ...node, expanded: false },
                  },
                },
              }
            : t
        )

        set({ timelines: updatedTimelines })
      },

      // Delete a node and all its descendants
      deleteNode: (nodeId: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return

        const node = currentTimeline.nodes.byId[nodeId]
        if (!node || !node.parentId) {
          console.error('Cannot delete root node or node not found')
          return
        }

        // Collect all descendant IDs
        const toDelete = new Set<string>([nodeId])
        const queue = [nodeId]

        while (queue.length > 0) {
          const currentId = queue.shift()!
          const current = currentTimeline.nodes.byId[currentId]
          if (current) {
            current.childIds.forEach(childId => {
              toDelete.add(childId)
              queue.push(childId)
            })
          }
        }

        // Remove from parent's children
        const parent = currentTimeline.nodes.byId[node.parentId]
        const updatedById = { ...currentTimeline.nodes.byId }
        updatedById[node.parentId] = {
          ...parent,
          childIds: parent.childIds.filter(id => id !== nodeId),
        }

        // Delete all marked nodes
        toDelete.forEach(id => {
          delete updatedById[id]
        })

        const updatedAllIds = currentTimeline.nodes.allIds.filter(id => !toDelete.has(id))

        const updatedTimelines = state.timelines.map(t =>
          t.id === state.currentTimelineId
            ? {
                ...t,
                nodes: {
                  byId: updatedById,
                  allIds: updatedAllIds,
                  rootId: currentTimeline.nodes.rootId,
                },
                milestoneCount: updatedAllIds.length,
              }
            : t
        )

        set({ timelines: updatedTimelines })
      },

      // Set loading state
      setLoading: (loading: boolean) => set({ loading }),

      // Set error message
      setError: (error: string | null) => set({ error }),

      // ============ COMPUTED GETTERS ============

      // Get node path
      getNodePath: (nodeId: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return []
        return getNodePath(currentTimeline.nodes.byId, nodeId)
      },

      // Get all leaf nodes
      getAllLeafNodes: () => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return []
        return getAllLeafNodes(currentTimeline.nodes.byId)
      },

      // Get maximum depth
      getDepth: () => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return 0
        return getMaxDepth(currentTimeline.nodes.byId)
      },

      // Get node by ID
      getNodeById: (nodeId: string) => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        if (!currentTimeline) return undefined
        return currentTimeline.nodes.byId[nodeId]
      },

      // Get current person
      getCurrentPerson: () => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        return currentTimeline?.person || null
      },

      // Get nodes (for backwards compatibility)
      getNodes: () => {
        const state = get()
        const currentTimeline = state.getCurrentTimeline()
        return currentTimeline?.nodes || null
      },
    }),
    {
      name: 'whatifai-timeline-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        timelines: state.timelines,
        currentTimelineId: state.currentTimelineId,
        llmCache: state.llmCache,
      }),
    }
  )
)
