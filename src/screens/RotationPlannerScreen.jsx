import { useMemo } from 'react'
import { Badge, Card, PageHeader } from '../components/ui'
import { MONTH_NAMES } from '../lib/seasonWindows'
import { ROTATION_STRATEGIES, draftRotationStrategies, evaluateRotationStrategies } from '../lib/rotationPlanner'
const FIELDS=[
  ['B','Biomasa total cosechada','kg/m² en 12 meses'],
  ['FN','Fijación de nitrógeno','kg N/ha/año'],
  ['E','Erosión estimada','kg/m²/año'],
  ['ET','Evapotranspiración media','mm/día'],
]
const validDraft = /^(?:\d+(?:\.\d*)?|\.\d*)?$/
const display=v=>Number(v).toLocaleString('es-MX',{maximumSignificantDigits:6})
export default function RotationPlannerScreen({climate,location,savedState,onSavedState}){
  const today=new Date()
  const startYear=savedState?.startYear ?? today.getFullYear()
  const startMonth=savedState?.startMonth ?? today.getMonth()+1
  const entries=savedState?.entries ?? {}
  // Cambiar el horizonte NO borra las entradas: exige renovar la verificación.
  const changeHorizon=(key,value)=>onSavedState(prev=>({
    startYear:prev?.startYear ?? today.getFullYear(),
    startMonth:prev?.startMonth ?? today.getMonth()+1,
    ...prev,
    [key]:value,
    entries:Object.fromEntries(Object.entries(prev?.entries??{}).map(([id,data])=>[id,{...data,verified:false}]))
  }))
  const horizon={startYear,startMonth,months:12}
  const drafts=useMemo(()=>draftRotationStrategies(climate.months,startMonth),[climate.months,startMonth])
  const evaluation=useMemo(()=>evaluateRotationStrategies(entries,horizon),[entries,startYear,startMonth])
  const byId=Object.fromEntries(evaluation.results.map(r=>[r.id,r]))
  const normalizedById=Object.fromEntries(evaluation.normalized.map(r=>[r.id,r]))
  const setField=(id,key,value)=>onSavedState(prev=>({
    startYear:prev?.startYear ?? today.getFullYear(),
    startMonth:prev?.startMonth ?? today.getMonth()+1,
    ...prev,
    entries:{...(prev?.entries??{}),[id]:{...prev?.entries?.[id],[key]:value,verified:key==='verified'?value:false}}
  }))
  return <div className="space-y-6">
    <PageHeader eyebrow="Planificador experimental · v6.2" title="Estrategias de rotación" description="Tres borradores climáticos de 12 meses y comparación matemática solo con datos propios y revisión de viabilidad."/>
    <Card className="space-y-3"><h2 className="font-semibold text-leaf-900">Terreno y periodo de evaluación</h2><p className="text-sm text-soil-600">{location.name} · {climate.source==='demo'?'clima de demostración':'temperaturas históricas NASA POWER'} (no pronóstico)</p>
      <div className="flex flex-wrap gap-3"><label className="text-sm text-soil-700">Mes inicial <select className="ml-2 rounded-xl border border-cream-300 bg-white px-3 py-2" value={startMonth} onChange={e=>changeHorizon('startMonth',Number(e.target.value))}>{MONTH_NAMES.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select></label><label className="text-sm text-soil-700">Año <select className="ml-2 rounded-xl border border-cream-300 bg-white px-3 py-2" value={startYear} onChange={e=>changeHorizon('startYear',Number(e.target.value))}>{[today.getFullYear(),today.getFullYear()+1,today.getFullYear()+2].map(y=><option key={y}>{y}</option>)}</select></label></div>
      <p className="rounded-xl bg-leaf-50 border border-leaf-200 px-3 py-2 text-xs text-soil-700"><strong>Al cambiar el mes o el año:</strong> se conservan tus valores escritos, pero se desmarca la verificación porque deben revisarse para el nuevo periodo de 12 meses.</p>
      <p className="rounded-xl bg-wheat-50 border border-wheat-300 px-3 py-2 text-xs text-soil-700"><strong>Antes de sembrar:</strong> los cultivos de estos borradores son ejemplos con rangos térmicos provisionales. Los bloques de tres meses son ventanas de exploración, NO ciclos de crecimiento verificados ni planes listos para sembrar. Faltan requisitos de agua, suelo, fechas, plagas y sucesión comprobados.</p>
    </Card>
    <div className="grid gap-4 xl:grid-cols-3">{drafts.map(s=>{const current=entries[s.id]||{};const result=byId[s.id];const conversion=normalizedById[s.id]?.conversion;return <Card key={s.id} className="space-y-4">
      <div className="space-y-1"><div className="flex justify-between gap-2"><h2 className="font-semibold text-leaf-900">{s.name}</h2><Badge tone="neutral">Borrador</Badge></div><p className="text-xs text-soil-600">{s.description}</p></div>
      <div className="space-y-2">{s.slots.map((slot,i)=><div key={i} className="flex items-start gap-3 rounded-xl bg-cream-100 p-3"><span className="text-xs font-semibold whitespace-nowrap text-leaf-800">{MONTH_NAMES[slot.months[0]-1].slice(0,3)}–{MONTH_NAMES[slot.months[2]-1].slice(0,3)}</span><div className="space-y-1"><p className="text-sm font-semibold text-soil-900">{slot.chosen?.name||'Sin candidato'}</p><p className="text-xs text-soil-600">{slot.explanation}</p>{slot.alternatives?.length>0&&<p className="text-xs text-soil-600"><strong>Coincidencias parciales (NO recomendadas):</strong> {slot.alternatives.map(a=>`${a.name} (${a.matchingMonths}/3 meses)`).join(' · ')}</p>}{slot.missingClimate&&<p className="text-xs text-soil-600">Faltan datos históricos para evaluar uno o más meses del bloque.</p>}</div></div>)}</div>
      <div className="border-t border-cream-300 pt-3 space-y-3"><h3 className="font-semibold text-sm text-leaf-900">Datos de esta estrategia</h3><p className="text-xs text-soil-600">Introduce valores medidos o estimados con una fuente propia para esta rotación. No se copian automáticamente los del terreno a todas las estrategias.</p>
        {FIELDS.map(([key,label,unit])=><label key={key} className="block text-xs font-medium text-soil-700">{label} <span className="text-soil-500">({unit})</span><input className="mt-1 w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm" inputMode="decimal" value={current[key]??''} onChange={e=>{if(validDraft.test(e.target.value))setField(s.id,key,e.target.value)}} placeholder="Sin dato"/></label>)}
        {conversion?.status==='ok'&&<details className="text-xs text-soil-700 rounded-lg bg-cream-100 p-2"><summary className="cursor-pointer font-medium">Conversiones a totales de 12 meses</summary><div className="mt-2 space-y-1">{Object.entries(conversion.converted).map(([key,v])=><p key={key}>{key}: {display(v)} {({B:'kg/m²',FN:'kg N/m²',E:'kg/m²',ET:'mm'})[key]}</p>)}</div></details>}
        <label className="flex items-start gap-2 text-xs text-soil-700"><input type="checkbox" className="mt-1" checked={current.verified===true} onChange={e=>setField(s.id,'verified',e.target.checked)}/><span>Confirmo que validé una secuencia real para este periodo, las restricciones agronómicas y la procedencia de estos cuatro datos. El borrador automático por sí solo NO cumple esta condición.</span></label>
        <div className="rounded-xl bg-leaf-50 p-3 space-y-1"><p className="text-xs text-soil-600">Resiliencia experimental normalizada de esta estrategia</p><p className="text-xl font-bold text-leaf-900">{result?.status==='ok'?display(result.value):'No evaluable'}</p><p className="text-xs text-soil-600">{result?.status==='excluded'?'Pendiente de verificación agronómica':result?.reason||'Índice experimental con unidades; no equivale a productividad ni porcentaje de éxito.'}</p></div>
      </div>
    </Card>})}</div>
    <Card className="space-y-3"><h2 className="text-lg font-semibold text-leaf-900">Comparación de las tres estrategias</h2><p className="text-sm text-soil-600">Se usa exactamente B × FN / (E × ET), pero con B y FN acumuladas en kg/m², E acumulada en kg/m² y ET acumulada en mm sobre los mismos 12 meses. El cociente NO es adimensional.</p>
      {evaluation.recommendationReady && evaluation.ranked.length===3 ? <div className="space-y-2"><p className="font-semibold text-leaf-900">Orden matemático experimental (no recomendación agronómica certificada)</p>{evaluation.ranked.map((r,i)=><div key={r.id} className="flex justify-between rounded-xl bg-cream-100 p-3 text-sm"><span>{i+1}. {ROTATION_STRATEGIES.find(s=>s.id===r.id).name}</span><strong>{display(r.value)}</strong></div>)}</div>:<p className="rounded-xl border border-wheat-300 bg-wheat-50 p-3 text-sm text-soil-700">Todavía no es posible recomendar una estrategia por Π8. Es necesario confirmar la viabilidad de las tres secuencias y aportar B, FN, E y ET comparables en cada una. Estado: {evaluation.status}.</p>}
      <p className="text-xs text-soil-600">Los umbrales experimentales 1 y 5 de la ficha original no se aplican a este nuevo cálculo con totales normalizados: hace falta recalibrarlos. Un valor mayor solo ordena algebraicamente estrategias comparables; no predice rendimientos ni garantiza sostenibilidad.</p>
    </Card>
  </div>
}
