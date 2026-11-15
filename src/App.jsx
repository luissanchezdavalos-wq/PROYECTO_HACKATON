import { useMemo, useState } from 'react'
import locationsData from './data/locations.json'
import AppShell from './components/AppShell'
import { ClimateError, ClimateLoading } from './components/ClimateStatus'
import { useClimateData } from './hooks/useClimateData'
import EnvironmentalSetupScreen from './screens/EnvironmentalSetupScreen'
import ClimateDashboardScreen from './screens/ClimateDashboardScreen'
import EnvironmentalIndicatorsScreen from './screens/EnvironmentalIndicatorsScreen'
import AdvancedIndicatorsScreen from './screens/AdvancedIndicatorsScreen'
import EnvironmentalCalendarScreen from './screens/EnvironmentalCalendarScreen'
import CropInsightsScreen from './screens/CropInsightsScreen'
import { buildModelInput, analyzeMissingInputs } from './lib/advancedIndicators'
import { calculateIndicators } from './lib/buckingham'

const SCREENS = [
  { id:'setup', label:'Terreno', shortLabel:'Terreno' },
  { id:'climate', label:'Datos NASA', shortLabel:'NASA' },
  { id:'indicators', label:'Indicadores normales', shortLabel:'Normal' },
  { id:'advanced', label:'Indicadores avanzados', shortLabel:'Avanzado' },
  { id:'calendar', label:'Calendario agrícola', shortLabel:'Calendario' },
  { id:'crops', label:'Crop Insights', shortLabel:'Cultivos' },
]

export default function App() {
  const [screen,setScreen]=useState('setup')
  const [locationId,setLocationId]=useState('mexicali')
  const [manual,setManual]=useState({})
  const [acknowledged,setAcknowledged]=useState(false)
  const location=locationsData.locations.find(l=>l.id===locationId) ?? locationsData.locations[0]
  const climate=useClimateData(location)
  const modelInput=useMemo(()=>buildModelInput(climate.data,manual),[climate.data,manual])
  const indicators=useMemo(()=>calculateIndicators(modelInput),[modelInput])
  const missing=useMemo(()=>analyzeMissingInputs(indicators,modelInput),[indicators,modelInput])

  let content
  if(screen==='setup') content=<EnvironmentalSetupScreen location={location} locations={locationsData.locations} onLocation={(id)=>{setLocationId(id);setManual({});setAcknowledged(false)}} onContinue={()=>setScreen('climate')}/>
  else if(climate.status==='loading') content=<ClimateLoading/>
  else if(climate.status==='error') content=<ClimateError message={climate.error} onRetry={climate.retry} onUseDemo={climate.useDemo}/>
  else if(screen==='climate') content=<ClimateDashboardScreen location={location} climate={climate.data} onRefresh={climate.retry}/>
  else if(screen==='indicators') content=<EnvironmentalIndicatorsScreen indicators={indicators} input={modelInput} climate={climate.data} onAdvanced={()=>setScreen('advanced')}/>
  else if(screen==='advanced') content=<AdvancedIndicatorsScreen indicators={indicators} input={modelInput} missing={missing} manual={manual} onManual={setManual} acknowledged={acknowledged} onAcknowledged={setAcknowledged} climate={climate.data}/>
  else if(screen==='crops') content=<CropInsightsScreen climate={climate.data} location={location} indicators={indicators}/>
  else content=<EnvironmentalCalendarScreen climate={climate.data} onCropInsights={()=>setScreen('crops')}/>
  return <AppShell screens={SCREENS} activeId={screen} onNavigate={setScreen}>{content}</AppShell>
}
