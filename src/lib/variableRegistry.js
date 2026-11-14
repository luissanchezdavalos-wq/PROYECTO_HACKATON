/** Original AgroShift team variables. Values require explicit units and provenance. */
export const MODEL_VARIABLES = Object.freeze({
  P: { label: 'Precipitación acumulada', unit: 'mm', kind: 'total' },
  theta: { label: 'Humedad volumétrica del suelo', unit: 'm3/m3', kind: 'state' },
  T: { label: 'Temperatura superficial', unit: 'K', kind: 'state' },
  Topt: { label: 'Temperatura óptima del cultivo', unit: 'K', kind: 'reference' },
  ET: { label: 'Evapotranspiración', unit: 'mm/day', kind: 'rate' },
  B: { label: 'Biomasa vegetal', unit: 'kg/m2', kind: 'total' },
  MOS: { label: 'Materia orgánica del suelo', unit: 'kg/m2', kind: 'stock' },
  Zr: { label: 'Profundidad efectiva de raíces', unit: 'm', kind: 'reference' },
  Gw: { label: 'Disponibilidad de agua subterránea', unit: 'mm', kind: 'total' },
  E: { label: 'Intensidad de erosión', unit: 'kg/m2/year', kind: 'rate' },
  tc: { label: 'Tiempo de crecimiento', unit: 'day', kind: 'duration' },
  FN: { label: 'Fijación de nitrógeno', unit: 'kgN/ha/year', kind: 'rate' },
})

export const INDICATOR_NAMES = Object.freeze({
  pi1: 'Índice hídrico del suelo',
  pi2: 'Balance hídrico',
  pi3: 'Productividad relativa',
  pi4: 'Uso de reservas subterráneas',
  pi5: 'Degradación del suelo',
  pi6: 'Recuperación nutritiva',
  pi7: 'Estrés térmico potencial',
  pi8: 'Resiliencia de la rotación',
})

export const DATA_PROVENANCE = Object.freeze(['observed', 'estimated', 'farmer', 'unavailable'])
export const DAYS_PER_YEAR = 365.2425

// No interpolation, guessed values, or automatic zero-filling.
export function readVariable(input, key) {
  const spec = MODEL_VARIABLES[key]
  if (!spec) return { status: 'invalid', error: `Variable no reconocida: ${key}` }
  const record = input?.[key]
  if (record == null || record.provenance === 'unavailable') {
    return { status: 'missing', error: `Sin datos de ${key}` }
  }
  if (!DATA_PROVENANCE.includes(record.provenance)) {
    return { status: 'invalid', error: `${key}: procedencia inválida` }
  }
  if (record.unit !== spec.unit) {
    return { status: 'invalid', error: `${key}: se necesita ${spec.unit}; recibido ${record.unit ?? 'sin unidad'}` }
  }
  if (typeof record.value !== 'number' || !Number.isFinite(record.value)) {
    return { status: 'invalid', error: `${key}: valor no numérico` }
  }
  if (['P','ET','B','MOS','Zr','Gw','E','tc','FN'].includes(key) && record.value < 0) {
    return { status: 'invalid', error: `${key}: no puede ser negativo` }
  }
  if (['T','Topt'].includes(key) && record.value <= 0) {
    return { status: 'invalid', error: `${key}: temperatura Kelvin debe ser positiva` }
  }
  if (key === 'theta' && (record.value < 0 || record.value > 1)) {
    return { status: 'invalid', error: 'theta: debe estar entre 0 y 1' }
  }
  return { status: 'ok', value: record.value, provenance: record.provenance }
}

export function convertVariable(value, from, to) {
  if (!Number.isFinite(value)) throw new Error('Valor no finito')
  if (from === to) return value
  const factors = {
    'mm:m': 1/1000, 'm:mm': 1000,
    'day:year': 1 / DAYS_PER_YEAR, 'year:day': DAYS_PER_YEAR,
    'kgN/ha/year:kgN/m2/year': 1/10000,
    'kgN/m2/year:kgN/ha/year': 10000,
    'C:K': null, 'K:C': null,
  }
  if (from === 'C' && to === 'K') return value + 273.15
  if (from === 'K' && to === 'C') return value - 273.15
  const factor = factors[`${from}:${to}`]
  if (factor === undefined) throw new Error(`Conversión no autorizada: ${from} -> ${to}`)
  return value * factor
}
