# Estrutura de Rotas – Célula Connect

Inventário de rotas (App Router) após a migração para o Starter Kit v2. Fonte: diretório `src/app`.

## 1. Páginas Públicas

| URL | Arquivo | Descrição | Status |
| --- | --- | --- | --- |
| `/` | `src/app/(public)/page.tsx` | Landing padrão do template (hero, recursos, pricing). | Ativo |
| `/sign-in` | `src/app/(public)/sign-in/[[...sign-in]]/page.tsx` | Fluxo de entrada via Clerk. | Ativo |
| `/sign-up` | `src/app/(public)/sign-up/[[...sign-up]]/page.tsx` | Criação de conta com Clerk. | Ativo |

## 2. Fluxos de Assinatura

| URL | Arquivo | Descrição | Status |
| --- | --- | --- | --- |
| `/subscribe` | `src/app/subscribe/page.tsx` | Seleção de plano inicial (obrigatório antes do uso). | Ativo |
| `/billing` | `src/app/(protected)/billing/page.tsx` | Gestão de plano/uso de créditos. | Ativo |

## 3. Área Protegida do Usuário

| URL | Arquivo | Descrição | Status |
| --- | --- | --- | --- |
| `/dashboard` | `src/app/(protected)/dashboard/page.tsx` | Visão geral (cartões de créditos e status). | Ativo |
| `/dashboard/discipulo` | `src/app/(protected)/dashboard/discipulo/page.tsx` | Painel pessoal com célula, liderança e agenda. | Novo |
| `/dashboard/lider` | `src/app/(protected)/dashboard/lider/page.tsx` | Gestão de célula para líderes (membros, metas, reuniões). | Novo |
| `/dashboard/supervisor` | `src/app/(protected)/dashboard/supervisor/page.tsx` | Visão consolidada de células supervisionadas. | Novo |
| `/dashboard/pastor` | `src/app/(protected)/dashboard/pastor/page.tsx` | Cockpit executivo com métricas de igrejas, células e liderança. | Novo |
| `/ai-chat` | `src/app/(protected)/ai-chat/page.tsx` | Chat multimodal com LLMs, upload e geração de imagens. | Ativo |

> Autorização: `src/app/(protected)/layout.tsx` checa sessão (`useAuth`) e assinatura (`useSubscription`). Sem plano ativo, usuário é redirecionado para `/subscribe`.

## 4. Administração (somente admin)

| URL | Arquivo | Descrição |
| --- | --- | --- |
| `/admin` | `src/app/admin/page.tsx` | Painel executivo com métricas (MRR, ARR, churn). |
| `/admin/users` | `src/app/admin/users/page.tsx` | Gestão de usuários (invites, sync com Clerk, créditos). |
| `/admin/credits` | `src/app/admin/credits/page.tsx` | Ajuste manual de saldos e visão agregada. |
| `/admin/storage` | `src/app/admin/storage/page.tsx` | Listagem de arquivos armazenados (Vercel Blob). |
| `/admin/usage` | `src/app/admin/usage/page.tsx` | Relatórios de consumo de créditos por operação. |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Hub de configurações. |
| `/admin/settings/features` | `src/app/admin/settings/features/page.tsx` | Custos por feature (override de créditos). |
| `/admin/settings/plans` | `src/app/admin/settings/plans/page.tsx` | Créditos por plano (integração com Clerk). |

Guardas: `src/app/admin/layout.tsx` usa `isAdmin` (`src/lib/admin-utils.ts`) e fallback E2E (`E2E_AUTH_BYPASS`).

## 5. API Routes

### 5.1 Público/Usuário

