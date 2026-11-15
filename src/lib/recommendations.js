import rules from '../data/rotationRules.json'
import { MONTH_NAMES, cycleFrom, inRange, mean, plantableMonths } from './seasonWindows'

const WATER_LEVELS = rules.waterLevels
const { weights, verdictThresholds, climateGate, climate, soilScores, waterScores, rotation, nutrients } = rules

export const FACTOR_LABELS = {
  climate: 'Climate fit',
  soil: 'Soil suitability',
  rotation: 'Crop rotation',
  water: 'Water requirement',
  nutrients: 'Nutrient management',
}

export const VERDICT_LABELS = {
  recommended: 'Recommended',
  conditional: 'Possible with caveats',
  not_recommended: 'Not recommended',
}

function scoreClimate(crop, monthly) {
  const candidates = plantableMonths(crop, monthly).map((start) => {
    const cycle = cycleFrom(start, crop.cycleMonths)
    const inRangeCount = cycle.filter((index) =>
      inRange(monthly[index].meanTempC, crop.growthTempMinC, crop.growthTempMaxC),
    ).length
    const avgHotDays = mean(cycle.map((index) => monthly[index].hotDaysPerYear))
    const overTolerance = Math.max(0, avgHotDays - crop.hotDayTolerance)
    const penalty = Math.min(climate.maxHotDayPenalty, overTolerance * climate.hotDayPenaltyPerDay)
    const score = Math.max(0, (inRangeCount / cycle.length) * 100 - penalty)
    return { start, cycle, inRangeCount, avgHotDays, overTolerance, score }
  })

  if (candidates.length === 0) {
    return {
      score: 0,
      bestStart: null,
      reason: `No month falls inside the planting temperature range (${crop.plantingTempMinC} to ${crop.plantingTempMaxC} C).`,
    }
  }

  const best = candidates.reduce((top, candidate) => (candidate.score > top.score ? candidate : top))
  let reason = `Best window starts in ${MONTH_NAMES[best.start]}: ${best.inRangeCount} of ${best.cycle.length} growing months fall within the ${crop.growthTempMinC} to ${crop.growthTempMaxC} C growth range.`
  if (best.overTolerance > 0) {
    reason += ` Hot days above ${climate.hotDayThresholdC} C average ${best.avgHotDays.toFixed(1)} per month, above the crop's tolerance of ${crop.hotDayTolerance}.`
  }
  return { score: Math.round(best.score), bestStart: best.start, bestCycle: best.cycle, reason }
}

function scoreSoil(crop, soilType) {
  let level = 'unsuitable'
  if (crop.soilSuitable.includes(soilType)) level = 'suitable'
  else if (crop.soilTolerable.includes(soilType)) level = 'tolerable'

  const reasons = {
    suitable: `${soilType} soil suits ${crop.name.toLowerCase()}.`,
    tolerable: `${soilType} soil is workable for ${crop.name.toLowerCase()} but not ideal, so expect more management.`,
    unsuitable: `${soilType} soil is poorly suited to ${crop.name.toLowerCase()}.`,
  }
  return { score: soilScores[level], reason: reasons[level] }
}

function scoreWater(crop, farm, climateResult, monthly) {
  const supply = WATER_LEVELS.indexOf(farm.waterSupply)
  const need = WATER_LEVELS.indexOf(crop.waterNeed)
  const rainfall = climateResult.bestCycle
    ? climateResult.bestCycle.reduce((sum, index) => sum + monthly[index].avgPrecipMm, 0)
    : 0
  const rainfallBonus = rainfall >= climate.rainfallBonusMm ? 1 : 0
  const effective = Math.min(WATER_LEVELS.length - 1, supply + rainfallBonus)
  const gap = effective - need

  let score = waterScores.shortByTwoOrMore
  if (gap >= 0) score = waterScores.sufficient
  else if (gap === -1) score = waterScores.shortByOne

  const rainNote = rainfallBonus ? ` Rainfall in the growing window (${Math.round(rainfall)} mm) adds to supply.` : ''
  const reason =
    gap >= 0
      ? `Your ${farm.waterSupply} water supply meets the ${crop.waterNeed} water need of this crop.${rainNote}`
      : `This crop needs ${crop.waterNeed} water but your supply is ${farm.waterSupply}. Expect water stress or lower yields.${rainNote}`
  return { score, reason }
}

