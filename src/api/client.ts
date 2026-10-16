import type { Activity, Prediction } from '../types'

const REQUEST_TIMEOUT_MS = 90_000
const HEALTH_TIMEOUT_MS = 5_000

export type ApiErrorCode = 'configuration' | 'bad-request' | 'too-large' | 'unsupported-type' | 'timeout' | 'network' | 'server'

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

const CONFIGURATION_ERROR = new ApiError('configuration', 'The API URL is not configured. Add VITE_API_URL to your environment and restart the app.')

function apiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim()
  if (!configuredUrl) {
    throw CONFIGURATION_ERROR
  }
  return configuredUrl.replace(/\/+$/, '')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

async function requestJson(path: string, init: RequestInit, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController()
  const externalSignal = init.signal
  const forwardAbort = () => controller.abort()
  externalSignal?.addEventListener('abort', forwardAbort, { once: true })
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
    })
    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = null
    }

    if (!response.ok) {
      const detail = isRecord(body) && typeof body.detail === 'string' ? body.detail : 'The server could not complete the request.'
      const errorCode: ApiErrorCode = response.status === 400
        ? 'bad-request'
        : response.status === 413
          ? 'too-large'
          : response.status === 415
            ? 'unsupported-type'
            : 'server'
      throw new ApiError(errorCode, detail, response.status)
    }
    if (body === null) {
      throw new ApiError('server', 'The server returned an unreadable response.')
    }
    return body
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (externalSignal?.aborted) throw error
    if (controller.signal.aborted) {
      throw new ApiError('timeout', 'The request took too long. The server may still be waking up; please try again.')
    }
    throw new ApiError('network', 'Could not reach the server. Check your connection and try again.')
  } finally {
    window.clearTimeout(timeout)
    externalSignal?.removeEventListener('abort', forwardAbort)
  }
}

export async function checkHealth(signal?: AbortSignal): Promise<void> {
  const body = await requestJson('/api/v1/health', { method: 'GET', signal }, HEALTH_TIMEOUT_MS)
  if (!isRecord(body) || body.status !== 'ok' || !Array.isArray(body.classes)) {
    throw new ApiError('server', 'The server returned an unexpected health response.')
  }
}

function isActivity(value: unknown): value is Activity {
  return value === 'jump' || value === 'sit'
}

export async function predictVideo(file: File, signal: AbortSignal): Promise<Prediction> {
  const data = new FormData()
  data.append('file', file)
  const body = await requestJson('/api/v1/predict', { method: 'POST', body: data, signal }, REQUEST_TIMEOUT_MS)

  if (
    !isRecord(body)
    || !isActivity(body.prediction)
    || typeof body.confidence !== 'number'
    || !Number.isFinite(body.confidence)
    || body.confidence < 0
    || body.confidence > 1
    || !isRecord(body.probabilities)
  ) {
    throw new ApiError('server', 'The server returned an unexpected prediction response.')
  }
  const jump = body.probabilities.jump
  const sit = body.probabilities.sit
  if (
    typeof jump !== 'number'
    || !Number.isFinite(jump)
    || jump < 0
    || jump > 1
    || typeof sit !== 'number'
    || !Number.isFinite(sit)
    || sit < 0
    || sit > 1
  ) {
    throw new ApiError('server', 'The server returned incomplete prediction probabilities.')
  }
  return {
    prediction: body.prediction,
    confidence: body.confidence,
    probabilities: { jump, sit },
  }
}

export function getApiConfigurationError(): ApiError | null {
  try {
    apiBaseUrl()
    return null
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
}
