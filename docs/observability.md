# Observability & Logging

This guide describes how to monitor API behaviour and capture structured logs while Phase 4 evolves. It focuses on the existing logging pipeline so you can enable/disable diagnostics without code changes and plan the next telemetry additions.

## API Logging Controls

The helper `withApiLogging` wraps every API route. It respects the environment variables below:

| Variable | Default | Description |
| --- | --- | --- |
| `API_LOGGING` / `NEXT_PUBLIC_API_LOGGING` | `false` | Enables structured logging when set to `true`. |
| `API_LOG_LEVEL` | `warn` | Minimum log level (`debug`, `info`, `warn`, `error`). |
| `API_LOG_MIN_STATUS` | `400` | Responses with status ≥ value emit warning/error logs automatically. |
| `API_LOG_SUCCESS` | `false` | When `true`, all successful responses (< `API_LOG_MIN_STATUS`) are logged at `info`. |
| `API_LOG_SUCCESS_SAMPLE_RATE` | `0` | Fraction (0 to 1) of successful responses to log. Useful when you only need sampling; combine with `API_LOG_SUCCESS=false`. |

### Request Correlation

Every request logged via `withApiLogging` includes a `requestId`. The middleware uses, in order:

1. `x-request-id` header (if provided by the proxy/load balancer)
2. `x-amzn-trace-id`, `cf-ray`, or `fly-request-id`
3. A generated UUID

The same identifier is returned in the response header `x-request-id`, allowing you to tie server logs to client telemetry or external traces.

### Suggested Production Setup

1. Enable logging on the deployment:
   ```env
   API_LOGGING=true
   API_LOG_LEVEL=info
   API_LOG_MIN_STATUS=400
   ```
2. Sample successes at 5% for baseline metrics without flooding logs:
   ```env
   API_LOG_SUCCESS_SAMPLE_RATE=0.05
   ```
   (Set `API_LOG_SUCCESS=true` only when you need full request auditing temporarily.)
3. Ensure your reverse proxy injects `x-request-id` so the correlation id propagates through the stack.

## Roadmap: Metrics & Tracing

Phase 4 Sprint 3 calls for structured logs and metrics. With the new logging toggles in place, we can incrementally add:

- **Request duration histogram** – export timings via Prometheus/OpenTelemetry (Next.js middleware) using the existing `durationMs` captured by `withApiLogging`.
- **Per-feature counters** – leverage the `feature` flag already passed to `withApiLogging` to emit structured events into your metrics backend.
- **Trace propagation** – forward `x-request-id` (or W3C `traceparent`) into downstream services (Prisma, external APIs) to build end-to-end traces.

When ready, instrument the shared logger to emit to your telemetry provider (e.g., Datadog, Honeycomb) inside the existing log functions (`logInfo`, `logWarn`, etc.) so that application code remains unchanged.
