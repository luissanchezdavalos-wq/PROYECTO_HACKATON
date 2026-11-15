import { MONTH_NAMES } from '../lib/seasonWindows'
import { stageFor } from '../lib/cropSchedule'
import { Card } from './ui'
import VerdictBadge from './VerdictBadge'

const STAGE_TITLES = {
  planting: 'Sowing or planting',
  growing: 'Growing season',
  harvest: 'Harvest or end of cycle',
}

const STAGE_GUIDANCE = {
  planting: 'Prepare the seedbed, sow or plant, and irrigate to establish the stand.',
  growing: 'Keep irrigation on schedule, scout for pests and weeds, and follow the fertilizer plan from a lab soil test.',
  harvest: 'Harvest once the crop reaches maturity, then prepare the field for the next crop in the rotation.',
  terminate: 'Terminate the cover crop and incorporate its residue before the next crop is planted.',
}

export default function CalendarMonthDetail({ rec, placement, monthIndex, climate, onClose }) {
  const stage = stageFor(placement, monthIndex)
  const isCover = rec.crop.family === 'cover'
  const guidanceKey = stage === 'harvest' && isCover ? 'terminate' : stage
  const climateMonth = climate.months[monthIndex]
  const isDemo = climate.source === 'demo'

  return (
    <Card className="space-y-5 border-leaf-200 bg-leaf-50" role="region" aria-label="Selected month details">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-leaf-700">
            {MONTH_NAMES[monthIndex]} selected
          </p>
          <h2 className="text-xl font-semibold text-leaf-900">
            {rec.crop.name}: {STAGE_TITLES[stage]}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-soil-700 transition hover:bg-white hover:text-leaf-900"
        >
          Close
        </button>
      </div>

      <p className="text-sm leading-relaxed text-soil-800">{STAGE_GUIDANCE[guidanceKey]}</p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Mean temperature" value={`${climateMonth.meanTempC.toFixed(1)} C`} />
        <Metric label="Mean daily max" value={`${climateMonth.meanMaxTempC.toFixed(1)} C`} />
        <Metric label="Precipitation" value={`${climateMonth.avgPrecipMm.toFixed(1)} mm`} />
      </div>
      <p className="text-xs text-soil-700">
        {isDemo
          ? 'Climate values come from the DEMO dataset and are not NASA measurements.'
          : 'Climate values are multi-year monthly averages from NASA POWER.'}
      </p>

      <div className="space-y-2 border-t border-leaf-200 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-leaf-900">Why {rec.crop.name} is on this calendar</p>
          <VerdictBadge verdict={rec.verdict} />
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-soil-800">
          <li>{rec.factors.climate.reason}</li>
          <li>{rec.factors.rotation.reason}</li>
        </ul>
      </div>
    </Card>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className="text-xs text-soil-700">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-leaf-900">{value}</p>
    </div>
  )
}
