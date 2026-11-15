import { Badge, Button, Card, PageHeader, inputClass } from '../components/ui'
import { ADVANCED_GROUPS } from '../lib/advancedIndicators'
import { MODEL_VARIABLES } from '../lib/variableRegistry'
import IndicatorRangeCard from '../components/IndicatorRangeCard'

const DETAILS={
  pi1:'Humedad volumétrica, profundidad de raíces y precipitación acumulada.',
  pi2:'Evapotranspiración diaria frente a lluvia distribuida en el ciclo.',
  pi3:'Biomasa vegetal dividida entre materia orgánica del suelo.',
  pi4:'Relación de agua subterránea disponible frente a precipitación.',
  pi5:'Erosión ajustada al tiempo del ciclo en relación con materia orgánica.',
  pi6:'Fijación biológica de nitrógeno ajustada al ciclo y materia orgánica.',
  pi7:'Temperatura superficial dividida entre la temperatura óptima de referencia.',
  pi8:'Expresión original B × FN / (E × ET); no es estrictamente adimensional.'
}
const IMPORTANT={
  T:'Temperatura de superficie, no la temperatura del aire NASA POWER.',
  Topt:'Referencia térmica que corresponde al contexto evaluado; sin cultivo no hay un óptimo universal.',
  ET:'Promedio diario (mm/día), no total anual; no mezclar con evapotranspiración potencial sin aclararlo.',
  FN:'Tasa anual de fijación; no se deduce de cualquier tipo de terreno.',
  E:'Tasa anual de erosión; requiere estimación o medición documentada.',
  MOS:'Cantidad de materia orgánica por superficie (no porcentaje); requiere una conversión respaldada.',
  P:'Si se introduce manualmente, debe ser precipitación acumulada del periodo del análisis.'
}
const keys=Object.keys(MODEL_VARIABLES)
const showValue = value => Number(value).toLocaleString('es-MX',{maximumSignificantDigits:6})
const NUMERIC_DRAFT = /^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]*)?$/
export default function AdvancedIndicatorsScreen({indicators,input,missing,manual,onManual,acknowledged,onAcknowledged,climate}) {
 const calculated=Object.values(indicators).filter(v=>v.status==='ok').length
 // Keep farmer-provided fields mounted while editing. Only hide fields with automatic data.
 const unavailable=keys.filter(key=>!input[key] || input[key].provenance==='farmer')
 const isDemo=climate.source==='demo'
 const automatic=Object.entries(input).filter(([_,v])=>v.provenance!=='farmer')
 return <div className="space-y-6">
  <PageHeader eyebrow="Análisis complementario" title="Indicadores avanzados" description="NASA completa automáticamente los datos compatibles. Agrega solo las mediciones o estimaciones que ya tengas de tu terreno; no hace falta seleccionar un cultivo."/>
  <Card className="space-y-3 bg-cream-100">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-leaf-900">Datos obtenidos automáticamente</h2><Badge tone={isDemo?'demo':'live'}>{isDemo?'Modo demostración':'NASA POWER'}</Badge></div>
    {automatic.length ? automatic.map(([key,item])=><div key={key} className="rounded-lg border border-leaf-100 bg-white p-3"><p className="text-sm font-semibold text-leaf-900">{MODEL_VARIABLES[key].label}: {showValue(item.value)} {item.unit}</p><p className="text-xs text-soil-600">{item.source}</p><p className="text-xs text-soil-500">{item.period} · {item.provenance==='estimated'?'Dato estimado/modelado':'Dato de fuente'}</p></div>) : <p className="text-sm text-soil-700">No hay variables del motor obtenidas automáticamente. Puedes continuar con información manual.</p>}
    <p className="text-xs text-soil-600">NASA POWER representa valores de celdas de modelos o reanálisis, no mediciones directas de una parcela. La temperatura del aire no sustituye a T. Los valores climáticos medios de diferentes periodos no son un balance anual específico.</p>
    {climate.extended?.errors?.length>0&&<p className="text-xs text-wheat-900">Algunas variables adicionales no se pudieron consultar: {climate.extended.errors.join('; ')}</p>}
  </Card>
  {indicators.pi1?.status!=='ok' && <Card className="space-y-2 border-wheat-300 bg-wheat-50">
    <h2 className="font-semibold text-leaf-900">Índice hídrico del suelo — datos necesarios</h2>
    <p className="text-sm text-soil-800">El cálculo utiliza humedad volumétrica del suelo (θ), profundidad efectiva de raíces (Zr) y precipitación acumulada (P).</p>
    <p className="text-sm text-soil-800"><strong>Faltan:</strong> {missing.find(item=>item.id==='pi1')?.missing.map(key=>MODEL_VARIABLES[key].label).join(', ') || indicators.pi1.reason || 'Revisar unidades o valores'}</p>
    <p className="text-xs text-soil-600">Completa los campos correspondientes abajo, solo cuando dispongas de medidas o estimaciones fundamentadas. Si ya hay datos automáticos, no se solicitarán otra vez.</p>
  </Card>}
  <Card className="space-y-4">
    <div><h2 className="text-lg font-semibold text-leaf-900">Información adicional del agricultor</h2><p className="text-sm text-soil-700">Completa únicamente los campos que conoces. Los datos manuales permanecen editables y puedes escribir números de varias cifras o decimales. Los demás permanecerán como «No calculable». Cada dato debe representar el mismo terreno y un periodo compatible.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{unavailable.map(key=><label key={key} className="block text-sm text-soil-800"><span className="block font-semibold">{MODEL_VARIABLES[key].label}</span><span className="block text-xs text-soil-500">{key} · {MODEL_VARIABLES[key].unit}</span><input className={`${inputClass} mt-2`} type="text" inputMode="decimal" pattern="[0-9]*[.]?[0-9]*" value={typeof manual[key]==='string'?manual[key]:manual[key]?.value??''} onChange={e=>{const next=e.target.value;if(NUMERIC_DRAFT.test(next))onManual(current=>({...current,[key]:{value:next,period:current[key]?.period||''}}))}} placeholder="Dejar vacío si no se conoce"/><span className="mt-1 block text-xs text-soil-600">Solo números no negativos con punto decimal. {IMPORTANT[key]||'Introduce un valor respaldado por datos de tu parcela.'}</span><span className="mt-2 block text-xs text-soil-600">Periodo o referencia (opcional)</span><input className={`${inputClass} mt-1 text-sm`} value={manual[key]?.period||''} onChange={e=>onManual(current=>({...current,[key]:{value:current[key]?.value||'',period:e.target.value}}))} placeholder="Ej. media anual, ciclo o fuente"/></label>)}</div>
    {unavailable.length===0 && <p className="text-sm text-leaf-800">Todas las variables tienen valores disponibles. Revisa sus unidades y periodos.</p>}
    <label className="flex items-start gap-3 rounded-xl bg-cream-100 p-3 text-sm text-soil-800"><input type="checkbox" className="mt-1" checked={acknowledged} onChange={e=>onAcknowledged(e.target.checked)}/>Confirmo que comprobaré que mis datos corresponden al mismo terreno y periodos compatibles. Entiendo que los indicadores son experimentales y no certifican una fecha de siembra.</label>
    <Button variant="secondary" onClick={()=>{onManual({});onAcknowledged(false)}}>Limpiar entradas manuales</Button>
  </Card>
  <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold text-leaf-900">Resultados de las ocho fórmulas</h2><Badge tone={calculated?'live':'neutral'}>{calculated} de 8 calculables</Badge></div>
  {!acknowledged && <p className="rounded-xl border border-wheat-300 bg-wheat-50 p-3 text-sm text-wheat-900">Marca la confirmación del periodo y procedencia para mostrar resultados numéricos. Puedes revisar los datos faltantes desde ahora.</p>}
  <div className="grid gap-4 sm:grid-cols-2">{ADVANCED_GROUPS.map(({id,keys:required})=>{
    const r=indicators[id];const gap=missing.find(x=>x.id===id)
    return <div key={id} className="space-y-2"><IndicatorRangeCard id={id} result={r} unlocked={acknowledged} details={DETAILS[id]}/><div className="px-2 text-xs text-soil-600">Variables: {required.map(k=>MODEL_VARIABLES[k].label).join(' · ')}{gap?.missing.length>0&&<p className="mt-1 text-wheat-900">Faltan: {gap.missing.join(', ')}</p>}{gap?.missing.length===0&&r.status!=='ok'&&<p className="mt-1 text-wheat-900">{r.reason}</p>}</div></div>
  })}</div>
  <Card className="space-y-2 border-wheat-300 bg-wheat-50"><h2 className="font-semibold text-wheat-900">Alcance científico</h2><p className="text-sm text-soil-800">El indicador de resiliencia de la rotación se conserva por fidelidad al trabajo original. Sin una rotación definida, su valor es solamente el resultado algebraico experimental de datos proporcionados, no la resiliencia comprobada de una secuencia agrícola. Las relaciones entre datos históricos anuales y duraciones de ciclos deben validarse antes de interpretar resultados.</p></Card>
 </div>
}
