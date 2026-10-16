import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import type { Prediction } from '../types'
import { ProbabilityBar } from './ProbabilityBar'

type Props = {
  result: Prediction
}

export function ResultCard({ result }: Props) {
  const reducedMotion = useReducedMotion()
  const confidence = useMotionValue(0)
  const roundedConfidence = useTransform(confidence, (value) => Math.round(value * 100))
  const isJump = result.prediction === 'jump'

  useEffect(() => {
    const animation = animate(confidence, result.confidence, {
      duration: reducedMotion ? 0 : 1.15,
      ease: 'easeOut',
    })
    return animation.stop
  }, [confidence, result.confidence, reducedMotion])

  return (
    <motion.section
      className="result-card glass-card"
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.42, ease: 'easeOut' }}
      aria-live="polite"
      aria-labelledby="result-title"
    >
      <div className="result-heading">
        <span className="eyebrow">ANALYSIS COMPLETE</span>
        <span className="result-spark" aria-hidden="true">✦</span>
      </div>
      <div className={`result-main ${isJump ? 'is-jump' : 'is-sit'}`}>
        <span className="result-emoji" role="img" aria-label={isJump ? 'jumping person' : 'person sitting'}>{isJump ? '🦘' : '🪑'}</span>
        <h2 id="result-title">{isJump ? 'Jumping' : 'Sitting'}</h2>
      </div>
      <div className="confidence-block">
        <span className="confidence-value"><motion.span>{roundedConfidence}</motion.span>%</span>
        <span className="confidence-caption">model confidence</span>
      </div>
      <div className="probabilities">
        <div className="probabilities-heading">
          <span>Class probabilities</span>
          <span>0–100%</span>
        </div>
        <ProbabilityBar activity="jump" value={result.probabilities.jump} />
        <ProbabilityBar activity="sit" value={result.probabilities.sit} />
      </div>
      {result.confidence < 0.6 && (
        <p className="low-confidence-hint">Not sure - try a clearer, shorter video.</p>
      )}
    </motion.section>
  )
}
