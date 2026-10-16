import { motion, useReducedMotion } from 'framer-motion'
import type { Activity } from '../types'

type Props = {
  activity: Activity
  value: number
}

export function ProbabilityBar({ activity, value }: Props) {
  const reducedMotion = useReducedMotion()
  const percentage = Math.max(0, Math.min(100, value * 100))
  const label = activity === 'jump' ? 'Jumping' : 'Sitting'

  return (
    <div className="probability-row">
      <div className="probability-label">
        <span>{label}</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div
        className="probability-track"
        role="progressbar"
        aria-label={`${label} probability`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
      >
        <motion.div
          className={`probability-fill ${activity}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.9, ease: 'easeOut', delay: reducedMotion ? 0 : 0.18 }}
        />
      </div>
    </div>
  )
}
