# Credits: Server Source of Truth

This project treats the user’s credit balance as the source of truth on the server.

## Modo Hibernação (CREDITS_ENABLED)
- Flag global lida por `src/lib/credits/feature-flag.ts` (`areCreditsEnabled()`).
- Default: ligado (`CREDITS_ENABLED` ausente ou `1`). Defina `CREDITS_ENABLED=0` para suspender o módulo.
- Quando desativado:
  - Funções de saldo (`validateCredits*`, `deductCredits*`, `refreshUserCredits`, `trackUsage`) retornam valores “ilimitados” sem tocar no banco/Clerk.
  - Webhooks, rotas admin e scripts que manipulam créditos fazem early-return com logs informativos.
  - APIs retornam payloads estáticos (`/api/credits/me` sinaliza `unlimited`, `/api/credits/settings` inclui `creditsEnabled: false`).
  - O hook `useCredits()` devolve `credits.unlimited = true`, `canPerformOperation()` sempre `true` e evita polling.
  - UI exibe a mensagem de créditos ilimitados e libera botões normalmente.
- Reversão: basta definir `CREDITS_ENABLED=1` e (se necessário) rodar `refreshUserCredits` para realinhar saldos.

## Reading Balance
- Endpoint: `GET /api/credits/me` retorna `{ creditsRemaining, creditsEnabled }`. Quando a flag está desligada devolve `{ creditsRemaining: null, unlimited: true, creditsEnabled: false }`.
- The `useCredits()` hook uses React Query to fetch and keep it fresh:
  - Refetches when the window regains focus
  - Background refresh every 30s
  - Exposes `refresh()` to force refetch after mutations
  - Quando `creditsEnabled = false`, o hook retorna `credits.unlimited = true`, evita requisições e `canPerformOperation()` libera tudo.

## Spending Credits
- API handlers call:
  - `validateCreditsForFeature(clerkUserId, feature)`
  - `deductCreditsForFeature({ clerkUserId, feature, details })`
- Cost config: `src/lib/credits/feature-config.ts` (`FEATURE_CREDIT_COSTS`)
- Mapping `Feature → OperationType` for usage history: `toPrismaOperationType()`
- Com a flag desligada, os helpers retornam valores infinitos e nunca lançam `InsufficientCreditsError`.

## Admin Overrides (Feature Costs and Plan Credits)
- Feature costs live in `AdminSettings.featureCosts`.
- Plans live in the `Plan` table with shape `{ clerkId, name, credits, active }`.
- Admin UI at `/admin/settings` lets you:
  - Set per-feature credit costs (e.g., `ai_text_chat`, `ai_image_generation`).
  - Manage Clerk Plan IDs (`cplan_*`) → Name + Monthly Credits (persisted as rows in `Plan`).
- Effective values:
  - Server utilities: `getFeatureCost`, `getPlanCredits` in `src/lib/credits/settings.ts`.
  - Public read-only endpoint: `GET /api/credits/settings` returns `{ featureCosts, planCredits, creditsEnabled }`. Com créditos desativados devolve arrays vazios/`null` e `creditsEnabled: false`.
  - Admin endpoints: `GET/POST /api/admin/plans`, `PUT/DELETE /api/admin/plans/[clerkId]` for plan CRUD.

Notes
- `getPlanCredits(planId)` accepts a Clerk plan ID (`cplan_*`). Webhooks and subscription handlers pass Clerk plan IDs when available.

UI consumption
- `useCredits()` now fetches `GET /api/credits/settings` and exposes `getCost(operation)` and `canPerformOperation(operation)` using the dynamic values.
- AI Chat displays the current dynamic cost for text/image, and disables actions if balance < cost.

## Manual Admin Sync
- `/api/admin/credits/[id]` e `/api/admin/users/[id]/credits` sincronizam o saldo com o Clerk via `syncClerkCreditsMetadata`, atualizando `creditsRemaining`, `creditsTotal` e `lastCreditsSyncAt` no `publicMetadata`.
- As respostas retornam `metadataSynced` para sinalizar quando a chamada ao Clerk falha (o saldo ainda é persistido no banco).
- `refreshUserCredits` agora atualiza o Clerk por padrão; passe `{ skipClerkUpdate: true }` em webhooks do Clerk para evitar loops recursivos.
- Helper compartilhado: `src/lib/clerk/credit-metadata.ts` concentra a atualização de `publicMetadata` e é usado pelas rotas admin e pelo `refreshUserCredits`.

## Refund Policy (AI Chat and Image)
- If a provider error occurs after credits are deducted, the system reimburses the user automatically:
  - Text (`POST /api/ai/chat`): refunds on provider errors before the response is returned.
  - Image (`POST /api/ai/image`): refunds on non-OK status, invalid responses, parse errors, or empty result.
- Refunds are tracked in `UsageHistory` as negative `creditsUsed` with `{ refund: true, reason }` in `details` for auditing.

## UI (AI Chat)
- Text: after sending, the UI calls `refresh()` (backend deducts before the stream starts)
- Image: after a successful `200 OK`, call `refresh()` immediately
- Entry point: `src/app/(protected)/ai-chat/page.tsx`
- Quando `creditsEnabled = false`, o cabeçalho mostra “Créditos ilimitados” e a tela ignora bloqueios de saldo (custos passam a `0`).

## Health Check
- `GET /api/admin/health/credits-enum` (admin only)
  - Confirms `toPrismaOperationType('ai_text_chat') === OperationType.AI_TEXT_CHAT` (and image likewise)

## Prisma Client & Enums
- Client is generated at `prisma/generated/client`
- Code imports `PrismaClient` from that path (not `@prisma/client`) to avoid enum mismatches at runtime
- Shortcut: `src/lib/prisma-types.ts` re-exports `OperationType`

## Admin & Webhooks
- Admin manual adjustments create `UsageHistory`
- Clerk webhooks (subscriptions/payments) update balances
- If webhooks fail, use `POST /api/admin/users/sync` to reconcile. The sync now supports scoped modes (users only, plans only) and optional credit overrides.
- Com a flag desligada, webhooks/admin sincronizações apenas logam (`logCreditsDisabled`) e devolvem `200` sem tocar em saldos.
