import { CROP_PROFILES } from './cropInsights.js'
import { DAYS_PER_YEAR } from './variableRegistry.js'
import { compareRotationPi8 } from './buckingham.js'

// Demonstration-only candidates: thermal range screening, not verified crop profiles.
// Perennial fruit/vines are deliberately excluded from annual rotation sequences.
const ANNUALS = [
  { id:'lettuce', family:'asteraceae', focus:'soil' },
  { id:'carrot', family:'apiaceae', focus:'soil' },
  { id:'tomato', family:'solanaceae', focus:'balanced' },
  { id:'wheat', family:'poaceae', focus:'water' },
  { id:'maize', family:'poaceae', focus:'balanced' },
  { id:'sorghum', family:'poaceae', focus:'water' },
]
export const ROTATION_STRATEGIES = Object.freeze([
  {id:'water',name:'Conservación del agua',description:'Exploración de candidatos por coincidencia térmica, sin estimar ahorro real de riego.',order:['sorghum','wheat','carrot','lettuce','tomato','maize']},
  {id:'soil',name:'Recuperación del suelo',description:'Alternancia ilustrativa de familias; no atribuye fijación de nitrógeno a especies no leguminosas.',order:['carrot','lettuce','wheat','tomato','sorghum','maize']},
  {id:'balanced',name:'Equilibrio agronómico',description:'Diversidad de especies candidatas; faltan ciclos, riego, suelo y reglas agronómicas validadas.',order:['tomato','wheat','lettuce','sorghum','carrot','maize']},
])
const findProfile = id => CROP_PROFILES.find(p=>p.id===id)
export function draftRotationStrategies(months,startMonth=1){
  if(!Array.isArray(months)||startMonth<1||startMonth>12) return []
  const available = new Map(months.map(m=>[m.month,m]))
  return ROTATION_STRATEGIES.map(strategy=>{
    let lastFamily=null
    const slots=[]
    for(let offset=0;offset<12;offset+=3){
      const slotMonths=Array.from({length:3},(_,i)=>((startMonth+offset+i-1)%12)+1)
      const data=slotMonths.map(m=>available.get(m))
      const eligible=ANNUALS.filter(annual=>{
        const profile=findProfile(annual.id)
        return profile && data.every(m=>m && Number.isFinite(m.meanTempC) && m.meanTempC>=profile.tempMin && m.meanTempC<=profile.tempMax)
      })
      const candidates=eligible.sort((a,b)=>strategy.order.indexOf(a.id)-strategy.order.indexOf(b.id))
      const chosen=candidates.find(c=>c.family!==lastFamily) ?? null
      if(chosen) lastFamily=chosen.family
      slots.push({months:slotMonths,chosen:chosen?{...chosen,name:findProfile(chosen.id).name}:null,options:candidates.length,
        explanation:chosen?'Coincide con la temperatura media de los 3 meses (perfil ilustrativo).':'Sin coincidencia térmica en los tres meses; no se inventa un cultivo.'})
    }
    return {...strategy,slots,viable:false,assessment:'Borrador térmico no validado: los bloques de 3 meses NO representan duraciones reales de cultivo.'}
  })
}

const UNITS={B:'kg/m2',FN:'kgN/m2',E:'kg/m2',ET:'mm'}
/** Convert four FARMER-SUPPLIED quantities to comparable area/horizon totals.
 *  B: 12-month harvested biomass (kg/m2)
 *  FN: annual nitrogen fixation rate (kgN/ha/year)
 *  E: annual erosion rate (kg/m2/year)
 *  ET: mean daily ET for the 12-month period (mm/day)
 * The result remains dimensionful and experimental. This is NOT a prediction.
 */
export function normalizeRotationInputs(raw,horizon){
  const days=daysInHorizon(horizon)
  if(days===null)return {status:'invalid',reason:'Horizonte de doce meses inválido'}
  const names=['B','FN','E','ET']
  const vals={}
  for(const name of names){
    const text=raw?.[name]
    if(text===undefined||text===null||String(text).trim()==='')return {status:'missing',reason:`Falta ${name}`}
    if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(String(text).trim()))return {status:'invalid',reason:`${name}: usa números no negativos con punto decimal`}
    const v=Number(text)
    if(!Number.isFinite(v)||v<0)return {status:'invalid',reason:`${name}: número inválido`}
    vals[name]=v
  }
  const frac=days/DAYS_PER_YEAR
  const converted={B:vals.B,FN:vals.FN/10000*frac,E:vals.E*frac,ET:vals.ET*days}
  return {status:'ok',days,metrics:{...Object.fromEntries(names.map(name=>[name,{value:converted[name],unit:UNITS[name],provenance:'farmer'}])),horizon},converted}
}
export function daysInHorizon(horizon){
  if(!horizon||!Number.isInteger(horizon.startYear)||!Number.isInteger(horizon.startMonth)||horizon.startMonth<1||horizon.startMonth>12||horizon.months!==12)return null
  const first=Date.UTC(horizon.startYear,horizon.startMonth-1,1)
  const last=Date.UTC(horizon.startYear+1,horizon.startMonth-1,1)
  if(!Number.isFinite(first)||!Number.isFinite(last))return null
  return (last-first)/86400000
}
export function evaluateRotationStrategies(entries,horizon){
  const normalized=ROTATION_STRATEGIES.map(s=>({id:s.id, viable:entries?.[s.id]?.verified===true, conversion:normalizeRotationInputs(entries?.[s.id],horizon)}))
  const comparisons=compareRotationPi8(normalized.map(n=>({id:n.id,viable:n.viable,metrics:n.conversion.status==='ok'?n.conversion.metrics:null})))
  return {...comparisons,normalized}
}
