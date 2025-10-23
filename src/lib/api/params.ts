import type { NextRequest } from "next/server"

/**
 * Next 15 defers param decoding and provides `context.params` as a Promise.
 * Wrappers like `adaptRouteWithParams` and `withApiLogging` should always
 * resolve it before handing the value to downstream handlers.
 */
export type RouteParamsContext<T extends Record<string, unknown>> = { params: Promise<T> }

export type ResolvedRouteParamsContext<T extends Record<string, unknown>> = { params: T }

export async function resolveRouteParams<T extends Record<string, unknown>>(
  context: RouteParamsContext<T>,
): Promise<T> {
  return await context.params
}

export function adaptRouteWithParams<
  T extends Record<string, unknown>,
  TRequest extends Request = NextRequest,
>(
  handler: (context: { request: TRequest; params: T }) => Response | Promise<Response>,
) {
  return async (
    request: Request,
    context: RouteParamsContext<T>,
  ): Promise<Response> => {
    const params = await resolveRouteParams(context)
    return await handler({ request: request as TRequest, params })
  }
}
