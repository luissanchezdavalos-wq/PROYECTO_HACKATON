import demoClimate from '../data/demoClimate.json'
import { fetchNasaPowerDaily } from './nasaPower'
import { aggregateByMonth } from './climateAggregate'
import { readClimateCache, writeClimateCache } from './climateCache'

export async function loadLiveClimate(location, { signal, forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = readClimateCache(location)
    if (cached) return { ...cached, source: 'cache' }
  }

  const series = await fetchNasaPowerDaily(location, signal)
  const aggregated = aggregateByMonth(series)
  const entry = { fetchedAt: new Date().toISOString(), ...aggregated }
  writeClimateCache(location, entry)
  return { ...entry, source: 'live' }
}

export function loadDemoClimate() {
  return { months: demoClimate.months, yearsCount: null, fetchedAt: null, source: 'demo' }
}
