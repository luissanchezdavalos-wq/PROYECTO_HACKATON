import { Badge, Button, Card, PageHeader, inputClass } from '../components/ui'
import { ADVANCED_GROUPS } from '../lib/advancedIndicators'
import { INDICATOR_NAMES, MODEL_VARIABLES } from '../lib/variableRegistry'

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
export default function AdvancedIndicatorsScreen({indicators,input,missing,manual,onManual,acknowledged,onAcknowledged,climate}) {
 const calculated=Object.values(indicators).filter(v=>v.status==='ok').length
 const unavailable=keys.filter(key=>!input[key])
 const isDemo=climate.source==='demo'
 return <div className="space-y-6">
  <PageHeader eyebrow="Análisis complementario" title="Indicadores avanzados" description="NASA completa automáticamente los datos compatibles. Agrega solo las mediciones o estimaciones que ya tengas de tu terreno; no hace falta seleccionar un cultivo."/>
  <Card className="space-y-3 bg-cream-100">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-leaf-900">Datos obtenidos automáticamente</h2><Badge tone={isDemo?'demo':'live'}>{isDemo?'Modo demostración':'NASA POWER'}</Badge></div>
    <p className="text-sm text-soil-700">{input.P ? `Precipitación media anual histórica: ${showValue(input.P.value)} mm (NASA POWER).` : 'Precipitación real aún no disponible para el motor matemático.'}</p>
    <p className="text-xs text-soil-600">NASA POWER también entrega temperatura del aire, pero no la usamos como temperatura superficial T. Si hay datos demostrativos, nunca se insertan como valores reales del modelo.</p>
  </Card>
  <Card className="space-y-4">
    <div><h2 className="text-lg font-semibold text-leaf-900">Información adicional del agricultor</h2><p className="text-sm text-soil-700">Completa únicamente los campos que conoces. Los demás permanecerán como «No calculable». Cada dato debe representar el mismo terreno y un periodo compatible.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{unavailable.map(key=><label key={key} className="block text-sm text-soil-800"><span className="block font-semibold">{MODEL_VARIABLES[key].label}</span><span className="block text-xs text-soil-500">{key} · {MODEL_VARIABLES[key].unit}</span><input className={`${inputClass} mt-2`} type="number" step="any" value={typeof manual[key]==='string'?manual[key]:manual[key]?.value??''} onChange={e=>onManual(current=>({...current,[key]:{value:e.target.value,period:current[key]?.period||''}}))} placeholder="Dejar vacío si no se conoce"/><span className="mt-1 block text-xs text-soil-600">{IMPORTANT[key]||'Introduce un valor respaldado por datos de tu parcela.'}</span><span className="mt-2 block text-xs text-soil-600">Periodo o referencia (opcional)</span><input className={`${inputClass} mt-1 text-sm`} value={manual[key]?.period||''} onChange={e=>onManual(current=>({...current,[key]:{value:current[key]?.value||'',period:e.target.value}}))} placeholder="Ej. media anual, ciclo o fuente"/></label>)}</div>
    {unavailable.length===0 && <p className="text-sm text-leaf-800">Todas las variables tienen valores disponibles. Revisa sus unidades y periodos.</p>}
    <label className="flex items-start gap-3 rounded-xl bg-cream-100 p-3 text-sm text-soil-800"><input type="checkbox" className="mt-1" checked={acknowledged} onChange={e=>onAcknowledged(e.target.checked)}/>Confirmo que comprobaré que mis datos corresponden al mismo terreno y periodos compatibles. Entiendo que los indicadores son experimentales y no certifican una fecha de siembra.</label>
    <Button variant="secondary" onClick={()=>{onManual({});onAcknowledged(false)}}>Limpiar entradas manuales</Button>
  </Card>
  <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold text-leaf-900">Resultados de las ocho fórmulas</h2><Badge tone={calculated?'live':'neutral'}>{calculated} de 8 calculables</Badge></div>
  {!acknowledged && <p className="rounded-xl border border-wheat-300 bg-wheat-50 p-3 text-sm text-wheat-900">Marca la confirmación del periodo y procedencia para mostrar resultados numéricos. Puedes revisar los datos faltantes desde ahora.</p>}
  <div className="grid gap-4 sm:grid-cols-2">{ADVANCED_GROUPS.map(({id,keys:required})=>{
    const r=indicators[id];const gap=missing.find(x=>x.id===id)
    return <Card key={id} className="space-y-3"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-leaf-900">{INDICATOR_NAMES[id]}</h3><Badge tone={r.status==='ok'&&acknowledged?'live':'neutral'}>{r.status==='ok'&&acknowledged?'Calculado':'No calculable'}</Badge></div><p className="text-sm text-soil-700">{DETAILS[id]}</p><p className="text-2xl font-bold text-leaf-900">{r.status==='ok'&&acknowledged?showValue(r.value):'—'}</p><p className="text-xs text-soil-600">Variables: {required.map(k=>`${k} (${MODEL_VARIABLES[k].unit})`).join(' · ')}</p>{gap?.missing.length>0&&<p className="text-xs text-wheat-900">Faltan: {gap.missing.join(', ')}</p>}{gap?.missing.length===0&&r.status!=='ok'&&<p className="text-xs text-wheat-900">{r.reason}</p>}{r.status==='ok'&&acknowledged&&<p className="text-xs text-soil-600">Origen: {Object.entries(r.sources||{}).map(([k,v])=>`${k}: ${v==='farmer'?'agricultor':'NASA/estimado'}`).join('; ')}</p>}</Card>
  })}</div>
  <Card className="space-y-2 border-wheat-300 bg-wheat-50"><h2 className="font-semibold text-wheat-900">Alcance científico</h2><p className="text-sm text-soil-800">El indicador de resiliencia de la rotación se conserva por fidelidad al trabajo original. Sin una rotación definida, su valor es solamente el resultado algebraico experimental de datos proporcionados, no la resiliencia comprobada de una secuencia agrícola. Las relaciones entre datos históricos anuales y duraciones de ciclos deben validarse antes de interpretar resultados.</p></Card>
 </div>
}
