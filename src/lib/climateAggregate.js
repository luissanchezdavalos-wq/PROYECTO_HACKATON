import rules from '../data/rotationRules.json'
import { isValidReading } from './nasaPower'

const { hotDayThresholdC } = rules.climate
const DAYS_PER_MONTH = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function aggregateByMonth(series) {
  const dates = Object.keys(series.T2M)
  const years = new Set()
  const monthly = Array.from({ length: 12 }, () => ({
    tempSum: 0,
    tempCount: 0,
    maxSum: 0,
    maxCount: 0,
    hotDays: 0,
    observedYears: new Set(),
    precipSum: 0,
    precipCount: 0,
  }))

  for (const date of dates) {
    const monthIndex = Number(date.slice(4, 6)) - 1
    const bucket = monthly[monthIndex]
    if (!bucket) continue
    years.add(date.slice(0, 4))

    const temp = series.T2M[date]
    if (isValidReading(temp)) {
      bucket.tempSum += temp
      bucket.tempCount += 1
    }

    const tempMax = series.T2M_MAX[date]
    if (isValidReading(tempMax)) {
      bucket.observedYears.add(date.slice(0,4))
      bucket.maxSum += tempMax
      bucket.maxCount += 1
      if (tempMax > hotDayThresholdC) bucket.hotDays += 1
    }

    const precip = series.PRECTOTCORR[date]
    if (isValidReading(precip)) {
      bucket.precipSum += precip
      bucket.precipCount += 1
    }
  }

  const yearsCount = years.size
  const months = monthly.map((bucket, index) => {
    if (bucket.tempCount === 0 || bucket.maxCount === 0 || bucket.precipCount === 0) {
      throw new Error(`NASA POWER data has no valid readings for month ${index + 1}`)
    }
    return {
      month: index + 1,
      meanTempC: round(bucket.tempSum / bucket.tempCount, 1),
      meanMaxTempC: round(bucket.maxSum / bucket.maxCount, 1),
      hotDaysPerYear: round(bucket.hotDays / bucket.observedYears.size, 1),
      avgPrecipMm: round((bucket.precipSum / bucket.precipCount) * DAYS_PER_MONTH[index], 1),
      validDays: bucket.tempCount,
    }
  })

  return { months, yearsCount }
}

function round(value, digits) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}
