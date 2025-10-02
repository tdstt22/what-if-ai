/**
 * Core type definitions for timeline nodes and related structures
 */

export type TimelineNodeType = 'original' | 'alternate'

export interface Milestone {
  date: string // ISO date or year
  title: string
  description: string
  impact: string
  keyFigures: string[]
}

export interface TimelineNode {
  id: string // nanoid
  parentId: string | null
  childIds: string[]
  depth: number // 0-10 (enforced limit)

  // Content
  title: string
  date: string
  description: string
  impact: string
  keyFigures: string[]

  // Metadata
  type: TimelineNodeType
  createdAt: number // timestamp
  llmResponseId?: string // cache reference

  // UI State
  expanded: boolean
  selected: boolean
}

export interface TimelineData {
  person: string
  milestones: Milestone[]
}

export interface CachedResponse {
  data: any
  timestamp: number
  expiresAt: number
}

export interface NodePosition {
  x: number
  y: number
}

export interface LayoutNode {
  id: string
  width: number
  height: number
  x?: number
  y?: number
}

export interface LayoutEdge {
  source: string
  target: string
}
