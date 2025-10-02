/**
 * Helper utility functions
 */

import { nanoid } from 'nanoid'
import { TimelineNode } from '../types/timeline'

/**
 * Generate a unique ID for nodes
 */
export function generateId(): string {
  return nanoid()
}

/**
 * Format date string for display
 */
export function formatDate(dateStr: string): string {
  // Handle year-only dates
  if (/^\d{4}$/.test(dateStr)) {
    return dateStr
  }

  // Handle ISO dates
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  } catch {
    // Fall through to return original
  }

  return dateStr
}

/**
 * Get path from root to target node
 */
export function getNodePath(
  nodes: Record<string, TimelineNode>,
  targetId: string
): TimelineNode[] {
  const path: TimelineNode[] = []
  let currentId: string | null = targetId

  while (currentId) {
    const node = nodes[currentId]
    if (!node) break
    path.unshift(node)
    currentId = node.parentId
  }

  return path
}

/**
 * Get all leaf nodes (nodes with no children)
 */
export function getAllLeafNodes(
  nodes: Record<string, TimelineNode>
): TimelineNode[] {
  return Object.values(nodes).filter(node => node.childIds.length === 0)
}

/**
 * Get maximum depth of timeline tree
 */
export function getMaxDepth(nodes: Record<string, TimelineNode>): number {
  const depths = Object.values(nodes).map(node => node.depth)
  return depths.length > 0 ? Math.max(...depths) : 0
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Compress data for URL encoding
 */
export function compressForURL(data: any): string {
  const json = JSON.stringify(data)
  return btoa(encodeURIComponent(json))
}

/**
 * Decompress data from URL
 */
export function decompressFromURL(compressed: string): any {
  try {
    const json = decodeURIComponent(atob(compressed))
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Get color for node type
 */
export function getNodeColor(type: 'original' | 'alternate', theme: 'light' | 'dark'): string {
  if (type === 'original') {
    return theme === 'dark' ? '#00F0FF' : '#1E90FF'
  }
  return theme === 'dark' ? '#B794F4' : '#9F7AEA'
}
