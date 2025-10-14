import type { NextRequest } from "next/server";

export type RouteParamsContext<T extends Record<string, unknown>> =
  | { params: Promise<T> }
  | { params: T }

export async function resolveRouteParams<T extends Record<string, unknown>>(
  context: RouteParamsContext<T>,
): Promise<T> {
  return context.params instanceof Promise ? await context.params : context.params
}

export function adaptRouteWithParams<T extends Record<string, unknown>>(
  handler: (context: { request: NextRequest; params: T }) => Response | Promise<Response>,
) {
  return async (
    request: NextRequest,
    context: RouteParamsContext<T>,
  ): Promise<Response> => {
    const params = await resolveRouteParams(context)
    return await handler({ request, params })
  }
}
