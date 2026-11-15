import { powerDateRange } from '../lib/powerDateRange'
import { Card } from './ui'

const { startYear, endDate } = powerDateRange()

export function ClimateLoading() {
  return (
    <Card className="flex flex-col items-center gap-4 py-12 text-center" role="status" aria-live="polite">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-leaf-100 border-t-leaf-600" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-leaf-900">Loading NASA POWER climate records</p>
        <p className="text-sm text-soil-700">Downloading daily data for {startYear} to {endDate.slice(0,4)}. This can take a few seconds.</p>
      </div>
    </Card>
  )
}

export function ClimateError({ message, onRetry, onUseDemo }) {
  return (
    <Card className="space-y-4 border-red-200" role="alert">
      <div className="space-y-1">
        <p className="text-base font-semibold text-red-900">We could not load live NASA climate data</p>
        <p className="text-sm leading-relaxed text-soil-700">
          The NASA POWER service did not respond as expected ({message}). Try again, or continue with the local demo
          dataset. Demo values are clearly labeled and are not real measurements.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRetry}>Try again</Button>
        <Button variant="wheat" onClick={onUseDemo}>Use local demo dataset</Button>
      </div>
    </Card>
  )
}