| Método | URL | Arquivo | Notas |
| --- | --- | --- | --- |
| GET | `/api/public/plans` | `src/app/api/public/plans/route.ts` | Lista planos ativos. |
| GET | `/api/credits/me` | `src/app/api/credits/me/route.ts` | Saldo de créditos do usuário. |
| GET | `/api/credits/settings` | `src/app/api/credits/settings/route.ts` | Custos e créditos por plano. |
| GET | `/api/subscription/status` | `src/app/api/subscription/status/route.ts` | Estado da assinatura (Clerk + fallback). |
| POST | `/api/ai/chat` | `src/app/api/ai/chat/route.ts` | Chat com IA e débito de créditos. |
| POST | `/api/ai/image` | `src/app/api/ai/image/route.ts` | Geração de imagens. |
| GET | `/api/ai/openrouter/models` | `src/app/api/ai/openrouter/models/route.ts` | Consulta modelos disponíveis. |
| GET | `/api/igrejas` | `src/app/api/igrejas/route.ts` | Lista igrejas com filtros por status, pesquisa e relacionamentos. |
| PUT | `/api/igrejas/[id]` | `src/app/api/igrejas/[id]/route.ts` | Atualiza dados básicos da igreja (somente pastor). |
| DELETE | `/api/igrejas/[id]` | `src/app/api/igrejas/[id]/route.ts` | Remove igreja (pastor). |
| GET | `/api/celulas` | `src/app/api/celulas/route.ts` | Lista células com filtros por igreja/lider/supervisor. |
| POST | `/api/celulas` | `src/app/api/celulas/route.ts` | Cria célula (protótipo) retornando dados com relacionamentos. |
| PUT | `/api/celulas/[id]` | `src/app/api/celulas/[id]/route.ts` | Atualiza célula (pastor ou supervisor da célula). |
| DELETE | `/api/celulas/[id]` | `src/app/api/celulas/[id]/route.ts` | Remove célula (pastor ou supervisor). |
| GET | `/api/usuarios` | `src/app/api/usuarios/route.ts` | Lista usuários do domínio com filtro por perfil/igreja. |
| PATCH | `/api/usuarios/[id]` | `src/app/api/usuarios/[id]/route.ts` | Ajusta perfil/ativo/igreja (somente pastor). |
| POST | `/api/upload` | `src/app/api/upload/route.ts` | Upload para Vercel Blob. |

### 5.2 Administração

| Método | URL | Arquivo |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | `src/app/api/admin/dashboard/route.ts` |
| GET | `/api/admin/users` | `src/app/api/admin/users/route.ts` |
| POST | `/api/admin/users/invite` | `src/app/api/admin/users/invite/route.ts` |
| POST | `/api/admin/users/invitations` | `src/app/api/admin/users/invitations/route.ts` |
| PATCH | `/api/admin/users/[id]` | `src/app/api/admin/users/[id]/route.ts` |
| POST | `/api/admin/users/sync` | `src/app/api/admin/users/sync/route.ts` |
| POST | `/api/admin/credits` | `src/app/api/admin/credits/route.ts` |
| PATCH | `/api/admin/credits/[id]` | `src/app/api/admin/credits/[id]/route.ts` |
| GET | `/api/admin/usage` | `src/app/api/admin/usage/route.ts` |
| GET | `/api/admin/storage` | `src/app/api/admin/storage/route.ts` |
| DELETE | `/api/admin/storage/[id]` | `src/app/api/admin/storage/[id]/route.ts` |
| GET | `/api/admin/settings` | `src/app/api/admin/settings/route.ts` |
| PUT | `/api/admin/settings` | `src/app/api/admin/settings/route.ts` |
| POST | `/api/admin/plans` | `src/app/api/admin/plans/route.ts` |
| PATCH | `/api/admin/plans/[clerkId]` | `src/app/api/admin/plans/[clerkId]/route.ts` |
| POST | `/api/admin/plans/refresh-pricing` | `src/app/api/admin/plans/refresh-pricing/route.ts` |
| GET | `/api/admin/clerk/plans` | `src/app/api/admin/clerk/plans/route.ts` |
| GET | `/api/admin/health/credits-enum` | `src/app/api/admin/health/credits-enum/route.ts` |
| POST | `/api/admin/verify` | `src/app/api/admin/verify/route.ts` |

### 5.3 Webhooks

| Método | URL | Arquivo | Uso |
| --- | --- | --- | --- |
| POST | `/api/webhooks/clerk` | `src/app/api/webhooks/clerk/route.ts` | Eventos de billing/assinatura do Clerk (atualiza créditos e `SubscriptionEvent`). |

## 6. Rotas Planejadas (Domain Igreja-12)

| URL (proposta) | Objetivo | Observações |
| --- | --- | --- |
| `/admin/igrejas` | CRUD de igrejas (onboarding). | Baseado em `Igreja`/`Plano`. |
| `/api/igrejas/*` | Endpoints REST adicionais (update/delete). | Evolução das rotas criadas neste sprint. |

## 7. Middleware e Config

- Middleware do Clerk definido em `src/middleware.ts` (protege grupos `(protected)` e `/admin`).
- Metadata (SEO, analytics) centralizada em `src/app/layout.tsx` usando `src/lib/brand-config.ts`.

## 8. Referências

- Fluxos por perfil: `PROJETO/FLUXOGRAMA_USUARIO.md`
- Lógica da aplicação: `PROJETO/LOGICA.md`
- Schema completo: `PROJETO/SCHEMA.md`
