# WhatIfAI: Product Specification and Design Document
## NextJS-Based Alternate Timeline Exploration Platform

---

# Executive Summary

**WhatIfAI** is a cutting-edge web application that allows users to explore alternate timelines of famous people's lives through AI-generated narrative branches. Built on NextJS with Claude Sonnet 4.5 integration, the platform generates 10 milestone checkpoints for any celebrity or public figure and enables users to branch timelines at any checkpoint to explore "what if" scenarios, supporting up to 10 layers of nested branching.

The application leverages **React Flow** for stunning, interactive timeline visualization with smooth animations powered by **Framer Motion**. **Zustand** manages complex nested state efficiently, while **Tailwind CSS** delivers a futuristic, glassmorphic UI with dark/light mode support. The entire stack is optimized for **Vercel deployment** with aggressive caching strategies to minimize Claude API costs by up to 90%.

**Key Innovation**: Unlike traditional timeline tools, WhatIfAI creates an explorable multiverse of possibilities where each decision point spawns new realities, combining historical accuracy with speculative fiction in an immersive, visually stunning interface.

**Target Audience**: History enthusiasts, creative writers, educators, and anyone fascinated by exploring alternate histories and "what if" scenarios.

**Core Value Proposition**: Transform any historical figure's life into an interactive, branching narrative experience that's both educational and entertaining, powered by state-of-the-art AI.

---

# 1. Feature Specifications

## 1.1 Core Features (MVP)

### Feature 1: Celebrity Timeline Generation
**User Story**: As a user, I want to enter a celebrity's name and receive an AI-generated timeline of 10 major life milestones so I can understand their life journey.

**Acceptance Criteria**:
- User can enter any celebrity/public figure name in search input
- System validates input and shows loading state
- Claude Sonnet 4.5 generates exactly 10 milestone checkpoints
- Each milestone includes: date, event description, impact statement, key figures involved
- Timeline displays within 5 seconds (with streaming for better UX)
- Milestones are chronologically ordered
- Error handling for invalid names or API failures

**Technical Requirements**:
- NextJS API route: `/api/generate-timeline`
- Claude prompt engineering for structured JSON output
- Response validation against TypeScript schema
- Streaming response implementation for progressive display

### Feature 2: Branching Timeline Exploration
**User Story**: As a user, I want to select any milestone checkpoint and create an alternate branch exploring "what if this went differently" so I can explore parallel realities.

**Acceptance Criteria**:
- User can click any milestone node to reveal branching options
- Modal presents 3 suggested alternate scenarios
- User can create custom alternate scenario via text input
- System generates new branch with 5-7 subsequent milestones
- New branch visually connects to parent milestone
- Original timeline remains intact and accessible
- Maximum 10 levels of branching supported
- Smooth animations during branch creation

**Technical Requirements**:
- React Flow for node-based visualization
- Dagre algorithm for automatic tree layout
- Zustand store with normalized data structure
- Branch generation API: `/api/generate-branch`
- Context-aware prompting (includes parent timeline history)
- Unique IDs for each node (UUID v4)

### Feature 3: Interactive Timeline Visualization
**User Story**: As a user, I want to see timelines as beautiful, interactive graphics with smooth animations so the experience feels futuristic and engaging.

**Acceptance Criteria**:
- Vertical timeline layout on mobile, horizontal option on desktop
- Glassmorphic cards for each milestone with blur effects
- Hover states reveal additional details
- Drag to pan, scroll/pinch to zoom
- Smooth transitions when expanding/collapsing branches
- Visual distinction between original and alternate timelines
- Progress indicator showing current position
- Responsive across all device sizes (mobile, tablet, desktop)
- 60fps animations throughout

**Technical Requirements**:
- React Flow v12+ with custom node components
- Framer Motion for micro-interactions
- Tailwind CSS for glassmorphism styling
- Custom SVG connectors between nodes
- Progressive disclosure (render 2-3 levels visible at once)
- Virtual rendering for performance with deep branches

