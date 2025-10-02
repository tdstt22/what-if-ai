/**
 * Simple in-memory cache for API responses (MVP)
 * In production, this should use Redis or similar
 */

import { CachedResponse } from '../types/timeline'

// In-memory cache
const cache = new Map<string, CachedResponse>()

// Cache duration in seconds
const DEFAULT_TTL = 7 * 24 * 60 * 60 // 7 days

/**
 * Get cached response
 */
export function getCachedResponse(key: string): any | null {
  const cached = cache.get(key)

  if (!cached) {
    return null
  }

  // Check if expired
  if (Date.now() > cached.expiresAt) {
    cache.delete(key)
    return null
  }

  return cached.data
}

/**
 * Cache a response
 */
export function cacheResponse(key: string, data: any, ttlSeconds: number = DEFAULT_TTL): void {
  const cached: CachedResponse = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlSeconds * 1000,
  }

  cache.set(key, cached)
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear()
}

/**
 * Generate cache key for timeline
 */
export function getTimelineCacheKey(person: string): string {
  return `timeline:${person.toLowerCase().trim()}`
}

/**
 * Generate cache key for branch
 */
export function getBranchCacheKey(
  parentNodeId: string,
  alternateScenario: string
): string {
  return `branch:${parentNodeId}:${alternateScenario.toLowerCase().trim().slice(0, 50)}`
}
