import { useState } from 'react'
import { Card } from './ui'
import { classifyIndicator, rangePosition, RANGES } from '../lib/indicatorThresholds'
import { INDICATOR_NAMES } from '../lib/variableRegistry'
const COLORS={Malo:'#C66D60',Aceptable:'#C79A42',Óptimo:'#3E8864'}
const LABELS={pi1:'Disponibilidad hídrica',pi2:'Relación entre consumo y agua recibida',pi3:'Biomasa y materia orgánica',pi4:'Dependencia relativa de reservas subterráneas',pi5:'Erosión y salud del suelo',pi6:'Fijación biológica y materia orgánica',pi7:'Temperatura frente a la referencia óptima',pi8:'Índice experimental de resiliencia'}
const FORMAT=v=>Number(v).toLocaleString('es-MX',{maximumFractionDigits:6})
export default function IndicatorRangeCard({id,result,unlocked=true,details}){
 const [open,setOpen]=useState(false)
 const ok=unlocked&&result?.status==='ok'
 const value=ok?result.value:null
 const status=ok?classifyIndicator(id,value):'Sin datos'
 const pos=ok?rangePosition(id,value):null
 const r=RANGES[id]
 const widths=[(r.edges[0]-r.domain[0])/(r.domain[1]-r.domain[0])*100,(r.edges[1]-r.edges[0])/(r.domain[1]-r.domain[0])*100,(r.domain[1]-r.edges[1])/(r.domain[1]-r.domain[0])*100]
 return <Card className="space-y-4 hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-leaf-900">{INDICATOR_NAMES[id]}</h3><p className="text-xs text-soil-500 mt-1">{LABELS[id]}</p></div><span className="rounded-full px-3 py-1 text-xs font-semibold shrink-0" style={{color:COLORS[status]||'#6f746e',background:status==='Sin datos'?'#edf0ea':`${COLORS[status]}20`}}>{status}</span></div>
  <div className="flex items-end justify-between"><p className="text-3xl font-bold tracking-tight text-leaf-900">{ok?FORMAT(value):'—'}</p><span className="text-[11px] text-soil-500">{ok?'Modelo experimental':'No calculable'}</span></div>
  <div className="space-y-2"><div className="relative pt-4"><div className="flex h-3 gap-0.5 overflow-hidden rounded-full">{widths.map((w,i)=><div key={i} style={{width:`${w}%`,background:COLORS[r.order[i]],minWidth:0}}/>)}</div>{pos!==null&&<span className="absolute top-0 block h-5 w-0.5 bg-soil-900" style={{left:`calc(${pos}% - 1px)`}} aria-label={`Marcador en ${FORMAT(value)}`}><span className="absolute -left-[5px] top-0 h-2.5 w-2.5 rotate-45 bg-soil-900"/></span>}</div><div className="flex justify-between text-[10px] text-soil-500"><span>{r.domain[0]}</span><span>{r.edges[0]}</span><span>{r.edges[1]}</span><span>{r.domain[1]}+</span></div></div>
  <button type="button" onClick={()=>setOpen(v=>!v)} className="w-full text-left text-xs font-semibold text-leaf-700 hover:text-leaf-900 focus-visible:rounded">{open?'Ocultar detalles ↑':'Ver detalles y fuentes ↓'}</button>
  {open&&<div className="space-y-2 rounded-xl bg-cream-100 p-3 text-xs leading-relaxed text-soil-700"><p>{details||'Clasificación propuesta por el equipo, sin validación agronómica independiente.'}</p><p><strong>Criterios:</strong> {id==='pi7'?'Óptimo solamente si el cociente exacto es 1. No se redondea antes de clasificar.':`${r.order[0]} para valores inferiores a ${r.edges[0]}; ${r.order[1]} entre ${r.edges[0]} y ${r.edges[1]}; ${r.order[2]} por encima de ${r.edges[1]}.`}</p><p><strong>Origen:</strong> {Object.entries(result?.sources||{}).map(([key,src])=>`${key}: ${src==='farmer'?'Agricultor':src}`).join(' · ')||'No disponible'}</p>{result?.reason&&<p>{result.reason}</p>}</div>}
 </Card>
}
