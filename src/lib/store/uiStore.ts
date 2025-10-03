/**
 * Zustand store for UI state (theme, modals, etc.)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface BranchModalState {
  isOpen: boolean
  nodeId: string | null
}

interface NodeDetailState {
  isOpen: boolean
  nodeId: string | null
}

interface UIState {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // Branch Modal
  branchModal: BranchModalState
  openBranchModal: (nodeId: string) => void
  closeBranchModal: () => void

  // Node Detail View
  nodeDetail: NodeDetailState
  openNodeDetail: (nodeId: string) => void
  closeNodeDetail: () => void

  // New Timeline Modal
  newTimelineModalOpen: boolean
  openNewTimelineModal: () => void
  closeNewTimelineModal: () => void

  // Loading overlay for API calls
  isGeneratingTimeline: boolean
  isGeneratingBranch: boolean
  setGeneratingTimeline: (loading: boolean) => void
  setGeneratingBranch: (loading: boolean) => void

  // Sidebar (for timeline history, if needed)
  sidebarOpen: boolean
  toggleSidebar: () => void
  sidebarCollapsed: boolean
  toggleSidebarCollapse: () => void

  // Zoom controls visibility
  showControls: boolean
  setShowControls: (show: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'dark',

      setTheme: (theme: Theme) => {
        set({ theme })
        // Update document class for Tailwind dark mode
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },

      // Branch Modal
      branchModal: {
        isOpen: false,
        nodeId: null,
      },

      openBranchModal: (nodeId: string) => {
        set({
          branchModal: {
            isOpen: true,
            nodeId,
          },
        })
      },

      closeBranchModal: () => {
        set({
          branchModal: {
            isOpen: false,
            nodeId: null,
          },
        })
      },

      // Node Detail View
      nodeDetail: {
        isOpen: false,
        nodeId: null,
      },

      openNodeDetail: (nodeId: string) => {
        set({
          nodeDetail: {
            isOpen: true,
            nodeId,
          },
        })
      },

      closeNodeDetail: () => {
        set({
          nodeDetail: {
            isOpen: false,
            nodeId: null,
          },
        })
      },

      // New Timeline Modal
      newTimelineModalOpen: false,

      openNewTimelineModal: () => {
        set({ newTimelineModalOpen: true })
      },

      closeNewTimelineModal: () => {
        set({ newTimelineModalOpen: false })
      },

      // Loading states
      isGeneratingTimeline: false,
      isGeneratingBranch: false,

      setGeneratingTimeline: (loading: boolean) => {
        set({ isGeneratingTimeline: loading })
      },

      setGeneratingBranch: (loading: boolean) => {
        set({ isGeneratingBranch: loading })
      },

      // Sidebar (default closed to avoid hydration issues)
      sidebarOpen: false,

      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }))
      },

      sidebarCollapsed: false,

      toggleSidebarCollapse: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      // Controls
      showControls: true,

      setShowControls: (show: boolean) => {
        set({ showControls: show })
      },
    }),
    {
      name: 'whatifai-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        // Don't persist modal/loading states
      }),
    }
  )
)

// Helper hook to sync theme on mount
export function useSyncTheme() {
  const theme = useUIStore(state => state.theme)
  const setTheme = useUIStore(state => state.setTheme)

  // Sync theme on mount
  if (typeof window !== 'undefined') {
    // Check system preference if no saved theme
    const savedTheme = localStorage.getItem('whatifai-ui-storage')
    if (!savedTheme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    } else {
      // Ensure DOM is synced with stored theme
      setTheme(theme)
    }
  }
}
