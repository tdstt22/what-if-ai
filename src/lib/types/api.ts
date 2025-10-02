/**
 * API request and response type definitions
 */

import { TimelineNode, Milestone } from './timeline'

// Generate Timeline API
export interface GenerateTimelineRequest {
  person: string
  context?: string
}

export interface GenerateTimelineResponse {
  success: boolean
  data?: {
    person: string
    milestones: Milestone[]
  }
  error?: string
  cached?: boolean
}

// Generate Branch API
export interface GenerateBranchRequest {
  parentNodeId: string
  parentTimeline: TimelineNode[]
  alternateScenario: string
  depth: number
}

export interface GenerateBranchResponse {
  success: boolean
  data?: {
    milestones: Milestone[]
  }
  error?: string
  cached?: boolean
}

// Claude API Response
export interface ClaudeTimelineResponse {
  person: string
  milestones: {
    date: string
    title: string
    description: string
    impact: string
    keyFigures: string[]
  }[]
}

export interface ClaudeBranchResponse {
  milestones: {
    date: string
    title: string
    description: string
    impact: string
    keyFigures: string[]
  }[]
}
