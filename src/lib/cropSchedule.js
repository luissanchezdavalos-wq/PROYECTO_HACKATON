import rules from '../data/rotationRules.json'
import { inRange } from './seasonWindows'

// A single field, planned chronologically from January through December.
// Crops crossing December are deferred rather than silently wrapping into January.
function compatibleWithPrevious(crop, previous) {
  if (!previous || rules.rotation.sameFamilyExempt.includes(crop.family)) return true
  return crop.family !== previous.family
}

function suitableCycle(crop, monthly, start) {
  if (start + crop.cycleMonths > 12) return false
  if (!inRange(monthly[start]?.meanTempC, crop.plantingTempMinC, crop.plantingTempMaxC)) return false
  return Array.from({ length: crop.cycleMonths }, (_, i) => start + i)
    .every((month) => inRange(monthly[month]?.meanTempC, crop.growthTempMinC, crop.growthTempMaxC))
}

export function buildCropSchedule(recommendations, monthly, previousCropId = null) {
  const occupied = Array(12).fill(null)
  const placements = []
  const unscheduled = []
  let previous = recommendations.find((item) => item.crop.id === previousCropId)?.crop ?? null
  let nextAvailable = 0
  const remaining = [...recommendations]

  while (nextAvailable < 12 && placements.length < rules.maxScheduledCrops) {
    const choices = remaining
      .filter(({ crop, verdict }) => verdict !== 'not_recommended' && compatibleWithPrevious(crop, previous))
      .flatMap(({ crop, score }) => Array.from({ length: 12 - nextAvailable }, (_, offset) => nextAvailable + offset)
        .filter((start) => suitableCycle(crop, monthly, start))
        .map((start) => ({ crop, score, start })))
      .sort((a, b) => a.start - b.start || b.score - a.score)

    if (!choices.length) break
    const { crop, start } = choices[0]
    const months = Array.from({ length: crop.cycleMonths }, (_, i) => start + i)
    const placement = { crop, plantingMonth: start, harvestMonth: months[months.length - 1], months }
    months.forEach((month) => { occupied[month] = placement })
    placements.push(placement)
    remaining.splice(remaining.findIndex((item) => item.crop.id === crop.id), 1)
    previous = crop
    nextAvailable = start + crop.cycleMonths
  }

  for (const { crop, verdict } of remaining) {
    const reason = verdict === 'not_recommended'
      ? 'Not recommended for this farm. See the rotation screen for details.'
      : 'Could not fit this crop in the remaining calendar while respecting temperature, duration and crop-family rotation constraints.'
    unscheduled.push({ crop, reason })
  }
  return { placements, unscheduled, occupied }
}

export function stageFor(placement, monthIndex) {
  const position = placement.months.indexOf(monthIndex)
  if (position === -1) return null
  if (position === 0) return 'planting'
  if (position === placement.months.length - 1) return 'harvest'
  return 'growing'
}
