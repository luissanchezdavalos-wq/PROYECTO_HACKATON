import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'agroshift:farm-setup'

const DEFAULT_FARM = {
  name: 'Valle Norte Field',
  locationId: 'mexicali',
  areaHa: '12',
  soilType: 'Clay loam',
  previousCropId: 'corn',
  waterSupply: 'medium',
}

function readStoredFarm() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_FARM, ...JSON.parse(raw) } : DEFAULT_FARM
  } catch {
    return DEFAULT_FARM
  }
}

export function useFarmSetup() {
  const [farm, setFarm] = useState(readStoredFarm)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(farm))
    } catch {
      // Storage can be unavailable; the farm still works for this session.
    }
  }, [farm])

  const updateFarm = useCallback((patch) => setFarm((current) => ({ ...current, ...patch })), [])

  return { farm, updateFarm }
}
