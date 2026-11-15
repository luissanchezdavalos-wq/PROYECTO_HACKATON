import { Badge, Button, Card, PageHeader } from '../components/ui'
import { INDICATOR_NAMES } from '../lib/variableRegistry'
const descriptions = {
  pi1:'Disponibilidad hídrica frente a la precipitación',
  pi2:'Relación entre evapotranspiración y precipitación',
  pi3:'Biomasa en relación con materia orgánica',
  pi4:'Agua subterránea en relación con lluvia',
  pi5:'Relación de erosión y materia orgánica',
  pi6:'Fijación de nitrógeno y materia orgánica',
  pi7:'Temperatura superficial y referencia térmica',
  pi8:'Relación experimental entre biomasa, nitrógeno, erosión y ET'
}
export default function EnvironmentalIndicatorsScreen({indicators,input,climate,onAdvanced}) {
  const actual=climate.source!=='demo'
  const precipitation=input.P?.value
  const temp=climate.months.reduce((s,m)=>s+m.meanTempC,0)/climate.months.length
  return <div className="space-y-6">
    <PageHeader eyebrow="Panel automático" title="Indicadores normales" description="Consulta descriptiva de datos climáticos. No necesitas seleccionar ningún cultivo ni introducir información técnica."/>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="space-y-2"><Badge tone={actual?'live':'demo'}>{actual?'NASA POWER':'Datos demo'}</Badge><p className="text-sm text-soil-700">Precipitación media anual histórica</p><p className="text-3xl font-semibold text-leaf-900">{actual && Number.isFinite(precipitation)?`${precipitation.toFixed(1)} mm`:'No disponible'}</p><p className="text-xs text-soil-500">Derivada de los promedios mensuales históricos; no pronóstico.</p></Card>
      <Card className="space-y-2"><Badge tone={actual?'live':'demo'}>{actual?'NASA POWER':'Datos demo'}</Badge><p className="text-sm text-soil-700">Temperatura media del aire histórica</p><p className="text-3xl font-semibold text-leaf-900">{temp.toFixed(1)} °C</p><p className="text-xs text-soil-500">No equivale a temperatura superficial T del modelo.</p></Card>
      <Card className="space-y-2"><Badge tone={input.theta||input.ET?'live':'neutral'}>{input.theta||input.ET?'NASA POWER · estimado':'No disponible'}</Badge><p className="text-sm text-soil-700">Humedad superficial y evapotranspiración</p><p className="text-sm font-semibold text-leaf-900">Humedad: {input.theta?`${(input.theta.value*100).toFixed(1)} % vol.`:'Sin datos'}</p><p className="text-sm font-semibold text-leaf-900">ET aproximada: {input.ET?`${input.ET.value.toFixed(2)} mm/día`:'Sin datos'}</p><p className="text-xs text-soil-500">Información modelada, no medida en la parcela. ET estimada de flujos energéticos con supuestos. Si la API no devuelve valores, permanece sin calcular.</p></Card>
    </div>
    <Card className="space-y-3 bg-cream-100"><h2 className="text-lg font-semibold text-leaf-900">¿Y los ocho indicadores matemáticos?</h2><p className="text-sm text-soil-700">Las ocho fórmulas se conservan. Dado que NASA POWER por sí sola no proporciona todas sus variables, el cálculo completo se realiza en Indicadores avanzados, combinando los valores automáticos compatibles con datos adicionales del agricultor.</p><Button onClick={onAdvanced}>Abrir Indicadores avanzados →</Button></Card>
    <div className="grid gap-3 sm:grid-cols-2">{Object.entries(indicators).map(([key,r])=><Card key={key} className="space-y-2"><h3 className="font-semibold text-leaf-900">{INDICATOR_NAMES[key]}</h3><p className="text-sm text-soil-700">{descriptions[key]}</p><Badge tone={r.status==='ok'?'live':'neutral'}>{r.status==='ok'?'Calculable con datos disponibles':'Requiere datos complementarios'}</Badge></Card>)}</div>
    <p className="text-xs text-soil-600">Los indicadores experimentales no constituyen una garantía de que una fecha sea apta para sembrar cualquier cultivo.</p>
  </div>
}
