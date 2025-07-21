import { LRUCache } from "lru-cache"

// In-memory cache for frequently accessed data
const cache = new LRUCache<string, any>({
  max: 1000, // Maximum 1000 items
  ttl: 1000 * 60 * 5, // 5 minutes TTL
})

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined
}

export function setCached<T>(key: string, value: T, ttl?: number): void {
  cache.set(key, value, { ttl })
}

export function deleteCached(key: string): void {
  cache.delete(key)
}

export function clearCache(): void {
  cache.clear()
}

// Cache keys constants
export const CACHE_KEYS = {
  SYSTEM_CONFIG: "system_config",
  USER_STATS: "user_stats",
  DASHBOARD_STATS: "dashboard_stats",
  MIKROTIK_STATUS: "mikrotik_status",
  PROFILES: "profiles",
  RESELLERS: "resellers",
} as const
