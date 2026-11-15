import { Badge } from './ui'
import { VERDICT_LABELS } from '../lib/recommendations'

const VERDICT_TONES = {
  recommended: 'live',
  conditional: 'demo',
  not_recommended: 'error',
}

export default function VerdictBadge({ verdict }) {
  return <Badge tone={VERDICT_TONES[verdict]}>{VERDICT_LABELS[verdict]}</Badge>
}
