/**
 * API Route: Generate Branch
 * POST /api/generate-branch
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateBranch } from '@/lib/api/claude'
import {
  getCachedResponse,
  cacheResponse,
  getBranchCacheKey,
} from '@/lib/api/cache'
import {
  GenerateBranchRequestSchema,
  ClaudeBranchResponseSchema,
  parseJSON,
} from '@/lib/utils/validation'
import { GenerateBranchResponse } from '@/lib/types/api'

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedRequest = GenerateBranchRequestSchema.parse(body)
    const { parentNodeId, parentTimeline, alternateScenario, depth } = validatedRequest

    // Check depth limit
    if (depth >= 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum branching depth (10) reached',
        } as GenerateBranchResponse,
        { status: 400 }
      )
    }

    // Check cache
    const cacheKey = getBranchCacheKey(parentNodeId, alternateScenario)
    const cached = getCachedResponse(cacheKey)

    if (cached) {
      console.log(`Cache hit for branch: ${parentNodeId}`)
      const response: GenerateBranchResponse = {
        success: true,
        data: cached,
        cached: true,
      }
      return NextResponse.json(response)
    }

    console.log(`Generating branch for node: ${parentNodeId}`)

    // Build context from parent timeline
    // Get the path to the branch point
    const branchPointNode = parentTimeline[parentTimeline.length - 1]
    const person = parentTimeline[0]?.title || 'this person'

    // Build timeline context (summarize key events leading to branch point)
    const timelineContext = parentTimeline
      .slice(0, 5) // Last 5 nodes for context
      .map(node => `${node.date}: ${node.title}`)
      .join('\n')

    const branchPoint = `${branchPointNode.date}: ${branchPointNode.title}`

    // Generate with Claude
    const claudeResponse = await generateBranch(
      person,
      timelineContext,
      branchPoint,
      alternateScenario
    )

    // Parse and validate Claude's response
    const branchData = parseJSON(claudeResponse, ClaudeBranchResponseSchema)

    // Cache the response (7 days)
    cacheResponse(cacheKey, branchData, 7 * 24 * 60 * 60)

    const response: GenerateBranchResponse = {
      success: true,
      data: branchData,
      cached: false,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Branch generation error:', error)

    // Handle validation errors
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format: ' + error.message,
        } as GenerateBranchResponse,
        { status: 400 }
      )
    }

    // Handle missing API key
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error. Please contact support.',
        } as GenerateBranchResponse,
        { status: 500 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate branch. Please try again.',
      } as GenerateBranchResponse,
      { status: 500 }
    )
  }
}
