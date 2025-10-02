/**
 * API Route: Generate Timeline
 * POST /api/generate-timeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateTimeline } from '@/lib/api/claude'
import {
  getCachedResponse,
  cacheResponse,
  getTimelineCacheKey,
} from '@/lib/api/cache'
import {
  GenerateTimelineRequestSchema,
  ClaudeTimelineResponseSchema,
  parseJSON,
} from '@/lib/utils/validation'
import { GenerateTimelineResponse } from '@/lib/types/api'

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedRequest = GenerateTimelineRequestSchema.parse(body)
    const { person, context } = validatedRequest

    // Check cache
    const cacheKey = getTimelineCacheKey(person)
    const cached = getCachedResponse(cacheKey)

    if (cached) {
      console.log(`Cache hit for timeline: ${person}`)
      const response: GenerateTimelineResponse = {
        success: true,
        data: cached,
        cached: true,
      }
      return NextResponse.json(response)
    }

    console.log(`Generating timeline for: ${person}`)

    // Generate with Claude
    const claudeResponse = await generateTimeline(person, context)

    // Parse and validate Claude's response
    const timelineData = parseJSON(claudeResponse, ClaudeTimelineResponseSchema)

    // Cache the response (7 days)
    cacheResponse(cacheKey, timelineData, 7 * 24 * 60 * 60)

    const response: GenerateTimelineResponse = {
      success: true,
      data: timelineData,
      cached: false,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Timeline generation error:', error)

    // Handle validation errors
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format: ' + error.message,
        } as GenerateTimelineResponse,
        { status: 400 }
      )
    }

    // Handle missing API key
    if (error instanceof Error && error.message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error. Please contact support.',
        } as GenerateTimelineResponse,
        { status: 500 }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate timeline. Please try again.',
      } as GenerateTimelineResponse,
      { status: 500 }
    )
  }
}
