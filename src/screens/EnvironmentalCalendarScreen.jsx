import { Card, PageHeader, Badge, Button } from '../components/ui'
import { evaluateMonth } from '../lib/cropInsights'
import { MONTH_NAMES } from '../lib/seasonWindows'
export default function EnvironmentalCalendarScreen({climate,onCropInsights}) {
 const mean = climate.months.reduce((s,m)=>s+m.meanTempC,0)/12
 const isDemo=climate.source==='demo'
 return <div className="space-y-5"><PageHeader eyebrow="Exploración mensual" title="Calendario agrícola exploratorio" description="Promedios históricos por mes, sin pronósticos futuros." />
 <Card className="space-y-2 bg-cream-100"><Badge tone={isDemo?'demo':'cache'}>{isDemo?'Datos demostrativos':'NASA POWER · climatología histórica'}</Badge><p className="text-sm text-soil-700">El calendario sirve para identificar meses relativamente cálidos o frescos y más o menos lluviosos. Las categorías representan coincidencias térmicas de especies de ejemplo, no fechas de siembra certificadas. Faltan riego, suelos, heladas y validación agronómica.</p></Card>
 <Button variant="secondary" onClick={onCropInsights}>Explorar categorías en Crop Insights →</Button><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{climate.months.map(m=><Card key={m.month} className="space-y-2"><h2 className="font-semibold text-leaf-900">{MONTH_NAMES[m.month-1]}</h2><p className="text-sm">Temperatura media: <strong>{m.meanTempC.toFixed(1)} °C</strong></p><p className="text-sm">Precipitación histórica: <strong>{m.avgPrecipMm.toFixed(1)} mm</strong></p><p className="text-xs text-soil-600">{(evaluateMonth(m)||[]).map(c=>`${c.label}: ${c.compatibleCount}/${c.total}`).join(" · ")}</p><p className="text-[11px] text-soil-500">Coincidencias térmicas orientativas, no aptitud completa.</p><p className="text-xs text-soil-600">{m.meanTempC>mean?'Más cálido que el promedio anual':'Más fresco que el promedio anual'} · comparación descriptiva</p></Card>)}</div>
 </div>
}
