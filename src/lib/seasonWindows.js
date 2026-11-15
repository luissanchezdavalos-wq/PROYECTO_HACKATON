export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function inRange(value, min, max) {
  return value >= min && value <= max
}

export function cycleFrom(startIndex, length) {
  return Array.from({ length }, (_, offset) => (startIndex + offset) % 12)
}

export function plantableMonths(crop, monthly) {
  return monthly
    .map((_, index) => index)
    .filter((index) => inRange(monthly[index].meanTempC, crop.plantingTempMinC, crop.plantingTempMaxC))
}

export function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}
