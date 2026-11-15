import { DAYS_PER_YEAR, INDICATOR_NAMES, readVariable } from './variableRegistry.js'

/** Returns explicit status. Does not treat missing values as zero. */
function calculate(input, keys, expression, denominator) {
  const values = {}
  const sources = {}
  for (const key of keys) {
    const record = readVariable(input, key)
    if (record.status !== 'ok') return { status: record.status, value: null, reason: record.error, variables: keys }
    values[key] = record.value
    sources[key] = record.provenance
  }
  if (denominator(values) === 0) {
    return { status: 'undefined', value: null, reason: 'Denominador igual a cero', variables: keys, sources }
  }
  const value = expression(values)
  if (!Number.isFinite(value)) return { status: 'undefined', value: null, reason: 'Resultado no finito', variables: keys, sources }
  return { status: 'ok', value, variables: keys, sources }
}

/**
 * Exact team equations with explicit conversions:
 * pi1 = theta * Zr / P  (Zr m -> mm)
 * pi2 = ET / (P/tc)    (ET mm/day, P mm, tc day)
 * pi3 = B / MOS
 * pi4 = Gw / P
 * pi5 = E * tc / MOS   (E kg/m2/year, tc day -> year)
 * pi6 = FN * tc / MOS  (FN kgN/ha/year -> kgN/m2/year, tc day -> year)
 * pi7 = T / Topt       (Kelvin, matching surface-temperature definition)
 * pi8 = B*FN/(E*ET)   (ORIGINAL experimental index; not dimensionless)
 *
 * pi8 below uses the team's original RATE convention. For comparing rotations
 * across one horizon, use calculateRotationPi8 with horizon totals instead.
 */
export function calculateIndicators(input) {
  const formulas = {
    pi1: calculate(input, ['theta','Zr','P'], v => v.theta * (v.Zr * 1000) / v.P, v => v.P),
    pi2: calculate(input, ['ET','P','tc'], v => v.ET / (v.P / v.tc), v => v.P / v.tc),
    pi3: calculate(input, ['B','MOS'], v => v.B / v.MOS, v => v.MOS),
    pi4: calculate(input, ['Gw','P'], v => v.Gw / v.P, v => v.P),
    pi5: calculate(input, ['E','tc','MOS'], v => v.E * (v.tc / DAYS_PER_YEAR) / v.MOS, v => v.MOS),
    pi6: calculate(input, ['FN','tc','MOS'], v => (v.FN / 10000) * (v.tc / DAYS_PER_YEAR) / v.MOS, v => v.MOS),
    pi7: calculate(input, ['T','Topt'], v => v.T / v.Topt, v => v.Topt),
    pi8: calculate(input, ['B','FN','E','ET'], v => v.B * v.FN / (v.E * v.ET), v => v.E * v.ET),
  }
  return Object.fromEntries(Object.entries(formulas).map(([key, result]) => [key, { name: INDICATOR_NAMES[key], ...result }]))
}

/**
 * Compares strategies using the SAME evaluation horizon. All four inputs are
 * accumulated horizon totals per unit land area, with matching temporal/spatial
 * coverage. No weights; original equation B*FN/(E*ET).
 * B: kg/m2; FN: kgN/m2; E: kg/m2; ET: mm.
 * Must NOT compare this value directly with calculateIndicators().pi8 (rate
 * convention); units are different. Not a dimensionless Buckingham group.
 */
export function calculateRotationPi8(input) {
  const keys = ['B', 'FN', 'E', 'ET']
  for (const key of keys) {
    const rec = input?.[key]
    const unit = { B:'kg/m2', FN:'kgN/m2', E:'kg/m2', ET:'mm' }[key]
    if (rec == null || rec.provenance === 'unavailable') return { status:'missing', value:null, reason:`Sin datos de ${key}` }
    if (rec.unit !== unit || !['observed','estimated','farmer'].includes(rec.provenance) || typeof rec.value !== 'number' || !Number.isFinite(rec.value) || rec.value < 0) {
      return { status:'invalid', value:null, reason:`${key}: valor, unidad (${unit}) o procedencia inválida` }
    }
  }
  if (!input.horizon || !Number.isInteger(input.horizon.startYear) || !Number.isInteger(input.horizon.startMonth) || input.horizon.months !== 12 || input.horizon.startMonth < 1 || input.horizon.startMonth > 12) {
    return { status:'invalid', value:null, reason:'Se requiere un horizonte explícito de 12 meses' }
  }
  if (input.E.value === 0 || input.ET.value === 0) return { status:'undefined', value:null, reason:'E o ET es cero en el denominador' }
  const value = input.B.value * input.FN.value / (input.E.value * input.ET.value)
  if (!Number.isFinite(value)) return { status:'undefined', value:null, reason:'Resultado no finito' }
  return { status:'ok', value, unit:'índice experimental (no adimensional)', horizon:input.horizon,
    sources:Object.fromEntries(keys.map(key => [key,input[key].provenance])) }
}

export function compareRotationPi8(rotations) {
  if (!Array.isArray(rotations)) throw new TypeError('rotations debe ser un arreglo')
  const evaluated = rotations.map(item => {
    if (item.viable !== true) return { id:item.id, status:'excluded', reason:'Restricción agronómica no superada', value:null }
    return { id:item.id, ...calculateRotationPi8(item.metrics) }
  })
  const evaluable = evaluated.filter(r => r.status === 'ok')
  const horizons = new Set(evaluable.map(r => JSON.stringify(r.horizon)))
  if (horizons.size > 1) return { status:'incomparable', reason:'Horizontes de evaluación diferentes', results:evaluated, ranked:[] }
  const ranked = [...evaluable].sort((a,b) => b.value-a.value)
  const eligibleCount = evaluated.filter(r => r.status !== 'excluded').length
  const status = ranked.length === 0 ? 'insufficient_data' : ranked.length < eligibleCount ? 'partial_data' : 'ok'
  return { status, results:evaluated, ranked, recommendationReady: status === 'ok' }
}
