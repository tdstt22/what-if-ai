# WhatIfAI - Setup Guide

![WhatIfAI Home](/public/what-if-ai-home.png "WhatIfAI Home")

![WhatIfAI Timeline](/public/what-if-timeline.png "WhatIfAI Timeline")


## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Anthropic API key:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Enter a Celebrity Name**: On the home page, type any public figure's name (e.g., "Albert Einstein", "Marie Curie")
2. **Generate Timeline**: Click "Generate Timeline" to create 10 AI-powered milestones
3. **Explore Branches**: Click any milestone node to create alternate "what if" scenarios
4. **Navigate**: Use the React Flow controls to zoom, pan, and explore your timeline

## Features Implemented

✅ Celebrity timeline generation with 10 milestones

✅ Branching timeline exploration (up to 10 levels deep)

✅ Interactive React Flow visualization

✅ Dark/Light mode with futuristic glassmorphic UI

✅ Framer Motion animations

✅ Responsive design (mobile, tablet, desktop)

✅ LocalStorage persistence

✅ Intelligent caching to minimize API costs

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **AI**: Anthropic Claude Sonnet 4.5
- **Visualization**: React Flow v12
- **Animations**: Framer Motion
- **State**: Zustand with persistence
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Validation**: Zod

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── api/               # API routes
│   ├── timeline/          # Timeline visualization page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── timeline/          # Timeline-specific components
└── lib/
    ├── api/               # API clients and cache
    ├── store/             # Zustand stores
    ├── types/             # TypeScript types
    └── utils/             # Utility functions
```

## Notes

- Timeline data persists in localStorage
- API responses are cached to reduce costs
- Maximum branching depth is 10 levels
- Theme preference syncs with system settings
