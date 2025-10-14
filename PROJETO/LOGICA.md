# Lógica do Sistema – Célula Connect

Documento técnico que descreve a arquitetura funcional vigente após a adoção do Starter Kit v2 e o plano de encaixe das regras de negócio oriundas do Igreja-12.

## 1. Camadas da Plataforma

| Camada | Responsabilidade | Implementação |
| --- | --- | --- |
| Interface pública | Landing, sign-in/sign-up e conteúdo institucional | `src/app/(public)/*` |
| Área autenticada | Dashboard, IA, billing, futuros módulos de célula | `src/app/(protected)/*` com guardas em `src/app/(protected)/layout.tsx` |
| Administração | Operações internas (usuários, créditos, storage, métricas) | `src/app/admin/*` |
| APIs | Pontos de entrada HTTP (Next.js App Router) | `src/app/api/**/*` |
| Domínio & ORM | Prisma Client, queries e seeds | `prisma/schema.prisma`, `src/lib/queries/*`, `prisma/seed.ts` |
| Utilidades | Auth helpers, créditos, logging, storage | `src/lib/**/*` |

## 2. Módulos Ativos do Starter Kit

### 2.1 Autenticação e Autorização

- Clerk provê sessão e perfil básico (`src/app/(public)/sign-in/[[...sign-in]]/page.tsx`).
- Middleware (Clerk + Next) e layout protegido redirecionam usuários não autenticados e quem não possui plano (`src/app/(protected)/layout.tsx`).
- Função `useSubscription` consulta `/api/subscription/status` e habilita gating de recursos.

### 2.2 Planos, Créditos e Billing

- `Plan` (template) representa planos sincronizados com o Clerk (`src/lib/queries/plans.ts`).
- `CreditBalance` e `UsageHistory` controlam saldo por usuário e débitos (uso de IA).
- Rota `GET /api/credits/me` expõe saldo para a UI; admin pode ajustar manualmente em `src/app/admin/credits/page.tsx`.
- Custos por feature configuráveis (`src/lib/credits/feature-config.ts`) com overrides persistidos em `AdminSettings`.

### 2.3 IA (Chat e Imagem)

- Chat em tempo real com provedores OpenRouter/OpenAI compatíveis (`src/app/(protected)/ai-chat/page.tsx`).
- Upload de anexos via `POST /api/upload` → gravação em `StorageObject`.
- Geração de imagem orquestrada por `src/hooks/use-ai-image.ts` e `POST /api/ai/image`.
- Dedução de créditos centralizada em `src/lib/credits/deduct.ts` com reembolso automático em falhas.

### 2.4 Administração

- Dashboard executivo com métricas (`src/app/admin/page.tsx`) consumindo `GET /api/admin/dashboard`.
- Gestão de usuários (CRUD + convites + sincronização com Clerk), créditos, storage e uso (`src/app/admin/{users,credits,storage,usage}/page.tsx`).
- Configuração de custos/planos de créditos (`src/app/admin/settings/*`).
- Guardas de acesso: `isAdmin` em `src/lib/admin-utils.ts` valida Clerk user.

### 2.5 Observabilidade e Infra

- Logger estruturado (`src/lib/logging/*`) presente nas rotas críticas.
- Camada `src/lib/api-client.ts` garante fetch consistente com cache e tratamento de erros.
- Seeds (`prisma/seed.ts`) garantem dados iniciais para testes end-to-end das entidades de célula.

## 3. Domínio Igreja-12 (Migração)

### 3.1 Modelagem de Dados

- Entidades adicionadas: `Plano`, `Igreja`, `Usuario`, `Celula`, `MembroCelula`, `ReuniaoCelula`, enums `PerfilUsuario`, `StatusAssinatura`, `CargoCelula`.
- Relacionamentos:
  - `Igreja` ↔ `Plano` (muitos-para-um) e ↔ `Usuario`/`Celula` (um-para-muitos).
  - `Celula` mantém referências a líder (`Usuario`), supervisor (`Usuario`) e igreja.
  - `MembroCelula` funciona como join table com cargo e histórico de entrada/saída.
  - `ReuniaoCelula` persiste agenda, presentes e visitantes por célula.
- Seeds criam igreja central, trio de usuários (supervisor, líder, discípulo), célula e reunião (`prisma/seed.ts`).

### 3.2 Fluxos de Alto Nível

1. **Onboarding da Igreja** (planejado):
   - Pastor solicita igreja → admin aprova → plano trial aplicado → usuários convidados.
2. **Gestão de Células** (em planejamento):
   - Líder atualiza reunião, membros e metas → supervisor acompanha → pastor visualiza KPIs.
3. **Trilha de Crescimento** (backlog):
   - Discípulo solicita avanço → supervisor aprova → métricas alimentam dashboards.
4. **Leitura Bíblica e Devocionais** (backlog):
   - Usuário recebe plano diário → progresso sincronizado → avisos automáticos.

### 3.3 Integrações Necessárias

- Rotas REST/Server Actions para CRUD de `Igreja`, `Celula`, `MembroCelula`, `ReuniaoCelula`.
- Mapeamento de perfis (`PerfilUsuario`) para rotas/dashboards específicos.
- Sincronização de limites por plano (`Plano.maxCelulas`, `maxLideres`) com guardas na camada de domínio.
- Sistema de notificações (email/WhatsApp) com webhooks externos — ainda não iniciado.

## 4. Fluxos de Dados Atuais

1. **Public → Cadastro → Assinatura**:
   - Usuário acessa landing (`src/app/(public)/page.tsx`) → cria conta (Clerk) → seleciona plano em `/subscribe` → acesso liberado às rotas protegidas.
2. **Consumo de IA**:
   - Usuário abre `/ai-chat` → hook `useCredits` valida saldo via `/api/credits/me` → mensagem enviada por `useChat` → API debita créditos antes de chamar provedor → resposta transmitida via SSE → saldo atualizado (`credits.refresh()`).
3. **Administração**:
   - Admin autenticado acessa `/admin` → consultas via hooks `useDashboard`, `useAdminUsers`, etc., que chamam rotas `app/api/admin/**`.
4. **Seeds e Dev**:
   - `npm run db:seed` popula domínio de células → permite testar queries e futuras UIs.

## 5. Guia de Integração para Próximas Entregas

| Etapa | Objetivo | Artefatos |
| --- | --- | --- |
| 1. Serviços de domínio | Criar camada de queries/serviços para `Igreja`, `Celula`, `MembroCelula`, `ReuniaoCelula`. | `src/lib/queries/*` |
| 2. APIs e autorização | Expor rotas protegidas por perfil (pastor, supervisor, líder). | `src/app/api/igrejas/*` (novo) |
| 3. Dashboards verticais | Implementar páginas em `src/app/(protected)/dashboard/*` diferenciadas por perfil. | Layout e componentes reutilizáveis |
| 4. Trilha e devocionais | Modelar novas tabelas (etapas, conteúdos) e workflows. | Migrações Prisma + jobs |
| 5. Conteúdo landing | Sincronizar copy e blocos configuráveis com o admin. | Reaproveitar storage + seções |

## 6. Referências Cruzadas

- Visão macro: `PROJETO/PRD.md`
- Evolução do banco: `PROJETO/DER.md` e `PROJETO/SCHEMA.md`
- Rotas detalhadas: `PROJETO/ROTAS_ORGANIZADAS.md`
- Fluxos por usuário: `PROJETO/FLUXOGRAMA_USUARIO.md`
