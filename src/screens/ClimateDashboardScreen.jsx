import locationsData from '../data/locations.json'
import DataSourceBadge from '../components/DataSourceBadge'
import { Button, Card, PageHeader } from '../components/ui'
import { MONTH_NAMES } from '../lib/seasonWindows'

const { startYear, endYear } = locationsData.nasaPower

export default function ClimateDashboardScreen({ location, climate, onRefresh }) {
  const months = climate.months
  const annualPrecip = months.reduce((sum, item) => sum + item.avgPrecipMm, 0)
  const annualHotDays = months.reduce((sum, item) => sum + item.hotDaysPerYear, 0)
  const meanAnnualTemp = months.reduce((sum, item) => sum + item.meanTempC, 0) / months.length
  const hottest = months.reduce((top, item) => (item.meanMaxTempC > top.meanMaxTempC ? item : top))
  const isDemo = climate.source === 'demo'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 2 of 4"
        title="NASA Climate Dashboard"
        description={`Monthly averages for ${location.name}, based on daily NASA POWER records from ${startYear} to ${endYear}.`}
        action={
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <DataSourceBadge data={climate} />
            <Button variant="secondary" onClick={onRefresh}>
              {isDemo ? 'Try live NASA data' : 'Refresh from NASA'}
            </Button>
          </div>
        }
      />

      {isDemo && (
        <Card className="border-wheat-500 bg-wheat-50">
          <p className="text-sm leading-relaxed text-wheat-900">
            <span className="font-semibold">Demo dataset in use.</span> The values below are illustrative and approximate
            Mexicali. They are not NASA measurements. Use the refresh button to load live NASA POWER data.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Annual precipitation" value={`${Math.round(annualPrecip)} mm`} note="Average total per year" />
        <StatCard label="Mean annual temperature" value={`${meanAnnualTemp.toFixed(1)} C`} note="Average of daily means" />
        <StatCard
          label="Hottest month (daily max)"
          value={`${hottest.meanMaxTempC.toFixed(1)} C`}
          note={MONTH_NAMES[hottest.month - 1]}
        />
        <StatCard label="Days above 40 C" value={annualHotDays.toFixed(1)} note="Average days per year" />
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-cream-300 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-leaf-900">Monthly climate profile</h2>
          <p className="text-sm text-soil-700">Each month is averaged across all years in the dataset.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream-100 text-xs uppercase tracking-wide text-soil-700">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Month</th>
                <th scope="col" className="px-3 py-3 font-semibold">Mean temperature</th>
                <th scope="col" className="px-3 py-3 font-semibold">Mean daily max</th>
                <th scope="col" className="px-3 py-3 font-semibold">Days above 40 C / yr</th>
                <th scope="col" className="px-5 py-3 font-semibold sm:px-6">Precipitation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {months.map((item) => (
                <tr key={item.month} className="transition hover:bg-cream-50">
                  <th scope="row" className="px-5 py-3 font-medium text-soil-900 sm:px-6">
                    {MONTH_NAMES[item.month - 1]}
                  </th>
                  <td className="px-3 py-3">
                    <Bar value={item.meanTempC} max={45} unit="C" tone="bg-leaf-500" />
                  </td>
                  <td className="px-3 py-3 text-soil-800">{item.meanMaxTempC.toFixed(1)} C</td>
                  <td className="px-3 py-3 text-soil-800">{item.hotDaysPerYear.toFixed(1)}</td>
                  <td className="px-5 py-3 sm:px-6">
                    <Bar value={item.avgPrecipMm} max={Math.max(...months.map((m) => m.avgPrecipMm), 10)} unit="mm" tone="bg-moss-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="bg-cream-100 border-cream-300">
        <h2 className="text-sm font-semibold text-soil-900">How these numbers were built</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-soil-700">
          <li>Source: NASA POWER daily data for the farm coordinates, {startYear} to {endYear}.</li>
          <li>Missing-value markers in the NASA records are excluded from every average.</li>
          <li>Results are cached on this device for 7 days so the dashboard loads faster next time.</li>
        </ul>
      </Card>
    </div>
  )
}

function StatCard({ label, value, note }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs font-medium text-soil-700">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-leaf-900">{value}</p>
      <p className="mt-1 text-xs text-soil-500">{note}</p>
    </Card>
  )
}

function Bar({ value, max, unit, tone }) {
  const width = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-24 overflow-hidden rounded-full bg-cream-200 sm:w-32" aria-hidden="true">
        <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
      <span className="whitespace-nowrap text-soil-800">
        {value.toFixed(1)} {unit}
      </span>
    </div>
  )
}
