import { AlertTriangle, RotateCcw } from 'lucide-react'

type Props = {
  message: string
  onRetry: () => void
}

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-icon"><AlertTriangle size={18} aria-hidden="true" /></span>
      <div className="error-copy">
        <strong>We couldn’t analyze that video</strong>
        <p>{message}</p>
      </div>
      <button className="error-retry" type="button" onClick={onRetry}>
        <RotateCcw size={14} aria-hidden="true" />
        <span>Try again</span>
      </button>
    </div>
  )
}
