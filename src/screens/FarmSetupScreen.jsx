import cropsData from '../data/crops.json'
import locationsData from '../data/locations.json'
import rotationRules from '../data/rotationRules.json'
import { Button, Card, PageHeader, inputClass } from '../components/ui'

const WATER_OPTIONS = [
  { id: 'low', label: 'Low', hint: 'Limited canal allocation' },
  { id: 'medium', label: 'Medium', hint: 'Typical district allocation' },
  { id: 'high', label: 'High', hint: 'Full allocation or wells' },
]

const MAX_AREA_HA = 10000

export default function FarmSetupScreen({ farm, onChange, onContinue }) {
  const areaNumber = Number(farm.areaHa)
  const areaValid = Number.isFinite(areaNumber) && areaNumber > 0 && areaNumber <= MAX_AREA_HA

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Step 1 of 4"
        title="Farm Setup"
        description="Describe your field. AgroShift uses these details with NASA climate averages to suggest a crop rotation for the year."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Farm name" htmlFor="farm-name">
              <input
                id="farm-name"
                type="text"
                className={inputClass}
                value={farm.name}
                maxLength={60}
                onChange={(event) => onChange({ name: event.target.value })}
              />
            </Field>

            <Field label="Location" htmlFor="farm-location">
              <select
                id="farm-location"
                className={inputClass}
                value={farm.locationId}
                onChange={(event) => onChange({ locationId: event.target.value })}
              >
                {locationsData.locations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Field size (hectares)"
              htmlFor="farm-area"
              hint={areaValid ? null : `Enter a number between 0.1 and ${MAX_AREA_HA.toLocaleString()}.`}
              error={!areaValid}
            >
              <input
                id="farm-area"
                type="text"
                inputMode="decimal"
                className={inputClass}
                value={farm.areaHa}
                aria-invalid={!areaValid}
                onChange={(event) => onChange({ areaHa: event.target.value })}
              />
            </Field>

            <Field
              label="Soil type"
              htmlFor="farm-soil"
              hint="From a field survey. Soil nutrient levels are not estimated from satellite data."
            >
              <select
                id="farm-soil"
                className={inputClass}
                value={farm.soilType}
                onChange={(event) => onChange({ soilType: event.target.value })}
              >
                {rotationRules.soilTypes.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Previous crop on this field" htmlFor="farm-previous" className="sm:col-span-2">
              <select
                id="farm-previous"
                className={inputClass}
                value={farm.previousCropId}
                onChange={(event) => onChange({ previousCropId: event.target.value })}
              >
                <option value="none">Not recorded</option>
                {cropsData.crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-soil-900">Irrigation water supply</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {WATER_OPTIONS.map((option) => {
                const selected = farm.waterSupply === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onChange({ waterSupply: option.id })}
                    className={`rounded-xl border px-4 py-3 text-left transition duration-200 ${
                      selected
                        ? 'border-leaf-600 bg-leaf-50 ring-4 ring-leaf-100'
                        : 'border-cream-300 bg-white hover:border-leaf-300'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-leaf-900">{option.label}</span>
                    <span className="block text-xs text-soil-700">{option.hint}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>
        </Card>

        <Card className="flex flex-col justify-between gap-6 bg-leaf-50 border-leaf-200">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-leaf-900">What happens next</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-soil-800">
              <li>Review 10 years of NASA POWER climate averages for your location.</li>
              <li>See a 12-month calendar of planting and harvest windows.</li>
              <li>Compare crop options and the reasons behind each recommendation.</li>
            </ol>
            <p className="text-xs leading-relaxed text-soil-700">
              Thresholds used for scoring are illustrative and have not been validated by an agronomist.
            </p>
          </div>
          <Button onClick={onContinue} disabled={!areaValid} className="w-full">
            View climate data
          </Button>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, hint, error = false, className = '', children }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-soil-900">
        {label}
      </label>
      {children}
      {hint && <p className={`text-xs leading-relaxed ${error ? 'text-red-700' : 'text-soil-700'}`}>{hint}</p>}
    </div>
  )
}
