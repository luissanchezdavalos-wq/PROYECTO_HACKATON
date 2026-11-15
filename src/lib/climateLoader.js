import locations from '../data/locations.json'
import demoClimate from '../data/demoClimate.json'
import { fetchNasaPowerDaily } from './nasaPower'
import { aggregateByMonth } from './climateAggregate'
import { fetchExtendedPowerDaily, aggregateExtendedPower } from './nasaPowerExtended.js'
import { readClimateCache, writeClimateCache } from './climateCache'

export async function loadLiveClimate(location, { signal, forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = readClimateCache(location)
    if (cached) return { ...cached, source: 'cache' }
  }

  const series = await fetchNasaPowerDaily(location, signal)
  const aggregated = aggregateByMonth(series)
  let extended = {T:null,theta:null,ET:null,coverage:{},errors:[]}
  try {
    const optional = await fetchExtendedPowerDaily(location,signal,locations.nasaPower)
    extended = {...aggregateExtendedPower(optional.series),errors:optional.errors}
  } catch (error) {
    if (signal?.aborted) throw error
    extended.errors = [`Datos adicionales no disponibles: ${error.message}`]
  }
  const entry = { fetchedAt: new Date().toISOString(), ...aggregated, extended }
  writeClimateCache(location, entry)
  return { ...entry, source: 'live' }
}

export function loadDemoClimate() {
  return { months: demoClimate.months, yearsCount: null, fetchedAt: null, source: 'demo' }
}
