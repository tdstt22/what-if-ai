/**
 * Claude API client wrapper
 */

import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
export function getClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
  }

  return new Anthropic({
    apiKey,
  })
}

// System prompts
export const TIMELINE_SYSTEM_PROMPT = `You are an expert historical analyst. Generate a structured timeline of exactly 10 major life milestones for the given person.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "person": "Full Name",
  "milestones": [
    {
      "date": "YYYY-MM-DD or YYYY",
      "title": "Brief event title (max 100 chars)",
      "description": "2-3 sentence description of what happened",
      "impact": "1-2 sentences on why this mattered",
      "keyFigures": ["Person 1", "Person 2"]
    }
  ]
}

Requirements:
- Exactly 10 milestones covering their entire life or career
- Chronological order (earliest to latest)
- Use specific dates (YYYY-MM-DD) when possible, otherwise just year (YYYY)
- Focus on genuinely impactful moments that shaped their life/legacy
- Historically accurate information only
- Engaging but professional narrative style
- Return only the JSON object, no other text`

export const BRANCH_SYSTEM_PROMPT = `You are an expert at creating alternate timeline scenarios. Given a person's life timeline and an alternate scenario at a specific point, generate 5-7 plausible milestones showing how their life could have unfolded differently.

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "milestones": [
    {
      "date": "YYYY-MM-DD or YYYY",
      "title": "Brief event title (max 100 chars)",
      "description": "2-3 sentence description",
      "impact": "1-2 sentences on significance",
      "keyFigures": ["Person 1", "Person 2"]
    }
  ]
}

Requirements:
- Generate 5-7 milestones (not 10, since this is a branch)
- Maintain chronological order
- Stay consistent with the alternate scenario provided
- Be creative but plausible - events should be believable
- Consider ripple effects of the changed event
- Keep the same narrative quality as the original timeline
- Return only the JSON object, no other text`

/**
 * Generate timeline for a person
 */
export async function generateTimeline(person: string, context?: string): Promise<string> {
  const client = getClaudeClient()

  const userMessage = context
    ? `Generate a timeline for: ${person}\n\nAdditional context: ${context}`
    : `Generate a timeline for: ${person}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: TIMELINE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text
}

/**
 * Generate branch timeline
 */
export async function generateBranch(
  person: string,
  originalTimeline: string,
  branchPoint: string,
  alternateScenario: string
): Promise<string> {
  const client = getClaudeClient()

  const userMessage = `Person: ${person}

Original timeline context (leading up to branch point):
${originalTimeline}

Branch point: ${branchPoint}

Alternate scenario: ${alternateScenario}

Generate 5-7 milestones showing how ${person}'s life could have unfolded differently after this alternate scenario.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 3072,
    system: BRANCH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text
}
