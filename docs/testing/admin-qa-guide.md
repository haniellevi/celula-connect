# Admin QA Guide

This document describes how to validate the admin surface end to end. It combines environment prerequisites, dataset expectations, automated coverage and manual checkpoints so the team can run consistent regression passes before every release.

## 1. Scope Overview
Admin features covered by this guide:
- **Dashboard** (`/admin`): high-level KPIs and charts for ARR/MRR/Churn.
- **Users** (`/admin/users`): listing, search, invitations, activation/deactivation, balance adjustments and Clerk sync dialog.
- **Credits** (`/admin/credits`): aggregated metrics and balance adjustments via modal.
- **Usage** (`/admin/usage`): filters, pagination, CSV export and JSON detail dialog for operations.
- **Storage** (`/admin/storage`): filtering, per-user view, external link open and delete workflow for blobs.
- **Settings** (`/admin/settings/*`): feature credit pricing and subscription plan mapping.

Out of scope for this document: Clerk/Stripe webhook flows (covered by backend integration tests), authentication itself (smoke test separately) and load/performance testing.

## 2. Environment & Dependencies
- Start the app with `npm run dev` ou, para Playwright, `npm run dev:e2e` (habilita `E2E_AUTH_BYPASS=1` e fixa o servidor em `127.0.0.1:3100`).
- Variáveis mínimas `.env`: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` e `ADMIN_EMAILS` ou `ADMIN_USER_IDS`. Para o bypass de E2E, defina `E2E_AUTH_BYPASS=1`, `ADMIN_USER_IDS=e2e-admin` e, opcionalmente:
  - `E2E_BYPASS_DOMAIN_USER_ID=seed-user-pastor` (ou outro usuário seed) para carregar automaticamente um perfil eclesiástico durante os testes.
  - `E2E_BYPASS_CLERK_USER_ID=usr_seed_pastor` e `E2E_BYPASS_CLERK_EMAIL=pastor.seed@celula-connect.dev` para simular o retorno do Clerk em rotas admin.
  - `E2E_BYPASS_PLAN_KEY=seed-plano-basico` para que `/api/subscription/status` retorne assinatura ativa e evite redirecionamentos para `/subscribe`.
- Database: SQLite is fine locally; prefer Postgres when running shared QA. Ensure `prisma migrate deploy` (or `db:migrate`) succeeded before tests.
- Seed data: provide sample users with mixed credit balances, pending invitations, uploaded files and usage records. Automated specs stub most APIs but manual sweeps benefit from realistic seed data.

## 3. Automated Coverage (Playwright)
| Area | Scenario | Entry Point | Notes |
| --- | --- | --- | --- |
| Dashboard | Metric cards + charts render and respect mocked data | `tests/e2e/admin-dashboard.spec.ts` | API responses stubbed (`/api/admin/dashboard`). |
| Users | Search, credit prompt, invite flow, tabs | `tests/e2e/admin-users.spec.ts` | Handles `window.prompt` for credit update and invitation toasts. |
| Credits | Aggregated cards, search, adjust via modal | `tests/e2e/admin-credits.spec.ts` | Verifies toast feedback and table update. |
| Usage | Filters (type/search), JSON dialog | `tests/e2e/admin-usage.spec.ts` | CSV export kept manual; mocks keep fixtures small. |
| Storage | Filter term + deletion confirmation | `tests/e2e/admin-storage.spec.ts` | Uses `confirm` dialog and ensures toast appears. |
| Settings | Feature cost edit + save feedback | `tests/e2e/admin-settings.spec.ts` | Stubs GET/PUT to `/api/admin/settings`. |

All specs run via `npm run test:e2e`. Configuration sits in `playwright.config.ts` with `trace` on first retry and Chromium as the default project.

## 4. Manual QA Checklist
Execute estas etapas quando validando nova funcionalidade admin ou antes de releases:
1. **Metrics sanity** – confirmar que cartões do dashboard batem com os seeds (`seed-trilha-*`, `seed-convite-*`, `seed-config-*`) e que os gráficos renderizam fallback quando a série está vazia.
2. **Sincronização manual Clerk** – no painel `/admin/users`, abrir “Sincronizar do Clerk”, marcar “Sincronizar planos/assinaturas” e executar; capturar screenshot/log do toast com o resumo da operação e anexar ao checklist do sprint. Manter o webhook desligado até a fase de produção.
   - 2025-10-18: tentativa via endpoint `/api/admin/users/sync` (E2E bypass) retornou `401 clerk_key_invalid` ao usar chave fictícia.
   - 2025-10-20 10:05: repetido carregando `.env` + `.env.local`; o POST processou 1 usuário (`processed=1`, `createdUsers=0`, `activeSubscriptions=0`) confirmando o fluxo. Registrar toast gerado no modal “Sincronizar do Clerk”.
3. **Invite lifecycle** – verify resend/revoke on actual Clerk invitations (requires email delivery setup).
4. **Exports** – download the Usage CSV and inspect content for correct delimiter/quoting.
5. **Storage deletion** – confirm blobs disappear from the storage provider (Verel Blob/S3) and are soft-deleted in DB.
6. **Feature flags** – alternar `ENABLE_DOMAIN_MUTATIONS` em `/admin/settings/feature-flags`, validar aviso nos dashboards e confirmar que mutações de igreja/célula/usuário retornam `423 Locked` enquanto desabilitadas.
7. **Landing dinâmica** – em `/dashboard/pastor/landing-config`, validar que hero/features/testimonials carregam os valores seed e que o preview reflete alterações salvas (abrir público em aba separada).
8. **Trilha/aprovação** – exercitar `POST /api/trilhas/[id]/solicitacoes` e `PATCH /api/trilhas/solicitacoes/[id]` via UI (`/trilha`, `/trilha/aprovacao`), garantindo que os seeds exibem pendentes/aprovadas/rejeitadas e que o histórico por trilha reflete a linha do tempo.
   - 2025-10-18 19h45: `/trilha` exibiu 2 trilhas ativas, 2 participantes e duração média de 35 dias conforme seeds `seed-trilha-fundamentos` e `seed-trilha-lideranca`. No fluxo `/trilha/aprovacao`, o supervisor seed revisou `seed-solicitacao-discipulo` (PENDENTE), `seed-solicitacao-lider` (APROVADA) e `seed-solicitacao-rejeitada` (REJEITADA); ao aplicar `PATCH /api/trilhas/solicitacoes/[id]` pela UI, o toast “Solicitação atualizada” confirmou o sucesso e, após a aprovação, `scope=pendentes` retornou fila vazia. Guardar print das tabelas, do novo histórico e dos avisos emitidos no feed dos envolvidos.
9. **Settings persistence** – tweak feature costs e plan mappings, verificar dados no banco e via API responses.
10. **Access control** – ensure non-admin accounts hit redirects from `/admin` routes when `E2E_AUTH_BYPASS` is disabled.

## 5. Running the Playwright Suite
```bash
npm run test:e2e                # full chromium pass
npm run test:e2e -- --debug     # headed mode for debugging
npx playwright show-trace trace.zip
```
Outputs (screenshots/traces) appear in `playwright-report/` when failures occur. The suite automatically spins up the dev server with the bypassed auth guard.

## 6. Extending Automation
- Prefer REST mocks (via `page.route`) to keep tests deterministic; only hit live APIs when the response surface is stable.
- Wrap toast assertions with `page.getByRole('status')` filters to avoid duplicate matches.
- Store new admin-specific fixtures under `tests/e2e/fixtures` (create if needed) to keep specs lean.
- When adding new pages, follow the existing pattern: stub API(s), assert headings/cards, exercise primary CTA(s) and confirm toasts/state updates.

## 7. Sincronização Manual de Créditos

### Processo de Validação
- **Localização**: `/admin/users` → "Sincronizar do Clerk"
- **Validação**: Verificar toast de confirmação e logs
- **Fallback**: Operações continuam mesmo com Clerk offline
- **Registro**: Documentar todas as operações manuais

### Checklist de Sincronização
- [ ] Acessar `/admin/users`
- [ ] Clicar em "Sincronizar do Clerk"
- [ ] Configurar parâmetros de sincronização
- [ ] Executar operação
- [ ] Verificar toast de confirmação
- [ ] Confirmar logs no console
- [ ] Validar saldos atualizados na tabela
- [ ] Registrar evidências no checklist

### Evidências de Execução
- **Data**: 21/10/2025
- **Operação**: Sincronização em lote
- **Resultado**: ✅ Sucesso
- **Usuários processados**: 1
- **Logs**: `[admin/users/sync] processed=1, createdUsers=0, activeSubscriptions=0`

### Referências
- [Playbook de Sincronização Manual](../credits/manual-sync-playbook.md)
- [Processo de Fallback](../credits/webhook-fallback-process.md)

## 8. Next Steps
1. Introduce repeatable Prisma seeds focused on admin data to support both manual regression and automated mocks.
2. Wire `npm run test:e2e` into CI, publishing Playwright HTML reports and traces on failure.
3. **Sincronização manual de créditos** — no painel `/admin/users`, usar a ação "Sincronizar do Clerk" apenas para importar dados quando necessário; registrar toast/log no checklist e manter webhooks/billing desligados até a etapa de produção.


