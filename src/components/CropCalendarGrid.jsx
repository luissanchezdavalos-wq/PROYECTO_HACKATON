import { MONTH_NAMES, plantableMonths } from '../lib/seasonWindows'
import { stageFor } from '../lib/cropSchedule'

const STAGE_STYLES = {
  planting: 'bg-leaf-700 text-white',
  growing: 'bg-leaf-300 text-leaf-900',
  harvest: 'bg-wheat-300 text-wheat-900',
}

export function stageLabel(crop, stage) {
  if (stage === 'planting') return 'Sow'
  if (stage === 'growing') return 'Grow'
  return crop.family === 'cover' ? 'End' : 'Harvest'
}

export default function CropCalendarGrid({ rows, currentMonth, selected, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-cream-300 bg-white shadow-sm">
      <div className="min-w-[760px] p-4 sm:p-5">
        <div className="grid grid-cols-[170px_repeat(12,minmax(44px,1fr))] items-end gap-1 pb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-soil-700">Crop</span>
          {MONTH_NAMES.map((name, index) => (
            <span
              key={name}
              className={`text-center text-xs font-semibold ${index === currentMonth ? 'text-leaf-800' : 'text-soil-700'}`}
            >
              {name}
            </span>
          ))}
        </div>

        <div className="space-y-1.5">
          {rows.map(({ rec, placement, windowMonths }) => (
            <div key={rec.crop.id} className="grid grid-cols-[170px_repeat(12,minmax(44px,1fr))] items-center gap-1">
              <div className="pr-2">
                <p className="text-sm font-semibold text-soil-900">{rec.crop.name}</p>
                <p className="text-xs text-soil-700">
                  {placement ? `Sow ${MONTH_NAMES[placement.plantingMonth]}, end ${MONTH_NAMES[placement.harvestMonth]}` : 'Not scheduled'}
                </p>
              </div>
              {MONTH_NAMES.map((_, monthIndex) => {
                const stage = placement ? stageFor(placement, monthIndex) : null
                const inWindow = windowMonths.includes(monthIndex)
                const isSelected = selected?.cropId === rec.crop.id && selected?.monthIndex === monthIndex
                const isCurrent = monthIndex === currentMonth

                if (stage) {
                  return (
                    <button
                      key={monthIndex}
                      type="button"
                      onClick={() => onSelect({ cropId: rec.crop.id, monthIndex })}
                      aria-pressed={isSelected}
                      aria-label={`${rec.crop.name}, ${MONTH_NAMES[monthIndex]}: ${stageLabel(rec.crop, stage)}`}
                      className={`h-11 rounded-lg text-[11px] font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        STAGE_STYLES[stage]
                      } ${isSelected ? 'ring-2 ring-leaf-900 ring-offset-2' : ''}`}
                    >
                      {stageLabel(rec.crop, stage)}
                    </button>
                  )
                }

                return (
                  <div
                    key={monthIndex}
                    title={inWindow ? 'Planting window (climate suitable)' : 'No planting in this month'}
                    className={`h-11 rounded-lg border ${
                      inWindow ? 'border-dashed border-leaf-300 bg-leaf-50' : 'border-cream-200 bg-cream-50'
                    } ${isCurrent ? 'ring-2 ring-leaf-300' : ''}`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-cream-200 pt-4 text-xs text-soil-700">
          <LegendItem className="bg-leaf-700" label="Sow or plant" />
          <LegendItem className="bg-leaf-300" label="Growing" />
          <LegendItem className="bg-wheat-300" label="Harvest or end" />
          <LegendItem className="border border-dashed border-leaf-300 bg-leaf-50" label="Climate suitable for sowing" />
        </div>
      </div>
    </div>
  )
}

function LegendItem({ className, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${className}`} aria-hidden="true" />
      {label}
    </span>
  )
}
