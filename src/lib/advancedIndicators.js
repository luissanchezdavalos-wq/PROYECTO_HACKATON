import { MODEL_VARIABLES } from './variableRegistry.js'

// NASA POWER currently supplies daily AIR temperature and precipitation only.
// Do not silently use air temperature in place of surface temperature (T), and
// never manufacture theta, ET, soil stocks, biomass or groundwater data.
export function buildModelInput(climate, manual = {}) {
  const result = {}
  if (climate?.source !== 'demo' && Array.isArray(climate?.months) && climate.months.length===12 && climate.months.every(m=>Number.isFinite(m.avgPrecipMm))) {
    const value = climate.months.reduce((sum,m)=>sum+m.avgPrecipMm,0)
    result.P={value,unit:'mm',provenance:'estimated',source:`NASA POWER: promedio climático anual histórico hasta ${climate.latestDate ? `${climate.latestDate.slice(0,4)}-${climate.latestDate.slice(4,6)}-${climate.latestDate.slice(6,8)}` : 'última fecha disponible'}`,period:'historical annual climatology'}
  }
  // Do not reuse any demonstration values or stale/unverified objects.
  if (climate?.source !== 'demo' && climate?.extended) {
    for (const key of ['T','theta','ET']) {
      const record=climate.extended[key]
      if (record && Number.isFinite(record.value) && record.unit === MODEL_VARIABLES[key].unit) {
        result[key]=record
      }
    }
  }
  for (const [key, entry] of Object.entries(manual)) {
    if (!MODEL_VARIABLES[key]) continue
    // P from verified NASA is locked: no duplicate inputs.
    if (result[key]) continue
    const raw=typeof entry==='string'?entry:entry?.value
    if (raw===undefined || String(raw).trim()==='') continue
    if(!/^(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)$/.test(String(raw).trim())) continue
    const value=Number(raw)
    result[key]={value,unit:MODEL_VARIABLES[key].unit,provenance:'farmer',source:'Dato declarado por el agricultor',period:typeof entry==='string'?'No especificado':(entry.period || 'No especificado')}
  }
  return result
}

export const ADVANCED_GROUPS = [
  {id:'pi1',keys:['theta','Zr','P']},
  {id:'pi2',keys:['ET','P','tc']},
  {id:'pi3',keys:['B','MOS']},
  {id:'pi4',keys:['Gw','P']},
  {id:'pi5',keys:['E','tc','MOS']},
  {id:'pi6',keys:['FN','tc','MOS']},
  {id:'pi7',keys:['T','Topt']},
  {id:'pi8',keys:['B','FN','E','ET']},
]

export function analyzeMissingInputs(indicators,input) {
  return ADVANCED_GROUPS.map(group=>({
    id:group.id,
    missing:group.keys.filter(key=>input[key]==null),
    invalid:group.keys.filter(key=>input[key]!=null && !Number.isFinite(input[key].value)),
    status:indicators[group.id]?.status || 'missing'
  }))
}
