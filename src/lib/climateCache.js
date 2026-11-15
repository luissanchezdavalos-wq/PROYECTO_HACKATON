import locations from '../data/locations.json'

const CACHE_VERSION = 'v1'
const TTL_MS = locations.nasaPower.cacheTtlDays * 24 * 60 * 60 * 1000

function cacheKey(location) {
  return `agroshift:nasa-power:${CACHE_VERSION}:${location.id}:${locations.nasaPower.startYear}-${locations.nasaPower.endYear}`
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
