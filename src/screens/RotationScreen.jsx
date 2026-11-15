import rotationRules from '../data/rotationRules.json'
import DataSourceBadge from '../components/DataSourceBadge'
import VerdictBadge from '../components/VerdictBadge'
import { Card, PageHeader } from '../components/ui'
import { FACTOR_LABELS } from '../lib/recommendations'
import { MONTH_NAMES } from '../lib/seasonWindows'

const FACTOR_ORDER = ['climate', 'soil', 'rotation', 'water', 'nutrients']

export default function RotationScreen({ farm, crops, climate, recommendations }) {
  const previousCrop = crops.find((crop) => crop.id === farm.previousCropId)
  const previousLabel = previousCrop ? previousCrop.name : 'not recorded'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 4 of 4"
        title="Crop Rotation Recommendations"
        description={`Crops ranked for ${farm.name}. The previous crop on this field is ${previousLabel}. Open any crop to see why it scored the way it did.`}
        action={<DataSourceBadge data={climate} />}
      />

      <Card className="bg-cream-100">
        <h2 className="text-sm font-semibold text-soil-900">How the score is built</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {FACTOR_ORDER.map((key) => (
            <div key={key} className="rounded-xl bg-white p-3 shadow-sm">
              <p className="text-xs text-soil-700">{FACTOR_LABELS[key]}</p>
              <p className="text-lg font-semibold text-leaf-900">{Math.round(rotationRules.weights[key] * 100)}%</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-soil-700">
          Crops with a climate fit below {rotationRules.climateGate.minimumScore} out of 100 are not recommended, whatever
          their other scores. The thresholds behind these scores are illustrative and have not been validated by an
          agronomist.
        </p>
      </Card>

      <ul className="space-y-4">
        {recommendations.map((rec, index) => (
          <li key={rec.crop.id}>
            <Card className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-sm font-semibold text-leaf-900">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-leaf-900">{rec.crop.name}</h2>
                    <p className="text-sm text-soil-700">{rec.crop.notes}</p>
                  </div>
                </div>
                <VerdictBadge verdict={rec.verdict} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-soil-700">Overall score</span>
                  <span className="font-semibold text-leaf-900">{rec.score} / 100</span>
                </div>
                <ScoreBar score={rec.score} />
              </div>

              {rec.bestStart !== null && (
                <p className="text-sm text-soil-800">
                  Best sowing window starts in <span className="font-semibold">{MONTH_NAMES[rec.bestStart]}</span>.
                </p>
              )}

              <details className="group rounded-xl border border-cream-300 bg-cream-50 open:bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium text-leaf-900 transition hover:bg-leaf-50">
                  Why this score?
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-soil-700 transition group-open:rotate-180" fill="currentColor" aria-hidden="true">
                    <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
                  </svg>
                </summary>
                <div className="space-y-4 border-t border-cream-200 px-4 py-4">
                  {FACTOR_ORDER.map((key) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium text-soil-900">{FACTOR_LABELS[key]}</span>
                        <span className="text-soil-700">{rec.factors[key].score} / 100</span>
                      </div>
                      <ScoreBar score={rec.factors[key].score} small />
                      <p className="text-sm leading-relaxed text-soil-700">{rec.factors[key].reason}</p>
                    </div>
                  ))}
                </div>
              </details>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoreBar({ score, small = false }) {
  const tone = score >= 70 ? 'bg-leaf-600' : score >= 50 ? 'bg-wheat-500' : 'bg-red-600'
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-cream-200 ${small ? 'h-2' : 'h-3'}`}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score}
    >
      <div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  )
}
