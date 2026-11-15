import { powerDateRange } from './powerDateRange.js'
const isValidReading = v => typeof v === 'number' && Number.isFinite(v) && v > -998
export const DEFAULT_POWER_CONFIG = {baseUrl:'https://power.larc.nasa.gov/api/temporal/daily/point',community:'AG',startYear:2015,availabilityLagDays:8}

// POWER daily products documented by NASA: surface temperature, surface moisture,
// transpiration energy flux and land evaporation energy flux.
// These are reanalysis/model products, not in-situ measurements of the parcel.
export const OPTIONAL_POWER_PARAMETERS = ['TSURF', 'SFMC', 'EVPTRNS', 'EVLAND']

export function buildExtendedPowerUrl(location, parameters = OPTIONAL_POWER_PARAMETERS, cfg = DEFAULT_POWER_CONFIG, now = new Date()) {
  const { startDate, endDate } = powerDateRange(now, cfg)
  return `${cfg.baseUrl}?${new URLSearchParams({parameters: parameters.join(','), community:cfg.community,
    latitude:String(location.latitude), longitude:String(location.longitude),
    start:startDate,end:endDate,format:'JSON'})}`
}

async function requestSeries(location, parameters, signal, cfg) {
  const response = await fetch(buildExtendedPowerUrl(location, parameters, cfg), {signal})
  if (!response.ok) { const error = new Error(`NASA POWER: HTTP ${response.status}`); error.status = response.status; throw error }
  const json = await response.json()
  if (!json?.properties?.parameter) throw new Error('Respuesta NASA sin series')
  return json.properties.parameter
}

export async function fetchExtendedPowerDaily(location, signal, cfg = DEFAULT_POWER_CONFIG) {
  // Optional enrichment MUST never prevent the original climate dashboard from loading.
  try {
    const series = await requestSeries(location, OPTIONAL_POWER_PARAMETERS, signal, cfg)
    return {series, errors:[]}
  } catch (e) {
    if (signal?.aborted) throw e
    const series = {}, errors = [`Solicitud conjunta de variables adicionales: ${e.message}`]
    // Do not multiply requests during outages or throttling.
    if (e.status !== 422) return {series, errors}
    // Query independently: one unsupported parameter should not suppress the others.
    for (const parameter of OPTIONAL_POWER_PARAMETERS) {
      if (signal?.aborted) throw new DOMException('Aborted','AbortError')
      try {
        const one = await requestSeries(location,[parameter],signal,cfg)
        if (one[parameter]) series[parameter] = one[parameter]
      } catch(err) { if(signal?.aborted) throw err; errors.push(`${parameter}: ${err.message}`) }
    }
    return {series, errors}
  }
}

export function aggregateExtendedPower(series) {
  const findValid = (key, predicate=()=>true) => Object.values(series?.[key] || {}).filter(v => isValidReading(v) && predicate(v))
  const avg = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null
  const surface = avg(findValid('TSURF', v=>v>-150 && v<100)) // Celsius
  const soil = avg(findValid('SFMC',v=>v>=0 && v<=1)) // m³/m³
  const transpiration = findValid('EVPTRNS',v=>v>=0)
  const evaporation = findValid('EVLAND',v=>v>=0)
  // Energy flux MJ/m²/day -> equivalent water mm/day, approximate latent heat
  // of vaporization 2.45 MJ/kg and 1 kg water/m² = 1 mm. Only pair matching days.
  const etValues=[]
  for (const [day, v] of Object.entries(series?.EVPTRNS || {})) {
    const e=series?.EVLAND?.[day]
    if(isValidReading(v)&&isValidReading(e)&&v>=0&&e>=0) etValues.push((v+e)/2.45)
  }
  const et=avg(etValues)
  return {
    T: surface == null ? null : {value:surface+273.15,unit:'K',provenance:'estimated',source:'NASA POWER TSURF, temperatura superficial media histórica (modelo/reanálisis)',period:'media diaria multianual'},
    theta: soil == null ? null : {value:soil,unit:'m3/m3',provenance:'estimated',source:'NASA POWER SFMC, humedad volumétrica superficial media histórica (modelo/reanálisis)',period:'media diaria multianual'},
    ET: et == null ? null : {value:et,unit:'mm/day',provenance:'estimated',source:'NASA POWER EVPTRNS+EVLAND convertidos de MJ/m²/día a mm/día (calor latente supuesto 2.45 MJ/kg); aproximación',period:'media diaria multianual'},
    coverage: {TSURF:findValid('TSURF').length,SFMC:findValid('SFMC').length,EVPTRNS:transpiration.length,EVLAND:evaporation.length,ET:etValues.length},
  }
}
