import type { NextRequest } from 'next/server'
import { getApiLogMinimumStatus, isApiLoggingEnabled, logDebug, logError, logWarn } from '@/lib/logger'

type RouteParams = Record<string, string | string[]>

interface LoggingOptions {
  route?: string
  method?: string
  feature?: string
}

const DEBUG_ENABLED = () => isApiLoggingEnabled() && process.env.API_LOG_LEVEL?.toLowerCase() === 'debug'

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

function normalizeParams(params?: RouteParams) {
  if (!params) return undefined
  const normalized: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(params)) {
    normalized[key] = value
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

export function withApiLogging<T extends (...args: any[]) => Promise<Response> | Response>(
  handler: T,
  options: LoggingOptions = {},
): T {
  if (!isApiLoggingEnabled()) {
    return handler
  }

  const wrapped = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const request = args[0] as Request | undefined
    const contextMaybe = args.length > 1 ? (args[1] as { params?: RouteParams | Promise<RouteParams> }) : undefined
    const resolvedParams = contextMaybe?.params !== undefined ? await Promise.resolve(contextMaybe.params) : undefined
    const handlerArgs = [...args] as unknown[]
    if (contextMaybe && handlerArgs.length > 1) {
      handlerArgs[1] = { ...contextMaybe, params: resolvedParams ?? {} }
    }

    const route = options.route || resolvePath(request)
    const method = options.method || request?.method || 'UNKNOWN'
    const requestId =
      typeof globalThis.crypto?.randomUUID === 'function'
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`
    const startedAt = Date.now()

    try {
      const response = await (handler as (...handlerArgs: unknown[]) => Promise<Response> | Response)(...handlerArgs)
      if (!response) {
        return response as ReturnType<T>
      }

      const status = response.status
      const durationMs = Date.now() - startedAt
      if (shouldLogStatus(status)) {
        const level = status >= 500 ? logError : logWarn
        level('API response emitted non-success status', {
          status,
          method,
          route,
          durationMs,
          requestId,
          feature: options.feature,
          params: normalizeParams(resolvedParams),
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

      return response as ReturnType<T>
    } catch (error) {
      const durationMs = Date.now() - startedAt
      logError('API handler threw an error', {
        method,
        route,
        durationMs,
        requestId,
        feature: options.feature,
        params: normalizeParams(resolvedParams),
        error: serializeError(error),
      })
      throw error
    }
  }

  return wrapped as unknown as T
}
