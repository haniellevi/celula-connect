import type { NextRequest } from 'next/server'
import {
  getApiLogMinimumStatus,
  getSuccessLogSampleRate,
  isApiLoggingEnabled,
  isSuccessLogAlwaysEnabled,
  isSuccessLoggingEnabled,
  logDebug,
  logError,
  logInfo,
  logWarn,
} from '@/lib/logger'

interface LoggingOptions {
  route?: string
  method?: string
  feature?: string
}

const DEBUG_ENABLED = () => isApiLoggingEnabled() && process.env.API_LOG_LEVEL?.toLowerCase() === 'debug'

type HandlerResult = Response | Promise<Response>
type ContextWithParams = { params?: unknown }

const hasParams = (value: unknown): value is ContextWithParams =>
  typeof value === 'object' && value !== null && 'params' in value

function resolvePath(request: NextRequest | Request | undefined, fallback?: string) {
  if (!request) return fallback || 'unknown'
  const maybeNext = request as NextRequest
  if (typeof maybeNext.nextUrl?.pathname === 'string') {
    return maybeNext.nextUrl.pathname
  }
  try {
    return new URL(request.url).pathname
  } catch {
    return fallback || 'unknown'
  }
}

function resolveSearchParams(request: NextRequest | Request | undefined) {
  if (!request) return undefined
  const maybeNext = request as NextRequest
  try {
    const url = maybeNext.nextUrl ?? new URL(request.url)
    return Object.fromEntries(url.searchParams.entries())
  } catch {
    return undefined
  }
}

function shouldLogStatus(status: number) {
  return isApiLoggingEnabled() && status >= getApiLogMinimumStatus()
}

function normalizeParams(params: unknown) {
  if (!params) return undefined
  if (typeof params !== 'object') return undefined
  const normalized: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (typeof value === 'string') {
      normalized[key] = value
      continue
    }
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      normalized[key] = value
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

export function withApiLogging<TArgs extends any[], TResult extends HandlerResult>(
  handler: (request: Request, ...rest: TArgs) => TResult,
  options: LoggingOptions = {},
): (...args: [Request, ...TArgs]) => Promise<Awaited<TResult>> {
  if (!isApiLoggingEnabled()) {
    return (async (...args: [Request, ...TArgs]) => await handler(...args)) as (
      ...args: [Request, ...TArgs]
    ) => Promise<Awaited<TResult>>
  }

  const wrapped = async (...args: [Request, ...TArgs]): Promise<Awaited<TResult>> => {
    const [requestMaybe, ...rest] = args
    const request = requestMaybe as Request | undefined
    const contextCandidate = rest.length > 0 ? rest[0] : undefined

    let paramsForLogging: unknown = undefined
    let restForHandler = rest

    if (hasParams(contextCandidate)) {
      const resolvedParams =
        contextCandidate.params !== undefined ? await Promise.resolve(contextCandidate.params) : undefined
      paramsForLogging = resolvedParams
      const normalizedContext = {
        ...contextCandidate,
        params: resolvedParams ?? {},
      }
      restForHandler = [normalizedContext, ...rest.slice(1)]
    }

    const handlerArgs = [requestMaybe, ...restForHandler] as unknown as [Request, ...TArgs]

    const route = options.route || resolvePath(request)
    const method = options.method || request?.method || 'UNKNOWN'
    const incomingRequestId =
      request?.headers?.get('x-request-id') ??
      request?.headers?.get('x-amzn-trace-id') ??
      request?.headers?.get('cf-ray') ??
      request?.headers?.get('fly-request-id')
    const generatedRequestId =
      typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`
    const requestId = incomingRequestId || generatedRequestId
    const startedAt = Date.now()

    try {
      const response = await handler(...handlerArgs)
      if (!response) {
        return response as Awaited<TResult>
      }

      const status = response.status
      const durationMs = Date.now() - startedAt
      const shouldLogSuccess =
        status < getApiLogMinimumStatus() &&
        isSuccessLoggingEnabled() &&
        (isSuccessLogAlwaysEnabled() || Math.random() < getSuccessLogSampleRate())

      if (shouldLogStatus(status)) {
        const level = status >= 500 ? logError : logWarn
        level('API response emitted non-success status', {
          status,
          method,
          route,
          durationMs,
          requestId,
          feature: options.feature,
          params: normalizeParams(paramsForLogging),
          query: resolveSearchParams(request),
        })
      } else if (shouldLogSuccess) {
        logInfo('API response', {
          status,
          method,
          route,
          durationMs,
          requestId,
          feature: options.feature,
          params: normalizeParams(paramsForLogging),
          query: resolveSearchParams(request),
        })
      } else if (DEBUG_ENABLED()) {
        logDebug('API response', {
          status,
          method,
          route,
          durationMs,
          requestId,
          feature: options.feature,
        })
      }

      try {
        if (response.headers && !response.headers.has('x-request-id')) {
          response.headers.set('x-request-id', requestId)
        }
      } catch {
        // ignore header mutation failures (immutable response bodies)
      }

      return response as Awaited<TResult>
    } catch (error) {
      const durationMs = Date.now() - startedAt
      logError('API handler threw an error', {
        method,
        route,
        durationMs,
        requestId,
        feature: options.feature,
        params: normalizeParams(paramsForLogging),
        error: serializeError(error),
      })
      throw error
    }
  }

  return wrapped
}
