import { Card, PageHeader, Badge } from '../components/ui'
import { MONTH_NAMES } from '../lib/seasonWindows'
export default function EnvironmentalCalendarScreen({climate}) {
 const mean = climate.months.reduce((s,m)=>s+m.meanTempC,0)/12
 const isDemo=climate.source==='demo'
 return <div className="space-y-5"><PageHeader eyebrow="Exploración mensual" title="Calendario ambiental" description="Promedios históricos por mes, sin recomendaciones de un cultivo específico ni pronósticos futuros." />
 <Card className="space-y-2 bg-cream-100"><Badge tone={isDemo?'demo':'cache'}>{isDemo?'Datos demostrativos':'NASA POWER · climatología histórica'}</Badge><p className="text-sm text-soil-700">El calendario sirve para identificar meses relativamente cálidos o frescos y más o menos lluviosos. No califica fechas como «aptas» o «no aptas» para sembrar; las necesidades varían según el cultivo y las condiciones reales del terreno.</p></Card>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{climate.months.map(m=><Card key={m.month} className="space-y-2"><h2 className="font-semibold text-leaf-900">{MONTH_NAMES[m.month-1]}</h2><p className="text-sm">Temperatura media: <strong>{m.meanTempC.toFixed(1)} °C</strong></p><p className="text-sm">Precipitación histórica: <strong>{m.avgPrecipMm.toFixed(1)} mm</strong></p><p className="text-xs text-soil-600">{m.meanTempC>mean?'Más cálido que el promedio anual':'Más fresco que el promedio anual'} · comparación descriptiva</p></Card>)}</div>
 </div>
}
