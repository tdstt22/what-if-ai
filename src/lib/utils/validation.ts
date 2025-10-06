/**
 * Zod validation schemas for API requests and responses
 */

import { z } from 'zod'

// Milestone schema
export const MilestoneSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  impact: z.string().min(1).max(500),
  keyFigures: z.array(z.string()).default([]),
})

// Timeline generation request
export const GenerateTimelineRequestSchema = z.object({
  person: z.string().min(2).max(100),
  context: z.string().optional(),
})

// Timeline generation response from Claude
export const ClaudeTimelineResponseSchema = z.object({
  person: z.string(),
  milestones: z.array(MilestoneSchema).length(10),
})

// Branch generation request
export const GenerateBranchRequestSchema = z.object({
  parentNodeId: z.string(),
  parentTimeline: z.array(z.any()), // Array of TimelineNode
  alternateScenario: z.string().min(5).max(500),
  depth: z.number().min(0).max(10),
})

// Branch generation response from Claude
export const ClaudeBranchResponseSchema = z.object({
  milestones: z.array(MilestoneSchema).min(5).max(7),
})

// Helper function to safely parse JSON
export function parseJSON<T>(json: string, schema: z.ZodSchema<T>): T {
  try {
    // Remove the first line if it starts with ```json
    if (json.startsWith('```json')) {
      json = json.replace(/```json\n|```/g, '');
    }
    const parsed = JSON.parse(json)
    return schema.parse(parsed)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw new Error('Failed to parse JSON response')
  }
}
