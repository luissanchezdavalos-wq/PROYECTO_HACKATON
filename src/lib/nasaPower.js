import locations from '../data/locations.json'
import { powerDateRange } from './powerDateRange.js'

const { baseUrl, community, parameters, missingValue } = locations.nasaPower

export function buildNasaPowerUrl(location, now = new Date()) {
  const { startDate, endDate } = powerDateRange(now, locations.nasaPower)
  const params = new URLSearchParams({
    parameters: parameters.join(','),
    community,
    longitude: String(location.longitude),
    latitude: String(location.latitude),
    start: startDate,
    end: endDate,
    format: 'JSON',
  })
  return `${baseUrl}?${params.toString()}`
}

export async function fetchNasaPowerDaily(location, signal) {
  const url = buildNasaPowerUrl(location)
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`NASA POWER responded with status ${response.status}`)
  }
  const json = await response.json()
  const series = json?.properties?.parameter
  if (!series || !series.T2M || !series.T2M_MAX || !series.PRECTOTCORR) {
    throw new Error('NASA POWER response did not include the expected parameters')
  }
  return series
}

export function isValidReading(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > missingValue + 1
}
