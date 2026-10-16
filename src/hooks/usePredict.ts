import { useCallback, useEffect, useRef, useState } from 'react'
import { predictVideo } from '../api/client'
import type { Prediction } from '../types'

export type PredictionError = {
  kind: 'bad-request' | 'too-large' | 'unsupported-type' | 'timeout' | 'network' | 'server'
  message: string
}

type PredictState = {
  isLoading: boolean
  elapsedSeconds: number
  result: Prediction | null
  error: PredictionError | null
}

const initialState: PredictState = {
  isLoading: false,
  elapsedSeconds: 0,
  result: null,
  error: null,
}

export function usePredict() {
  const [state, setState] = useState<PredictState>(initialState)
  const controllerRef = useRef<AbortController | null>(null)

  const analyze = useCallback(async (file: File) => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const startedAt = Date.now()
    setState({ isLoading: true, elapsedSeconds: 0, result: null, error: null })
    const interval = window.setInterval(() => {
      setState((current) => current.isLoading
        ? { ...current, elapsedSeconds: Math.floor((Date.now() - startedAt) / 1_000) }
        : current)
    }, 250)

    try {
      const result = await predictVideo(file, controller.signal)
      if (controllerRef.current === controller) {
        setState({ isLoading: false, elapsedSeconds: 0, result, error: null })
      }
    } catch (error) {
      if (controller.signal.aborted) {
        if (controllerRef.current === controller) setState(initialState)
        return
      }
      if (controllerRef.current !== controller) return
      const kind = error instanceof Error && 'code' in error
        ? error.code
        : 'network'
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      const allowedKinds = ['bad-request', 'too-large', 'unsupported-type', 'timeout', 'network', 'server'] as const
      const safeKind = allowedKinds.find((candidate) => candidate === kind) ?? 'server'
      setState({
        isLoading: false,
        elapsedSeconds: 0,
        result: null,
        error: { kind: safeKind, message },
      })
    } finally {
      window.clearInterval(interval)
      if (controllerRef.current === controller) controllerRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState(initialState)
  }, [])

  const clear = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    setState(initialState)
  }, [])

  useEffect(() => () => controllerRef.current?.abort(), [])

  return { ...state, analyze, cancel, clear }
}
