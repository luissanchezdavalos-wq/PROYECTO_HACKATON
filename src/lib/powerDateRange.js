// NASA POWER near-real-time parameters may have a publication delay. We request
// through UTC today minus a conservative 8-day window; actual coverage is
// identified from non-missing readings in the API response, never assumed.
export function powerDateRange(now = new Date(), config = { startYear: 2015, availabilityLagDays: 8 }) {
  const lag = config.availabilityLagDays ?? 8
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - lag))
  const startDate = `${config.startYear}0101`
  const endDate = end.toISOString().slice(0, 10).replaceAll('-', '')
  if (endDate < startDate) throw new Error('El periodo de NASA POWER todavía no comenzó')
  return { startDate, endDate, startYear: config.startYear, endYear: end.getUTCFullYear() }
}

export function latestValidPowerDate(series, required = ['T2M', 'T2M_MAX', 'PRECTOTCORR']) {
  const first = series?.[required[0]] || {}
  const days = Object.keys(first).filter(day => required.every(key => {
    const value = series?.[key]?.[day]
    return typeof value === 'number' && Number.isFinite(value) && value > -998
  }))
  return days.length ? days.sort().at(-1) : null
}

export function formatPowerDate(yyyymmdd) {
  if (!yyyymmdd || !/^\d{8}$/.test(yyyymmdd)) return 'sin fecha disponible'
  return `${yyyymmdd.slice(0,4)}-${yyyymmdd.slice(4,6)}-${yyyymmdd.slice(6,8)}`
}
