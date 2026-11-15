import { Card, PageHeader, Button } from '../components/ui'
export default function EnvironmentalSetupScreen({ location, locations, onLocation, onContinue }) {
  return <div className="space-y-5">
    <PageHeader eyebrow="Paso 1" title="Evaluación ambiental del terreno" description="Explora condiciones climáticas históricas y ocho indicadores experimentales, sin seleccionar cultivos." />
    <Card className="space-y-4">
      <label className="block text-sm font-medium text-soil-800" htmlFor="location">Ubicación</label>
      <select id="location" value={location.id} onChange={e=>onLocation(e.target.value)} className="w-full rounded-xl border border-cream-300 p-3">{locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>
      <p className="text-sm text-soil-700">{location.climateNote}</p>
      <Button onClick={onContinue}>Consultar datos climáticos</Button>
    </Card>
    <Card className="space-y-2 bg-cream-100">
      <h2 className="font-semibold text-leaf-900">¿Qué podrá determinar AgroShift?</h2>
      <p className="text-sm text-soil-700">Identificará patrones de calor y precipitación por mes. No certificará que una fecha sea apta para todas las especies: esa decisión exige conocer el cultivo, suelo, pronóstico y riesgos locales.</p>
      <p className="text-sm text-soil-700">Los indicadores que requieran datos ausentes aparecerán como «No calculable», nunca como cero.</p>
    </Card>
  </div>
}