### Feature 4: Dark/Light Mode with Futuristic Theme
**User Story**: As a user, I want to toggle between dark and light modes with a futuristic aesthetic so I can use the app comfortably in any environment.

**Acceptance Criteria**:
- Toggle button accessible from header
- Smooth transition between themes (300ms)
- Preference persists across sessions (localStorage)
- Dark mode: Deep space blue (#0A0E27) with electric cyan (#00F0FF) accents
- Light mode: Clean white (#FFFFFF) with dodger blue (#1E90FF) accents
- All text meets WCAG AA contrast ratios (4.5:1 minimum)
- Metallic/chrome UI elements for futuristic feel
- Respects system preference on first visit

**Technical Requirements**:
- React Context for theme state
- Tailwind CSS dark mode classes
- CSS custom properties for theme colors
- LocalStorage persistence with Zustand middleware
- System preference detection via `prefers-color-scheme`

### Feature 5: Timeline Persistence and Sharing
**User Story**: As a user, I want my created timelines to be saved automatically so I can return to them later and share them with friends.

**Acceptance Criteria**:
- All timelines automatically saved to localStorage
- User can view list of previously created timelines
- Timeline state includes all branches and user exploration path
- Share button generates unique URL for specific timeline view
- Shared URLs load exact timeline state including expansions
- Local storage cap at 50 timelines (FIFO removal)

**Technical Requirements**:
- Zustand persist middleware
- URL state encoding for sharing (base64 compressed JSON)
- Optional: Database storage for registered users (stretch goal)
- Timeline export as JSON
- Import from JSON file

---

# 2. Technical Architecture

## 2.1 Technology Stack

### Frontend
- **Framework**: NextJS 14.2+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS 3.4+
- **Visualization**: React Flow v12.3+, D3-Dagre for layout
- **Animations**: Framer Motion (motion.dev)
- **State Management**: Zustand 4.5+ with persist middleware
- **Type Safety**: TypeScript 5.3+
- **Icons**: Lucide React
- **Fonts**: Inter (body), Space Grotesk (headings)

### Backend
- **Runtime**: Node.js 20+ (NextJS API Routes)
- **AI Provider**: Anthropic Claude Sonnet 4.5
- **SDK**: @anthropic-ai/sdk

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Ignore testing for now focus on building

## 2.2 NextJS Architecture Decision: App Router

**Decision**: Use NextJS 14+ **App Router** (not Pages Router)

**Rationale**:
- React Server Components reduce client bundle size
- Improved data fetching with native async/await
- Built-in loading and error states
- Better performance with partial pre-rendering
- Simpler nested layouts

## 2.3 Folder Structure

```
whatifai/
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                 # Home page (Server Component)
│   ├── globals.css              # Global styles + Tailwind imports
│   ├── timeline/
│   │   ├── page.tsx            # Timeline server wrapper
│   │   ├── TimelineClient.tsx  # 'use client' - main interactive component
│   │   └── loading.tsx         # Loading skeleton
│   ├── api/
│   │   ├── generate-timeline/
│   │   │   └── route.ts        # POST: Generate initial timeline
│   │   ├── generate-branch/
│   │   │   └── route.ts        # POST: Generate branch from checkpoint
│   │   └── claude/
│   │       └── stream/
│   │           └── route.ts    # Streaming endpoint (optional)
│   └── error.tsx                # Global error boundary
├── components/
│   ├── timeline/
│   │   ├── TimelineFlow.tsx    # React Flow container
│   │   ├── TimelineNode.tsx    # Custom node component (milestone)
│   │   ├── TimelineEdge.tsx    # Custom edge/connector
│   │   ├── BranchModal.tsx     # Modal for creating branches
│   │   ├── TimelineControls.tsx # Zoom, pan, reset controls
│   │   └── MilestoneCard.tsx   # Glassmorphic milestone card
│   ├── ui/
│   │   ├── GlassCard.tsx       # Reusable glass effect card
│   │   ├── Button.tsx          # Custom button component
│   │   ├── Input.tsx           # Search input with validation
│   │   ├── ThemeToggle.tsx     # Dark/light mode switch
│   │   ├── LoadingSkeleton.tsx # Loading placeholder
│   │   └── ErrorMessage.tsx    # Error display component
│   └── layout/
│       ├── Header.tsx          # App header with branding
│       ├── Footer.tsx          # Footer with links
│       └── Container.tsx       # Max-width wrapper
├── lib/
│   ├── store/
│   │   ├── timelineStore.ts    # Zustand store for timeline state
│   │   └── uiStore.ts          # UI state (theme, modals, etc.)
│   ├── api/
│   │   ├── claude.ts           # Claude API client wrapper
│   │   └── cache.ts            # Caching utilities (Redis)
│   ├── utils/
│   │   ├── treeTraversal.ts    # BFS, DFS, path finding
│   │   ├── layoutEngine.ts     # Dagre layout calculation
│   │   ├── validation.ts       # Zod schemas for API responses
│   │   └── helpers.ts          # Date formatting, ID generation
│   └── types/
│       ├── timeline.ts         # TypeScript interfaces
│       └── api.ts              # API request/response types
├── public/
│   ├── images/
│   └── fonts/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local                   # Environment variables (gitignored)
├── .env.example                 # Template for required variables
├── next.config.js               # NextJS configuration
├── tailwind.config.ts           # Tailwind customization
├── tsconfig.json                # TypeScript configuration
├── jest.config.ts               # Jest testing setup
├── playwright.config.ts         # E2E test configuration
├── .eslintrc.json               # ESLint rules
├── .prettierrc                  # Code formatting
└── package.json
```

## 2.4 Data Flow Architecture

```
User Input (Celebrity Name)
        ↓
NextJS Page (Server Component)
        ↓
API Route: /api/generate-timeline
        ↓
Claude API (Sonnet 4.5)
    Prompt Engineering
    Structured JSON Output
        ↓
Validation (Zod Schema)
        ↓
Return to Client
        ↓
Zustand Store (Normalized Structure)
        ↓
React Flow Visualization
    Dagre Layout Engine
    Custom Node Components
    Framer Motion Animations
        ↓
User Interaction (Select Checkpoint)
        ↓
Branch Modal Opens
        ↓
User Chooses Alternate Scenario
        ↓
API Route: /api/generate-branch
    Context: Parent timeline + checkpoint
        ↓
Claude generates branch (5-7 milestones)
        ↓
Update Zustand Store (Add nodes, edges)
        ↓
React Flow Re-layout (Animated)
        ↓
New branch rendered with Framer Motion
```

## 2.5 State Management Architecture

### Zustand Store Structure

```typescript
// lib/store/timelineStore.ts
interface TimelineNode {
  id: string                    // UUID
  parentId: string | null       // Parent node ID
  childIds: string[]            // Array of child node IDs
  depth: number                 // 0-10 (enforced limit)
  
  // Content
  title: string                 // Milestone title
  date: string                  // ISO date or year
  description: string           // Event description
  impact: string                // Impact statement
  keyFigures: string[]          // People involved
  
  // Metadata
  type: 'original' | 'alternate' // Visual distinction
  createdAt: number             // Timestamp
  llmResponseId?: string        // Cache reference
  
  // UI State
  expanded: boolean             // Show children
  selected: boolean             // Currently selected
}

interface TimelineState {
  // Data (Normalized)
  nodes: {
    byId: Record<string, TimelineNode>
    allIds: string[]
    rootId: string | null
  }
  
  // Navigation
  currentPath: string[]         // Array of node IDs from root to current
  selectedNodeId: string | null
  
  // UI State
  loading: boolean
  error: string | null
  
  // LLM Cache
  llmCache: Record<string, CachedResponse>
  
  // Actions
  initializeTimeline: (rootNode: TimelineNode) => void
  addBranch: (parentId: string, nodes: TimelineNode[]) => void
  selectNode: (nodeId: string) => void
  expandNode: (nodeId: string) => void
  collapseNode: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  clearTimeline: () => void
  
  // Computed (via selectors)
  getNodePath: (nodeId: string) => TimelineNode[]
  getAllLeafNodes: () => TimelineNode[]
  getDepth: () => number
}

const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      // Initial state
      nodes: { byId: {}, allIds: [], rootId: null },
      currentPath: [],
      selectedNodeId: null,
      loading: false,
      error: null,
      llmCache: {},
      
      // Action implementations...
      initializeTimeline: (rootNode) => set((state) => ({
        nodes: {
          byId: { [rootNode.id]: rootNode },
          allIds: [rootNode.id],
          rootId: rootNode.id
        },
        currentPath: [rootNode.id],
        selectedNodeId: rootNode.id
      })),
      
      addBranch: (parentId, newNodes) => set((state) => {
        const updatedById = { ...state.nodes.byId }
        const updatedAllIds = [...state.nodes.allIds]
        
        // Add all new nodes
        newNodes.forEach(node => {
          updatedById[node.id] = node
          updatedAllIds.push(node.id)
        })
        
        // Update parent's children
        const parent = updatedById[parentId]
        updatedById[parentId] = {
          ...parent,
          childIds: [...parent.childIds, newNodes[0].id]
        }
        
        return {
          nodes: {
            byId: updatedById,
            allIds: updatedAllIds,
            rootId: state.nodes.rootId
          }
        }
      }),
      
      // Other actions...
    }),
    {
      name: 'whatifai-timeline-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        currentPath: state.currentPath,
        llmCache: state.llmCache
      })
    }
  )
)
```

## 2.6 API Design

### Endpoint 1: Generate Timeline

**Route**: `POST /api/generate-timeline`

**Request Body**:
```typescript
{
  person: string               // Celebrity name
  context?: string             // Optional additional context
}
```

**Response**:
```typescript
{
  success: boolean
  data?: {
    rootNode: {
      id: string
      title: string
      description: string
      milestones: Array<{
        id: string
        date: string
        title: string
        description: string
        impact: string
        keyFigures: string[]
      }>
    }
  }
  error?: string
  cached: boolean             // Was response from cache
}
```

**Implementation**:
```typescript
// app/api/generate-timeline/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getCachedTimeline, cacheTimeline } from '@/lib/api/cache'

const RequestSchema = z.object({
  person: z.string().min(2).max(100),
  context: z.string().optional()
})

const SYSTEM_PROMPT = `You are an expert historical analyst. Generate a structured timeline of exactly 10 major life milestones for the given person.

Return ONLY valid JSON in this format:
{
  "person": "Full Name",
  "milestones": [
    {
      "date": "YYYY-MM-DD or YYYY",
      "title": "Brief event title",
      "description": "2-3 sentence description",
      "impact": "Why this mattered",
      "keyFigures": ["Person 1", "Person 2"]
    }
  ]
}

Requirements:
- Exactly 10 milestones covering their entire life
- Chronological order
- Specific dates when possible
- Focus on genuinely impactful moments
- Historically accurate
- Engaging narrative`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { person, context } = RequestSchema.parse(body)
    
    // Check cache
    const cacheKey = `timeline:${person.toLowerCase()}`
    const cached = await getCachedTimeline(cacheKey)
    if (cached) {
      return NextResponse.json({ 
        success: true, 
        data: cached, 
        cached: true 
      })
    }
    
    // Generate with Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Generate a timeline for: ${person}${context ? `\n\nAdditional context: ${context}` : ''}`
      }]
    })
    
    const content = message.content[0].text
    const timeline = JSON.parse(content)
    
    // Validate response structure
    // ... validation logic ...
    
    // Cache for 7 days
    await cacheTimeline(cacheKey, timeline, 7 * 24 * 60 * 60)
    
    return NextResponse.json({
      success: true,
      data: timeline,
      cached: false
    })
    
  } catch (error) {
    console.error('Timeline generation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate timeline' },
      { status: 500 }
    )
  }
}
```

### Endpoint 2: Generate Branch

**Route**: `POST /api/generate-branch`

**Request Body**:
```typescript
{
  parentNodeId: string
  parentTimeline: TimelineNode[]  // Context for coherence
  alternateSce