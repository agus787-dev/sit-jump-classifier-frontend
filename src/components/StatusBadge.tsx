import { Activity, AlertCircle, LoaderCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import type { ServerStatus } from '../types'

type Props = {
  status: ServerStatus
  onRetry: () => void
}

const labels: Record<ServerStatus, string> = {
  connecting: 'Connecting...',
  waking: 'Server is waking up...',
  online: 'Online',
  offline: 'Offline',
  'configuration-error': 'Setup needed',
}

export function StatusBadge({ status, onRetry }: Props) {
  const Icon = status === 'online'
    ? Wifi
    : status === 'offline'
      ? WifiOff
      : status === 'configuration-error'
        ? AlertCircle
        : status === 'waking'
          ? Activity
          : LoaderCircle

  return (
    <div className={`status-wrap status-${status}`}>
      <div className="status-badge" role="status" aria-live="polite">
        <Icon size={15} aria-hidden="true" className={status === 'connecting' ? 'spin' : undefined} />
        <span>{labels[status]}</span>
      </div>
      {status === 'offline' && (
        <button className="status-retry" type="button" onClick={onRetry} aria-label="Retry server connection">
          <RefreshCw size={13} aria-hidden="true" />
          <span>Retry</span>
        </button>
      )}
    </div>
  )
}
