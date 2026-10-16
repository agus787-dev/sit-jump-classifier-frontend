import { useCallback, useEffect, useState } from 'react'
import { ApiError, checkHealth, getApiConfigurationError } from '../api/client'
import type { ServerStatus } from '../types'

const RETRY_INTERVAL_MS = 5_000
const MAX_WAIT_MS = 90_000

export function useServerStatus() {
  const configurationError = getApiConfigurationError()
  const [status, setStatus] = useState<ServerStatus>(() => configurationError ? 'configuration-error' : 'connecting')
  const [retryKey, setRetryKey] = useState(0)

  const retry = useCallback(() => {
    if (!configurationError) setStatus('connecting')
    setRetryKey((key) => key + 1)
  }, [configurationError])

  useEffect(() => {
    if (configurationError) return

    let active = true
    const startedAt = Date.now()
    const timers = new Set<number>()
    let currentController: AbortController | null = null

    const wait = (milliseconds: number) => new Promise<void>((resolve) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        resolve()
      }, milliseconds)
      timers.add(timer)
    })

    const connect = async () => {
      while (active && Date.now() - startedAt < MAX_WAIT_MS) {
        const attemptStartedAt = Date.now()
        const controller = new AbortController()
        currentController = controller
        try {
          await checkHealth(controller.signal)
          if (active) setStatus('online')
          return
        } catch (error) {
          if (!active) return
          if (!(error instanceof ApiError)) throw error
          setStatus(Date.now() - startedAt >= RETRY_INTERVAL_MS ? 'waking' : 'connecting')
        } finally {
          if (currentController === controller) currentController = null
        }
        const remaining = MAX_WAIT_MS - (Date.now() - startedAt)
        const untilNextAttempt = RETRY_INTERVAL_MS - (Date.now() - attemptStartedAt)
        if (remaining > 0 && untilNextAttempt > 0) await wait(Math.min(untilNextAttempt, remaining))
      }
      if (active) setStatus('offline')
    }

    void connect().catch((error: unknown) => {
      if (active) {
        console.error('Unexpected server health check failure:', error)
        setStatus('offline')
      }
    })

    return () => {
      active = false
      currentController?.abort()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [configurationError, retryKey])

  return { status, retry, configurationError }
}
