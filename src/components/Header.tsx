import { Moon, Sun } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'
import type { ServerStatus } from '../types'
import { StatusBadge } from './StatusBadge'

type Props = {
  status: ServerStatus
  onRetry: () => void
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ status, onRetry, theme, onToggleTheme }: Props) {
  const ThemeIcon = theme === 'dark' ? Sun : Moon

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Sit or Jump home">
        <span className="brand-mark" aria-hidden="true"><span>↗</span></span>
        <span>Sit or <strong>Jump</strong></span>
      </a>
      <div className="header-actions">
        <StatusBadge status={status} onRetry={onRetry} />
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <ThemeIcon size={17} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
