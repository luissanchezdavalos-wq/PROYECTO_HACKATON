import { useMemo, useState } from 'react'
import cropsData from './data/crops.json'
import locationsData from './data/locations.json'
import AppShell from './components/AppShell'
import { ClimateError, ClimateLoading } from './components/ClimateStatus'
import { useClimateData } from './hooks/useClimateData'
import { useFarmSetup } from './hooks/useFarmSetup'
import { buildCropSchedule } from './lib/cropSchedule'
import { recommendCrops } from './lib/recommendations'
import FarmSetupScreen from './screens/FarmSetupScreen'
import ClimateDashboardScreen from './screens/ClimateDashboardScreen'
import CropCalendarScreen from './screens/CropCalendarScreen'
import RotationScreen from './screens/RotationScreen'

const SCREENS = [
  { id: 'setup', label: 'Farm Setup', shortLabel: 'Farm Setup' },
  { id: 'climate', label: 'Climate Dashboard', shortLabel: 'Climate' },
  { id: 'calendar', label: '12-Month Calendar', shortLabel: 'Calendar' },
  { id: 'rotation', label: 'Rotation Plan', shortLabel: 'Rotation' },
]

export default function App() {
  const [screen, setScreen] = useState('setup')
  const { farm, updateFarm } = useFarmSetup()
  const location =
    locationsData.locations.find((item) => item.id === farm.locationId) ?? locationsData.locations[0]
  const climate = useClimateData(location)
  const monthly = climate.data?.months

  const analysis = useMemo(() => {
    if (!monthly) return null
    const recommendations = recommendCrops({ crops: cropsData.crops, monthly, farm })
    return { recommendations, schedule: buildCropSchedule(recommendations, monthly, farm.previousCropId) }
  }, [monthly, farm])

  let content
  if (screen === 'setup') {
    content = (
      <FarmSetupScreen farm={farm} onChange={updateFarm} onContinue={() => setScreen('climate')} />
    )
  } else if (climate.status === 'loading') {
    content = <ClimateLoading />
  } else if (climate.status === 'error') {
    content = <ClimateError message={climate.error} onRetry={climate.retry} onUseDemo={climate.useDemo} />
  } else if (screen === 'climate') {
    content = <ClimateDashboardScreen location={location} climate={climate.data} onRefresh={climate.retry} />
  } else if (screen === 'calendar') {
    content = (
      <CropCalendarScreen
        farm={farm}
        climate={climate.data}
        recommendations={analysis.recommendations}
        schedule={analysis.schedule}
      />
    )
  } else {
    content = (
      <RotationScreen
        farm={farm}
        crops={cropsData.crops}
        climate={climate.data}
        recommendations={analysis.recommendations}
        schedule={analysis.schedule}
      />
    )
  }

  return (
    <AppShell screens={SCREENS} activeId={screen} onNavigate={setScreen}>
      {content}
    </AppShell>
  )
}
