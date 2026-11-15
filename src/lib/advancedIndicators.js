import { MODEL_VARIABLES } from './variableRegistry.js'

// NASA POWER currently supplies daily AIR temperature and precipitation only.
// Do not silently use air temperature in place of surface temperature (T), and
// never manufacture theta, ET, soil stocks, biomass or groundwater data.
export function buildModelInput(climate, manual = {}) {
  const result = {}
  if (climate?.source !== 'demo' && Array.isArray(climate?.months) && climate.months.length===12 && climate.months.every(m=>Number.isFinite(m.avgPrecipMm))) {
    const value = climate.months.reduce((sum,m)=>sum+m.avgPrecipMm,0)
    result.P={value,unit:'mm',provenance:'estimated',source:'NASA POWER: 2015–2024 historical mean annual precipitation',period:'historical annual climatology'}
  }
  for (const [key, entry] of Object.entries(manual)) {
    if (!MODEL_VARIABLES[key]) continue
    // P from verified NASA is locked: no duplicate inputs.
    if (key==='P' && result.P) continue
    const raw=typeof entry==='string'?entry:entry?.value
    if (raw===undefined || String(raw).trim()==='') continue
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
