import { useState } from 'react'
import CalendarMonthDetail from '../components/CalendarMonthDetail'
import CropCalendarGrid from '../components/CropCalendarGrid'
import DataSourceBadge from '../components/DataSourceBadge'
import VerdictBadge from '../components/VerdictBadge'
import { Card, PageHeader } from '../components/ui'
import { MONTH_NAMES, plantableMonths } from '../lib/seasonWindows'

export default function CropCalendarScreen({ farm, climate, recommendations, schedule }) {
  const [selected, setSelected] = useState(null)

  const placementByCrop = new Map(schedule.placements.map((placement) => [placement.crop.id, placement]))
  const orderedRecommendations = [
    ...schedule.placements.map((placement) => recommendations.find((rec) => rec.crop.id === placement.crop.id)),
    ...recommendations.filter((rec) => !placementByCrop.has(rec.crop.id)),
  ]
  const rows = orderedRecommendations.map((rec) => ({
    rec,
    placement: placementByCrop.get(rec.crop.id) ?? null,
    windowMonths: plantableMonths(rec.crop, climate.months),
  }))

  const selectedRow = selected ? rows.find((row) => row.rec.crop.id === selected.cropId) : null
  const activeSelection =
    selectedRow?.placement && selectedRow.placement.months.includes(selected.monthIndex) ? selected : null
  const currentMonth = new Date().getMonth()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 3 of 4"
        title="12-Month Crop Calendar"
        description={`A planting plan for ${farm.name} (${farm.areaHa} ha). Click a highlighted month to see what to do and why.`}
        action={<DataSourceBadge data={climate} />}
      />

      <CropCalendarGrid
        rows={rows}
        currentMonth={currentMonth}
        selected={activeSelection}
        onSelect={setSelected}
      />

      {activeSelection ? (
        <CalendarMonthDetail
          rec={selectedRow.rec}
          placement={selectedRow.placement}
          monthIndex={activeSelection.monthIndex}
          climate={climate}
          onClose={() => setSelected(null)}
        />
      ) : (
        <Card className="border-dashed border-cream-300 bg-cream-100 text-sm text-soil-700">
          Select any colored month in the calendar to see the activity for that month and the reasoning behind the crop.
        </Card>
      )}

      {schedule.placements.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-leaf-900">Planting timeline</h2>
          <ul className="mt-4 space-y-3">
            {schedule.placements.map((placement) => (
              <li key={placement.crop.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-soil-900">{placement.crop.name}</span>
                <span className="text-sm text-soil-700">
                  {MONTH_NAMES[placement.plantingMonth]} to {MONTH_NAMES[placement.harvestMonth]} ({placement.months.length}{' '}
                  {placement.months.length === 1 ? 'month' : 'months'})
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {schedule.unscheduled.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-leaf-900">Not on the calendar</h2>
          <ul className="mt-4 divide-y divide-cream-200">
            {schedule.unscheduled.map(({ crop, reason }) => {
              const rec = recommendations.find((item) => item.crop.id === crop.id)
              return (
                <li key={crop.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-soil-900">{crop.name}</p>
                    <p className="text-sm text-soil-700">{reason}</p>
                  </div>
                  <VerdictBadge verdict={rec.verdict} />
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}
