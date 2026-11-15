import { Badge } from './ui'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function DataSourceBadge({ data }) {
  if (!data) return null
  if (data.source === 'demo') {
    return (
      <Badge tone="demo">
        DEMO DATA. Not NASA POWER values.
      </Badge>
    )
  }
  if (data.source === 'cache') {
    return <Badge tone="cache">Cached NASA POWER data, saved {formatDate(data.fetchedAt)}</Badge>
  }
  return <Badge tone="live">Live NASA POWER data, fetched {formatDate(data.fetchedAt)}</Badge>
}
