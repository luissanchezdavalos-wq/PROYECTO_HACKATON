import locations from '../data/locations.json'

import { powerDateRange } from './powerDateRange.js'

const CACHE_VERSION = 'v5.2-power-auto-date'
const TTL_MS = locations.nasaPower.cacheTtlDays * 24 * 60 * 60 * 1000

function cacheKey(location) {
  const { startDate, endDate } = powerDateRange(new Date(), locations.nasaPower)
  return `agroshift:nasa-power:${CACHE_VERSION}:${location.id}:${startDate}-${endDate}`
}

export function readClimateCache(location) {
  try {
    const raw = window.localStorage.getItem(cacheKey(location))
    if (!raw) return null
    const entry = JSON.parse(raw)
    const age = Date.now() - Date.parse(entry.fetchedAt)
    if (!Array.isArray(entry.months) || entry.months.length !== 12 || !Number.isFinite(age) || age > TTL_MS) {
      return null
    }
    return entry
  } catch {
    return null
  }
}

export function writeClimateCache(location, entry) {
  try {
    window.localStorage.setItem(cacheKey(location), JSON.stringify(entry))
  } catch {
    // Storage can be full or disabled; the live data is still usable without caching.
  }
}
