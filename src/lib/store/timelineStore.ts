/**
 * Zustand store for timeline state management
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TimelineNode, CachedResponse, Milestone } from '../types/timeline'
import { generateId, getNodePath, getAllLeafNodes, getMaxDepth } from '../utils/helpers'

interface TimelineState {
  // Data (Normalized for O(1) lookups)
  nodes: {
    byId: Record<string, TimelineNode>
    allIds: string[]
    rootId: string | null
  }

  // Navigation
  currentPath: string[]
  selectedNodeId: string | null

  // UI State
  loading: boolean
  error: string | null

  // LLM Cache
  llmCache: Record<string, CachedResponse>

  // Current person being explored
  currentPerson: string | null

  // Actions
  initializeTimeline: (person: string, milestones: Milestone[]) => void
  addBranch: (parentId: string, milestones: Milestone[], alternateScenario: string) => void
  selectNode: (nodeId: string) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  clearTimeline: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed getters
  getNodePath: (nodeId: string) => TimelineNode[]
  getAllLeafNodes: () => TimelineNode[]
  getDepth: () => number
  getNodeById: (nodeId: string) => TimelineNode | undefined
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: { byId: {}, allIds: [], rootId: null },
      currentPath: [],
      selectedNodeId: null,
      loading: false,
      error: null,
      llmCache: {},
      currentPerson: null,

      // Initialize timeline with root node and milestones
      initializeTimeline: (person: string, milestones: Milestone[]) => {
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

        set({
          nodes: { byId: nodes, allIds, rootId },
          currentPath: [rootId],
          selectedNodeId: rootId,
          currentPerson: person,
          error: null,
        })
      },

      // Add a branch to a parent node
      addBranch: (parentId: string, milestones: Milestone[], alternateScenario: string) => {
        const state = get()
        const parent = state.nodes.byId[parentId]
        if (!parent) {
          console.error('Parent node not found')
          return
        }

        // Check depth limit
        if (parent.depth >= 10) {
          set({ error: 'Maximum branching depth (10) reached' })
          return
        }

        const updatedById = { ...state.nodes.byId }
        const updatedAllIds = [...state.nodes.allIds]
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

        set({
          nodes: {
            byId: updatedById,
            allIds: updatedAllIds,
            rootId: state.nodes.rootId,
          },
          error: null,
        })
      },

      // Select a node
      selectNode: (nodeId: string) => {
        const state = get()
        const node = state.nodes.byId[nodeId]
        if (!node) return

        const updatedById = { ...state.nodes.byId }

        // Deselect all nodes
        Object.keys(updatedById).forEach(id => {
          updatedById[id] = { ...updatedById[id], selected: false }
        })

        // Select the target node
        updatedById[nodeId] = { ...updatedById[nodeId], selected: true }

        set({
          nodes: {
            ...state.nodes,
            byId: updatedById,
          },
          selectedNodeId: nodeId,
          currentPath: getNodePath(updatedById, nodeId).map(n => n.id),
        })
      },

      // Expand a node to show its children
      expandNode: (nodeId: string) => {
        const state = get()
        const node = state.nodes.byId[nodeId]
        if (!node) return

        set({
          nodes: {
            ...state.nodes,
            byId: {
              ...state.nodes.byId,
              [nodeId]: { ...node, expanded: true },
            },
          },
        })
      },

      // Collapse a node to hide its children
      collapseNode: (nodeId: string) => {
        const state = get()
        const node = state.nodes.byId[nodeId]
        if (!node) return

        set({
          nodes: {
            ...state.nodes,
            byId: {
              ...state.nodes.byId,
              [nodeId]: { ...node, expanded: false },
            },
          },
        })
      },

      // Delete a node and all its descendants
      deleteNode: (nodeId: string) => {
        const state = get()
        const node = state.nodes.byId[nodeId]
        if (!node || !node.parentId) {
          console.error('Cannot delete root node or node not found')
          return
        }

        // Collect all descendant IDs
        const toDelete = new Set<string>([nodeId])
        const queue = [nodeId]

        while (queue.length > 0) {
          const currentId = queue.shift()!
          const current = state.nodes.byId[currentId]
          if (current) {
            current.childIds.forEach(childId => {
              toDelete.add(childId)
              queue.push(childId)
            })
          }
        }

        // Remove from parent's children
        const parent = state.nodes.byId[node.parentId]
        const updatedById = { ...state.nodes.byId }
        updatedById[node.parentId] = {
          ...parent,
          childIds: parent.childIds.filter(id => id !== nodeId),
        }

        // Delete all marked nodes
        toDelete.forEach(id => {
          delete updatedById[id]
        })

        const updatedAllIds = state.nodes.allIds.filter(id => !toDelete.has(id))

        set({
          nodes: {
            byId: updatedById,
            allIds: updatedAllIds,
            rootId: state.nodes.rootId,
          },
        })
      },

      // Clear the entire timeline
      clearTimeline: () => {
        set({
          nodes: { byId: {}, allIds: [], rootId: null },
          currentPath: [],
          selectedNodeId: null,
          currentPerson: null,
          error: null,
        })
      },

      // Set loading state
      setLoading: (loading: boolean) => set({ loading }),

      // Set error message
      setError: (error: string | null) => set({ error }),

      // Computed: Get node path
      getNodePath: (nodeId: string) => {
        const state = get()
        return getNodePath(state.nodes.byId, nodeId)
      },

      // Computed: Get all leaf nodes
      getAllLeafNodes: () => {
        const state = get()
        return getAllLeafNodes(state.nodes.byId)
      },

      // Computed: Get maximum depth
      getDepth: () => {
        const state = get()
        return getMaxDepth(state.nodes.byId)
      },

      // Computed: Get node by ID
      getNodeById: (nodeId: string) => {
        const state = get()
        return state.nodes.byId[nodeId]
      },
    }),
    {
      name: 'whatifai-timeline-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        nodes: state.nodes,
        currentPath: state.currentPath,
        llmCache: state.llmCache,
        currentPerson: state.currentPerson,
      }),
    }
  )
)