function scoreRotation(crop, previousCrop) {
  if (!previousCrop) {
    return { score: rotation.unknownPreviousScore, reason: 'No previous crop recorded, so rotation is not checked.' }
  }
  const exempt = rotation.sameFamilyExempt.includes(crop.family)
  if (crop.family === previousCrop.family && !exempt) {
    return {
      score: rotation.sameFamilyScore,
      reason: `Same crop family as the previous crop (${previousCrop.name}). Repeating it raises disease and pest carry-over.`,
    }
  }
  if ((rotation.preferredAfter[previousCrop.family] || []).includes(crop.family)) {
    return { score: rotation.preferredAfterScore, reason: `Follows ${previousCrop.name} well in a rotation.` }
  }
  return {
    score: rotation.neutralScore,
    reason: `Different family from ${previousCrop.name}. Acceptable, but not a preferred follow-on.`,
  }
}

function scoreNutrients(crop, previousCrop) {
  if (!previousCrop) {
    return {
      score: nutrients.unknownPreviousScore,
      reason: 'Previous crop unknown, so the nutrient plan uses this crop\'s demand only. Measure soil nutrients with a lab test.',
    }
  }
  const previousFixes = previousCrop.fixesNitrogen
  const previousHeavy = previousCrop.nitrogenDemand === 'high'

  if (crop.fixesNitrogen && previousHeavy) {
    return {
      score: nutrients.legumeAfterHeavyFeederScore,
      reason: `Nitrogen-fixing crop after a heavy nitrogen user (${previousCrop.name}) helps restore soil nitrogen. A lab soil test is still needed.`,
    }
  }
  if (crop.fixesNitrogen) {
    return { score: nutrients.legumeScore, reason: 'Nitrogen-fixing crop, so it needs little fertilizer nitrogen.' }
  }
  if (crop.nitrogenDemand === 'high' && previousFixes) {
    return {
      score: nutrients.heavyAfterLegumeScore,
      reason: `Follows ${previousCrop.name}, which can supply part of this crop's nitrogen.`,
    }
  }
  if (crop.nitrogenDemand === 'high' && previousHeavy) {
    return {
      score: nutrients.heavyAfterHeavyScore,
      reason: `Two heavy nitrogen users in a row (${previousCrop.name} then this crop). Expect higher fertilizer input and soil depletion.`,
    }
  }
  return { score: nutrients.defaultScore, reason: 'Moderate nitrogen demand, so a standard fertilizer plan applies.' }
}

function verdictFor(score, climateScore) {
  if (climateScore < climateGate.minimumScore) return 'not_recommended'
  if (score >= verdictThresholds.recommended) return 'recommended'
  if (score >= verdictThresholds.conditional) return 'conditional'
  return 'not_recommended'
}

export function recommendCrops({ crops, monthly, farm }) {
  const previousCrop = crops.find((crop) => crop.id === farm.previousCropId) || null

  const results = crops.map((crop) => {
    const climateResult = scoreClimate(crop, monthly)
    const factors = {
      climate: { ...climateResult },
      soil: scoreSoil(crop, farm.soilType),
      rotation: scoreRotation(crop, previousCrop),
      water: scoreWater(crop, farm, climateResult, monthly),
      nutrients: scoreNutrients(crop, previousCrop),
    }
    const score = Math.round(
      Object.keys(weights).reduce((sum, key) => sum + factors[key].score * weights[key], 0),
    )
    return {
      crop,
      score,
      verdict: verdictFor(score, factors.climate.score),
      factors,
      bestStart: climateResult.bestStart,
    }
  })

  return results.sort((a, b) => b.score - a.score || a.crop.name.localeCompare(b.crop.name))
}
