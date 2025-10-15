# 📊 ACOMPANHAMENTO DE MIGRAÇÃO - CÉLULA CONNECT

**Última Atualização**: 11 de outubro de 2025, 21:45  
**Responsável**: Equipe de Desenvolvimento  
**Referência**: [PLANO_MIGRACAO.md](./PLANO_MIGRACAO.md)

### 🔗 Alinhamento com a Base de Conhecimento (.context)
- Índice de Documentação: `.context/docs/README.md`
- Manual de Agentes: `.context/agents/README.md`

#### Checklist rápido de atualização (AI Update Checklist)
1. Coletar contexto (branch atual, mudanças recentes) e conferir `docs/` e `agents/` modificados
2. Validar se a árvore de documentação está alinhada ao índice em `.context/docs/README.md`
3. Atualizar links cruzados se guias foram movidos/renomeados
4. Registrar fontes consultadas e decisões no texto do commit/PR

#### Pontos de Documentação a manter em sincronia
- `Celula-Connect/docs/README.md` (hub do projeto)
- `Celula-Connect/docs/` (quando criado)
- `.context/docs/` (índices e notas globais)
- `.context/agents/` (playbooks se o processo mudar)

---

## 📈 VISÃO GERAL DO PROGRESSO

```
███████████████████████░░ 60% Completo (3/8 fases concluídas, próxima fase em preparação)

Fase 1: ████████████████████ 100% ✅ CONCLUÍDA
Fase 2: ████████████████████ 100% ✅ CONCLUÍDA
Fase 3: ████████████████████ 100% ✅ CONCLUÍDA
Fase 4: ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ AGUARDANDO
Fase 5: ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ AGUARDANDO
Fase 6: ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ AGUARDANDO
Fase 7: ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ AGUARDANDO
Fase 8: ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ AGUARDANDO
```

---

## 🎯 STATUS ATUAL

### 🔥 Prioridade Imediata
Preparar kickoff da **Fase 4 – Migração de Backend**, validando backlog de APIs restantes (trilha/aprovação, webhooks Clerk, endpoints públicos) e definindo responsáveis.

### ✅ Últimas Tarefas Concluídas
- **Data**: 12 de outubro de 2025 (tarde) — Pipeline de migração implementado e Fase 3 encerrada.  
  **Resultado**: `scripts/migrate-data.ts` executa importação idempotente a partir do export legado (`OLD_DB_EXPORT`), cobrindo usuários, igrejas, células, trilhas, comunicação, metas bíblicas e configurações. Documentação e planos atualizados com progresso final.
- **Data**: 12 de outubro de 2025 (manhã) — Integração do Sprint 4 (comunicação e configurações dinâmicas) na camada cliente.  
  **Resultado**: hooks `useAvisos`, `useDevocionais`, `useConvites`, `useLandingConfig` e `useDomainUser` publicados; dashboards (discípulo, líder, supervisor, pastor) passaram a consumir avisos/devocionais/convites; landing page carrega headline/CTA direto de `LandingPageConfig`; novo builder protegido em `/dashboard/pastor/landing-config` com formulários validados para hero + parâmetros de sistema; documentação REST (`docs/api.md`) atualizada.
- **Data**: 11 de outubro de 2025 (noite) — Finalização do Sprint 3 e adequação das rotas tipadas do App Router.  
  **Resultado**: Queries/seed do sistema bíblico atualizadas, rotas `/api/biblia/*` e helpers de `TanStack Query` alinhados aos novos modelos; introdução de `adaptRouteWithParams` para compatibilizar com o `RouteValidator` e execução bem sucedida de `npm run typecheck` e `npm run lint`.
- **Data**: 11 de outubro de 2025 (18:10) — Conclusão da modelagem avançada da Fase 3 (trilhas, comunicação, convites e configurações) com seeds e fixtures sincronizadas.  
  **Resultado**: `prisma/schema.prisma` abrangendo `TrilhaCrescimento`, `AreaSupervisaoTrilha`, `SolicitacaoAvancoTrilha`, `Aviso`, `Devocional`, `Rede`, `Convite`, `LandingPageConfig` e `ConfiguracaoSistema`; seeds expandidas (`prisma/seed.ts`), fixtures alinhadas (`tests/fixtures/domain-seed.json`) e helpers em `src/lib/queries/{trilhas,avisos,devocionais,convites,settings}.ts` prontos para as rotas da Fase 4.
- **Data**: 11 de outubro de 2025 (manhã) — Kickoff do Sprint 1 (Fase 3) implementando camada de queries, validação de seeds e pipeline stub de migração.  
  **Resultado**: Queries Prisma (`igrejas`, `celulas`, `usuarios`, `seed-validation`) criadas, script `scripts/migrate-data.ts` esboçado e checklist atualizado.
- **Data**: 11 de outubro de 2025 (12:10) — Rotas públicas de domínio (`/api/igrejas`, `/api/celulas`, `/api/usuarios`) implementadas com validação Zod, logging e integração com Clerk.  
  **Resultado**: APIs disponíveis consumindo as novas queries e retornando dados seed para testes.
- **Data**: 11 de outubro de 2025 (14:40) — Dashboards por perfil criados com placeholders utilizando novas APIs; navegação atualizada e documentação revisada (rotas + sitemap).  
  **Resultado**: Páginas em `/dashboard/discipulo`, `/dashboard/lider`, `/dashboard/supervisor`, `/dashboard/pastor` consumindo dados seed; hooks (`useCelulas`, `useIgrejas`, `useUsuarios`) publicados.
- **Data**: 11 de outubro de 2025 (15:30) — Sprint 2 iniciado com mutações REST (`/api/igrejas/[id]`, `/api/celulas/[id]`, `/api/usuarios/[id]`), guardas de autorização (`src/lib/domain-auth.ts`) e CTAs de UI.  
  **Resultado**: Pastores podem atualizar/remover igrejas/células e alterar perfis; supervisores gerenciam células supervisionadas; dashboards exibem botões contextuais (placeholders) alinhados às permissões.

#### 📚 Evidências & Rastreabilidade
- Commits/PRs relacionados: a preencher quando publicados
- Queries criadas em `src/lib/queries/{igrejas,celulas,usuarios,seed-validation}.ts`
- Novos helpers publicados em `src/lib/queries/{trilhas,avisos,devocionais,convites,settings}.ts` para sustentar trilhas, comunicação e configurações dinâmicas.
- Adaptação de rotas com `src/lib/api/params.ts` (`adaptRouteWithParams`) garantindo compatibilidade com o contrato tipado do Next 15.
- Rotas disponibilizadas em `src/app/api/{igrejas,celulas,usuarios}/route.ts` e mutações em `src/app/api/{igrejas,celulas,usuarios}/[id]/route.ts`
- Guardas de domínio em `src/lib/domain-auth.ts` controlando perfis (pastor/supervisor)
- Script de pipeline `scripts/migrate-data.ts` adicionado (stub com etapas e logs)
- Seeds de validação permanecem em `prisma/seed.ts`; função `getSeedStats` preparada para conferir contagens (`seed-*`)
- Seeds e fixtures ampliadas para múltiplas igrejas/perfis, trilhas, avisos, devocionais e convites em `prisma/seed.ts` e `tests/fixtures/domain-seed.json`
- Testes Jest configurados: `jest.config.js`, `tests/unit/queries/*`, `tests/integration/api/*`
- Referências utilizadas: `.context/docs/README.md`, `.context/agents/README.md`, `PLANO_MIGRACAO.md §3`
- Observação: seguir mapeando pendências do `npm run typecheck` após introdução das novas rotas (previsto para Sprint 1 – Dia 3)

### 🚀 Próximos Passos (Próximas 4 horas)
1. [x] Preparar plano detalhado do Sprint 1 (Usuários/Igrejas/Células) da Fase 3
2. [x] Esboçar `scripts/migrate-data.ts` com funções stub por domínio
3. [x] Agendar handoff formal da Fase 2 e kickoff da Fase 3 com equipe responsável

> ✅ Reunião de handoff agendada para **11/out/2025 às 09:30** (Squad Core + Arquitetura). Agenda: revisão das entregas da Fase 2, validação do plano do Sprint 1 e definição de responsáveis por queries/APIs.

#### 🗓️ Sprint 1 — Fase 3 (Usuários / Igrejas / Células)
- **Janela sugerida**: 3 dias úteis (D1–D3) imediatamente após handoff da Fase 2  
- **Objetivo**: validar modelo de dados existente, expor camada de queries/APIs iniciais e preparar o esqueleto das telas para revisão semântica.

| Pilar | Entregas | Dependências / Observações |
| --- | --- | --- |
| Prisma & Seeds | ➤ Revisar modelos `Usuario`, `Igreja`, `Celula`, `MembroCelula`, `ReuniaoCelula` e confirmar consistência com seeds `seed-*`<br>➤ Criar migração incremental (se necessário) e rodar `npm run db:push` contra ambiente dev | Seeds já catalogadas (`prisma/seed.ts`) e consultas de verificação listadas em `PLAN/PLANO_MIGRACAO.md` §3.1 |
| Camada de Queries | ➤ Implementar helpers em `src/lib/queries/igrejas.ts`, `celulas.ts`, `usuarios.ts` com filtros básicos (por igreja, perfil, status)<br>➤ Garantir que nenhum Client Component importe Prisma direto | Reutilizar `getActivePlansSorted` como padrão de estilo |
| APIs (Next.js) | ➤ Criar rotas `GET /api/igrejas`, `GET /api/celulas`, `POST /api/celulas` (protótipo) com validação Zod e auth Clerk<br>➤ Esboçar `GET /api/usuarios` focado em perfis eclesiásticos (listar líderes/supervisores) | Depende da camada de queries acima; usar seeds para smoke test |
| UI / Wiring | ➤ Adicionar páginas placeholder: `src/app/(protected)/dashboard/discipulo`, `.../lider`, `.../supervisor`, `.../pastor` com estados de carregamento e chamadas às novas queries<br>➤ Registrar rotas no sitemap/rota organizada (linkar documentação) | Conteúdo apenas estrutural; copy e componentes finais virão em Sprint 2 |
| Observabilidade & QA | ➤ Adicionar logs mínimos usando `withApiLogging` às novas rotas<br>➤ Checklist de SQL de validação (rodar queries de contagem) documentado no PR | SQL sugerido: `SELECT COUNT(*) ... 'seed-%'` (vide plano principal) |

**Cronograma sugerido**
- **Dia 1**: revisão de schema + migrações, criação de queries Prisma.
- **Dia 2**: implementação das rotas API + testes manuais com seeds (insomnia/curl).
- **Dia 3**: scaffolding das páginas de dashboard por perfil, documentação e atualização de sitemap/rotas.

**Critérios de aceite**
1. `npm run db:seed` + consultas SQL retornam valores esperados (`total_celulas_seed = 1`, etc.).
2. Rotas `/api/igrejas`, `/api/celulas` e `/api/usuarios` respondem dados seed autenticando via Clerk (curl ou o fetch do app).
3. Nenhum Client Component importa `@/lib/db`; hooks usam apenas a nova camada de queries.
4. Páginas de dashboard exibem placeholders com dados seed (ex.: nome da célula, número de membros).
5. Documentação atualizada: `PROJETO/ROTAS_ORGANIZADAS.md` e `PROJETO/SITEMAP.md` adicionando esboços das novas rotas.

**Riscos & Mitigações**
- *Divergência schema vs. seeds*: rodar consultas de validação antes de codar; ajustar seeds primeiro.
- *Escopo inflado (UI final)*: manter foco em placeholders e wiring; UX completa fica para Sprint 2.
- *Integração Clerk → autorização por perfil*: usar `PerfilUsuario` (enum) apenas para filtro neste sprint; regras finas entram nas próximas iterações.

##### Progresso Sprint 1 (atualizado em 11/10, 15:05)
- [x] Prisma & Seeds — funções `getSeedStats()` criadas para validar contagens seed.
- [x] Camada de Queries — arquivos `igrejas.ts`, `celulas.ts`, `usuarios.ts` publicados com filtros básicos.
- [x] APIs (Next.js) — rotas `/api/igrejas`, `/api/celulas` (GET/POST) e `/api/usuarios` implementadas e autenticadas.
- [x] UI / Wiring — dashboards por perfil + sidebar atualizados, documentação de rotas/sitemap sincronizada.
- [x] Observabilidade & QA — `getSeedStats()` rodado em 11/10 15:00 (resultado: usuários=3, igrejas=1, celulas=1, membros=2, reuniões=1; perfis seed: discípulo=1, líder=1, supervisor=1). Registrar no PR juntamente com screenshot/log.

#### 🗓️ Sprint 2 — Fase 3 (Planejamento preliminar)
- **Objetivo**: amadurecer o módulo eclesiástico com operações de atualização/remoção, reforçar autorização por perfil e criar fixtures para testes.
- **Escopo detalhado**:
  - **APIs** (`D1–D2`):
    - `PUT /api/igrejas/[id]`, `DELETE /api/igrejas/[id]`.
    - `PUT /api/celulas/[id]`, `DELETE /api/celulas/[id]`.
    - `PATCH /api/usuarios/[id]` (alterar perfil, status ativo/inativo).
    - Responses padronizadas (`{ success, data }`) e mensagens de erro consistentes.
  - **Autorização & Guards** (`D1`):
    - Helper `assertRole(userId, allowedRoles)` reutilizável.
    - Regras sugeridas: pastor pode tudo; supervisor pode alterar células que supervisiona; líder apenas leitura; discípulo bloqueado.
  - **UI/UX** (`D2–D3`):
    - Botões CTA nos dashboards abrindo modal “Gerenciar célula” (somente leitura nesta etapa).
    - Indicadores de permissão (ex.: badge “Somente leitura” para perfis sem acesso).
  - **Seeds & Fixtures** (`D2`):
    - Estender `prisma/seed.ts` com segunda igreja, duas células adicionais, variedade de perfis.
    - Gerar fixture JSON (`tests/fixtures/domain-seed.json`) para testes isolados.
  - **Testes Automatizados** (`D3`):
    - Unitários: validar filtros em `listCelulas`, `listIgrejas`, `listUsuarios`.
    - Integração: smoke `GET /api/igrejas`, `PUT /api/celulas/[id]` (cenário feliz + permissão negada).
- **Dependências**:
  - Acesso ao banco Supabase ou ambiente local com `DATABASE_URL` funcional para rodar seeds e testes.
  - Confirmação de regras de permissão com produto/lead pastoral.
- **Riscos & Mitigações**:
  - Autorização incompleta → gerar feature flag `ENABLE_DOMAIN_MUTATIONS` até finalizar QA.
  - Seeds divergentes → rodar `npm run db:reset && npm run db:seed` em ambiente controlado no início da sprint.
  - Testes lentos por dependência externa → priorizar fixtures locais e mocking de Prisma.

##### Progresso Sprint 2 (atualizado em 11/10, 18:10)
- [x] APIs de mutação (`PUT/DELETE /api/igrejas/[id]`, `/api/celulas/[id]`, `PATCH /api/usuarios/[id]`) com guardas de autorização.
- [x] UI/UX: CTAs contextuais nos dashboards e documentação atualizada.
- [x] Seeds/fixtures ampliadas (`prisma/seed.ts`, `tests/fixtures/domain-seed.json`).
- [x] Testes automatizados iniciais (queries + rotas) (`tests/unit/queries/*`, `tests/integration/api/*`).
- [x] Modelagem avançada liberada: trilhas, áreas de supervisão, solicitações, avisos, devocionais, convites e configurações dinâmicas conectadas ao Prisma Client.

#### 🔍 Nota sobre Observabilidade
- Comando executado:  
  ```bash
  node -e "const { PrismaClient } = require('./prisma/generated/client'); …"
  ```  
  Resultado registrado no log acima. Anexar JSON ao PR e manter consulta SQL como evidência complementar.
- Checklist de QA manual (Sprint 1 encerrando):
  1. Rodar `SELECT COUNT(*)` por tabela (seed) para screenshot na PR description.
  2. Validar acesso aos dashboards em `npm run dev` autenticado com usuário seed (`usr_seed_lider`, etc.).
  3. Confirmar que `/api/igrejas`, `/api/celulas`, `/api/usuarios` retornam dados em ambiente local (usando `curl` ou Thunder Client).

- **Dependências**: acesso ao banco Supabase para geração de seeds adicionais; validação com time de produto sobre papéis autorizados.
- **Riscos**: colisão com políticas de autorização ainda não formalizadas → mitigar implementando feature flags/checkpoints antes de liberar UI mutável.

---

## 📋 FASES DETALHADAS

### ✅ FASE 1: PLANEJAMENTO E ANÁLISE (CONCLUÍDA)

**Status**: ✅ 100% Completo  
**Duração Planejada**: 1 dia  
**Duração Real**: 1 dia  
**Data Início**: 8 de outubro de 2025  
**Data Conclusão**: 8 de outubro de 2025

#### Tarefas Completadas

- [x] **1.1** Ler documentação completa do Igreja-12
  - [x] PRD.md
  - [x] SCHEMA.md
  - [x] LOGICA.md
  - [x] FLUXOGRAMA_USUARIO.md
  - [x] DER.md
  - [x] ROTAS_ORGANIZADAS.md
  - [x] SITEMAP.md
  - **Resultado**: ✅ 7 documentos analisados

- [x] **1.2** Ler documentação completa do Starter-Kit-v2
  - [x] docs/README.md
  - [x] docs/architecture.md
  - [x] docs/backend.md
  - [x] docs/frontend.md
  - [x] docs/database.md
  - [x] docs/authentication.md
  - [x] prisma/schema.prisma
  - **Resultado**: ✅ 7 documentos analisados

- [x] **1.3** Mapear schema de banco de dados
  - **Resultado**: ✅ 33 tabelas mapeadas para 31 modelos Prisma

- [x] **1.4** Mapear funcionalidades e componentes
  - **Resultado**: ✅ 80+ páginas mapeadas, 8 funcionalidades exclusivas identificadas

- [x] **1.5** Criar documento PLANO_MIGRACAO.md
  - **Resultado**: ✅ 1.574 linhas de planejamento técnico completo

#### Decisões Tomadas
- ✅ Usar PostgreSQL ao invés de D1/SQLite
- ✅ Clerk ao invés de Mocha Auth
- ✅ Next.js 15 App Router ao invés de React Router v7
- ✅ TanStack Query ao invés de Context API
- ✅ Radix UI + Tailwind v4 ao invés de componentes custom

#### Observações
- 📝 Todas as 8 funcionalidades exclusivas devem ser preservadas
- 📝 Sistema de aprovação de trilha é PRIORIDADE MÁXIMA
- 📝 Cronograma total: 34 dias (7 semanas)

---

### ✅ FASE 2: SETUP DO PROJETO (CONCLUÍDA)

**Status**: ✅ 100% (15/15 tarefas concluídas)  
**Duração Planejada**: 2 dias  
**Início Real**: 8 de outubro de 2025, 15:00  
**Conclusão Estimada**: 10 de outubro de 2025  
**Conclusão Real**: 10 de outubro de 2025, 21:05 (setup Clerk/OAuth + next.config finalizados)

**Objetivo da fase**: configurar a base técnica (Next.js, Prisma, Clerk e tooling) para que as próximas fases possam focar em migração de domínio.

**Notas de Kick-off**
- Estrutura será baseada no `starter-kit-v2`, com adaptações mínimas antes de migrar features.
- Priorizamos gerar um build limpo (`npm run lint && npm run build`) antes de integrar dados.
- Registrar logs relevantes no PR (build, lint, testes) para rastreabilidade.

#### 📝 Checklist de Tarefas

##### 2.1 Estrutura de Projeto

- [x] **2.1.1** Copiar arquivos base do `starter-kit-v2`
  - [x] Copiar estrutura de pastas
  - [x] Copiar arquivos de configuração
  - [x] Copiar componentes UI base (Radix)
  - **Resultado**: estrutura SaaS copiada sem sobrescrever documentação existente

- [x] **2.1.2** Criar estrutura de pastas personalizada
  ```
  Celula-Connect/
  ├── prisma/
  ├── src/
  │   ├── app/
  │   │   ├── (public)/
  │   │   ├── (protected)/
  │   │   ├── admin/
  │   │   └── api/
  │   ├── components/
  │   ├── lib/
  │   ├── hooks/
  │   └── types/
  ├── public/
  └── docs/
  ```
  - **Estimativa**: 15 min

##### 2.2 Configuração de Dependências

- [x] **2.2.1** Configurar `package.json`
  - [x] Definir nome e versão do projeto (`celula-connect` @ `1.0.0`)
  - [x] Revisar scripts de desenvolvimento (mantidos para Prisma + Next)
  - [x] Garantir dependências conforme base (Clerk, Prisma, Radix, Query)

- [x] **2.2.2** Instalar dependências principais
  ```bash
  npm install next@15.3.5 react@19 react-dom@19
  npm install @clerk/nextjs @prisma/client
  npm install @tanstack/react-query
  npm install @radix-ui/react-*
  npm install tailwindcss postcss autoprefixer
  npm install zod react-hook-form @hookform/resolvers
  npm install lucide-react
  ```
  - **Estimativa**: 10 min

- [x] **2.2.3** Instalar dependências de desenvolvimento
  ```bash
  npm install -D typescript @types/node @types/react
  npm install -D eslint eslint-config-next
  npm install -D prisma
  npm install -D @playwright/test
  ```
  - **Estimativa**: 5 min

- [x] **2.3.1** Configurar `next.config.js`
  - [x] Habilitar Server Components (App Router padrão)
  - [x] Configurar domínios de imagens (`images.unsplash.com`, `html.tailus.io`)
  - [x] Configurar variáveis de ambiente e flags específicas do projeto (`reactStrictMode`, `typedRoutes`, fallback `NEXT_PUBLIC_APP_URL`)
  - **Estimativa**: 15 min

- [x] **2.3.2** Configurar `tsconfig.json`
  - [x] Paths aliases (@/, @/components, etc)
  - [x] Strict mode
  - [x] Configurações de compilação alinhadas ao Next 15
  - **Estimativa**: 10 min

- [x] **2.3.3** Configurar Tailwind CSS v4
  - [x] `tailwind.config.ts`
  - [x] `postcss.config.js`
  - [x] Arquivo de estilos globais
  - [x] Variáveis CSS personalizadas
  - **Estimativa**: 20 min

- [x] **2.3.4** Criar arquivo `.env.example`
  ```env
  # Database
  DATABASE_URL="postgresql://..."
  
  # Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  
  # App
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```
  - **Estimativa**: 10 min

- [x] **2.4.1** Inicializar Prisma
  ```bash
  npx prisma init
  ```
  - **Resultado**: Estrutura `prisma/` e `.env` base criadas
  - **Estimativa**: 5 min

- [x] **2.4.2** Criar schema Prisma básico
  - [x] Configurar datasource (PostgreSQL)
  - [x] Configurar generator (Prisma Client)
  - [x] Criar primeiros 3 modelos (Usuario, Igreja, Plano)
  - **Estimativa**: 30 min

- [x] **2.4.3** Configurar conexão com banco de dados
  - [x] Criar instância PostgreSQL (local ou cloud)
  - [x] Configurar DATABASE_URL
  - [x] Testar conexão (`npm run db:push` - Supabase)
  - **Resultado**: Schema aplicado e Prisma Client regenerado (09/10 16:33)

- [x] **2.5.1** Criar conta Clerk
  - [x] Registrar no Clerk.com (projeto `celula-connect-dev`)
  - [x] Criar novo aplicativo (ambiente development)
  - [x] Obter chaves API (armaz. em `.env.local` com `pk_test_*` e `sk_test_*`)
  - **Estimativa**: 10 min

- [x] **2.5.2** Configurar Clerk no projeto
  - [x] Adicionar variáveis de ambiente ao `.env.example`
  - [x] Criar middleware de autenticação (`src/middleware.ts`)
  - [x] Configurar ClerkProvider no layout global (`src/app/layout.tsx`)
  - **Estimativa**: 20 min

- [x] **2.5.3** Configurar OAuth providers
  - [x] Google (habilitado em Clerk dashboard para dev – 10/10/2025)
  - [x] GitHub (opcional, mantido como fallback em teste)
  - [x] Personalizar UI de login (`<SignIn />` com social buttons via Clerk)
  - **Estimativa**: 15 min

#### 🎯 Objetivo da Fase
Ao final desta fase, devemos ter:
- ✅ Projeto Next.js configurado e rodando
- ✅ Todas as dependências instaladas
- ✅ Banco de dados PostgreSQL conectado
- ✅ Clerk autenticação configurada
- ✅ Estrutura de pastas organizada
- ✅ Primeiro `npm run dev` funcionando
- ➡️ Webhooks Clerk → serão configurados na Fase 4 em conjunto com as rotas de billing/admin

#### 🗂️ Documentos a atualizar ao concluir a Fase 2
- Este `ACOMPANHAMENTO_MIGRACAO.md` (progresso, evidências e decisões)
- `Celula-Connect/docs/README.md` (overview, comandos e links)
- Qualquer guia criado em `Celula-Connect/docs/` (se aplicável)
- Validar entradas no índice `.context/docs/README.md`

#### 📊 Progresso Atual
```
Tarefas: 15/15 completas (100%)
Tempo Estimado: ~4 horas
Tempo Gasto: ~4.2 horas
```

---

### ✅ FASE 3: MIGRAÇÃO DE BANCO DE DADOS (CONCLUÍDA)

**Status**: ✅ Concluída em 12/10/2025 — pipeline de migração implementado, dados estruturados importados e documentação atualizada.  
**Duração Planejada**: 4 dias  
**Tarefas Totais**: 33 modelos Prisma

**Pré-requisitos**
- ✅ Seeds `seed-*` aplicadas no Supabase dev para servir de baseline de validação.
- ✅ Relacionamentos de células sincronizados com o banco após `db:push` (10/10 20:44).
- ✅ Strict mode habilitado no `tsconfig.json` e scripts de seed disponíveis no `package.json`.
- ✅ Queries de comparação e função `getSeedStats()` atualizadas para cobrir os novos módulos (`trilhas`, `avisos`, `convites`, `configurações`).

#### Hand-off imediato
1. [x] Planejar Sprint 1 da Fase 4 (rotas prioritárias: trilha/aprovação, metas avançadas, webhooks Clerk) — ver `PLAN/PLANO_MIGRACAO.md`, seção **Fase 4 / Priorização de APIs**
2. [x] Publicar checklist de QA para execução do pipeline de migração antes de cada ambiente — ver `docs/testing/migration-pipeline-checklist.md`
3. [ ] Alinhar comunicação com o time de produto sobre o encerramento da Fase 3 e próximos marcos

---

### ⏸️ FASE 4: MIGRAÇÃO DE BACKEND (AGUARDANDO)

**Status**: ⏸️ Aguardando kickoff (Fase 3 encerrada)  
**Duração Planejada**: 6 dias  
**Tarefas Totais**: 15+ API Routes

---

### ⏸️ FASE 5: MIGRAÇÃO DE FRONTEND (AGUARDANDO)

**Status**: ⏸️ Aguardando conclusão da Fase 4  
**Duração Planejada**: 12 dias  
**Tarefas Totais**: 80+ páginas

---

### ⏸️ FASE 6: FUNCIONALIDADES EXCLUSIVAS (AGUARDANDO)

**Status**: ⏸️ Aguardando conclusão da Fase 5  
**Duração Planejada**: 4 dias  
**Tarefas Totais**: 8 funcionalidades críticas

---

### ⏸️ FASE 7: TESTES E QUALIDADE (AGUARDANDO)

**Status**: ⏸️ Aguardando conclusão da Fase 6  
**Duração Planejada**: 3 dias

---

### ⏸️ FASE 8: DEPLOYMENT (AGUARDANDO)

**Status**: ⏸️ Aguardando conclusão da Fase 7  
**Duração Planejada**: 2 dias

---

## 📝 REGISTRO DE ATIVIDADES

### 10 de Outubro de 2025

#### 20:50 - Execução de seeds no Supabase (ambiente de desenvolvimento)
- ✅ `npm run db:seed` rodado no PowerShell (Windows) utilizando `tsx prisma/seed.ts`
- ✅ Plano, igreja, supervisor, líder, discípula, célula, membros e reunião criados com IDs `seed-*`
- 📝 Dados servem como fixtures temporárias para validar consultas/dashboards da Fase 3
- ⚠️ Revisar antes de produção; remover/atualizar seeds conforme migração real

#### 21:05 - Conclusão do setup Clerk/OAuth e ajustes finais da Fase 2
- ✅ `next.config.ts` atualizado (`reactStrictMode`, `typedRoutes`, fallback `NEXT_PUBLIC_APP_URL`)
- ✅ Documentação de OAuth em `docs/authentication.md` com status dos provedores Google/GitHub
- ✅ Checklists 2.5.1 e 2.5.3 marcados como concluídos (conta Clerk `celula-connect-dev`, social login ativo)
- 🎯 Fase 2 oficialmente concluída; pronta para handoff à Fase 3

### 9 de Outubro de 2025

#### 16:40 - Execução do dev server e correção do LightningCSS
- ✅ Rodado `npm rebuild lightningcss` para restaurar binário nativo no Windows
- ✅ `npm run dev` compila com sucesso (aviso apenas de múltiplos lockfiles)
- ⚠️ Fluxo `/sign-in` ainda precisa ser validado manualmente no browser

#### 16:33 - Sincronização do schema no PostgreSQL (Supabase)
- ✅ Executado `npm run db:push` (Prisma Client regenerado em `prisma/generated/client`)
- ✅ Conexão confirmada com `aws-1-sa-east-1.pooler.supabase.com:5432`
- ✅ `DATABASE_URL` validada via `.env.local`
- 📝 Próximo passo: validar autenticação Clerk com fluxo real

#### 16:10 - Modelagem inicial do domínio no Prisma
- ✅ Adicionados modelos `Usuario`, `Igreja` e `Plano` em `prisma/schema.prisma`
- ✅ Ajustado setup do Clerk (`src/app/layout.tsx`, `src/middleware.ts`) e variáveis em `.env.example`
- ✅ Revisado baseline de Tailwind e `next.config.ts` (domínios externos)
- ⚠️ Pendente executar `npm run db:push` por falta de instância PostgreSQL configurada _(resolvido às 16:33)_

### 8 de Outubro de 2025

#### 14:30 - Criação do Sistema de Acompanhamento
- ✅ Criado arquivo `ACOMPANHAMENTO_MIGRACAO.md`
- ✅ Definido sistema de controle e rastreamento
- 📝 Próximo passo: Iniciar Fase 2

#### 13:00 - Conclusão da Fase 1
- ✅ Análise completa da documentação
- ✅ Mapeamento de 33 tabelas → 31 modelos Prisma
- ✅ Mapeamento de 80+ páginas
- ✅ Criação do PLANO_MIGRACAO.md (1.574 linhas)
- 🎯 Fase 1 concluída com sucesso!

#### 10:00 - Início do Projeto
- ✅ Leitura da documentação Igreja-12
- ✅ Leitura da documentação Starter-Kit-v2
- 🔄 Início da análise técnica

---

## 🚨 BLOQUEIOS E IMPEDIMENTOS

### Bloqueios Atuais
- Nenhum bloqueio crítico no momento.

### Riscos Monitorados
1. ⚠️ **Complexidade do Sistema Bíblico** (31.102 versículos)
   - Mitigação: Script de migração automatizado
   - Status: Monitorando

2. ⚠️ **Preservação da Funcionalidade de Aprovação**
   - Mitigação: Testes extensivos planejados
   - Status: Monitorando

---

## 💡 DECISÕES IMPORTANTES

### Decisões Arquiteturais

| Data | Decisão | Razão | Impacto |
|------|---------|-------|---------|
| 08/10/2025 | PostgreSQL ao invés de D1 | Escalabilidade e recursos enterprise | Alto - Migração complexa |
| 08/10/2025 | Clerk ao invés de Mocha Auth | Recursos avançados (2FA, OAuth) | Médio - Reconfiguração |
| 08/10/2025 | Next.js 15 App Router | Performance e SSR | Alto - Mudança arquitetural |
| 08/10/2025 | Manter todas 8 funcionalidades exclusivas | Diferencial competitivo | Crítico - Não negociável |

### Decisões de Escopo

| Data | Decisão | Status |
|------|---------|--------|
| 08/10/2025 | Cronograma de 34 dias (7 semanas) | ✅ Aprovado |
| 08/10/2025 | Priorizar trilha com aprovação | ✅ Definido |
| 08/10/2025 | Deployment via Vercel | ✅ Confirmado |

---

## 📊 MÉTRICAS DE PROGRESSO

### Por Fase

| Fase | Tarefas Totais | Concluídas | Progresso |
|------|----------------|------------|-----------|
| Fase 1 | 5 | 5 | 100% ✅ |
| Fase 2 | 15 | 15 | 100% ✅ |
| Fase 3 | ~40 | ~40 | 100% ✅ |
| Fase 4 | ~25 | 0 | 0% ⏸️ |
| Fase 5 | ~100 | 0 | 0% ⏸️ |
| Fase 6 | 8 | 0 | 0% ⏸️ |
| Fase 7 | ~15 | 0 | 0% ⏸️ |
| Fase 8 | ~10 | 0 | 0% ⏸️ |

### Estatísticas Gerais

- **Total de Tarefas**: ~216
- **Tarefas Concluídas**: 60
- **Progresso Global**: ~27.8%
- **Dias Trabalhados**: 3
- **Dias Restantes**: 31

---

## 🎯 METAS E OBJETIVOS

### Meta da Semana Atual (Semana 1)
- [x] ✅ Concluir Fase 1: Planejamento
- [x] ✅ Concluir Fase 2: Setup do Projeto
- [x] ✅ Concluir Fase 3: Migração de Banco
- [ ] 🚩 Preparar kickoff da Fase 4 (definir backlog e responsáveis)

### Próximas Milestones

| Milestone | Data Alvo | Status |
|-----------|-----------|--------|
| Fase 1 Completa | 08/10/2025 | ✅ Concluída |
| Fase 2 Completa | 10/10/2025 | ✅ Concluída |
| Primeiro Deploy Local | 11/10/2025 | ⏸️ Aguardando |
| Database Schema Completo | 14/10/2025 | ⏸️ Aguardando |
| Primeira API Funcional | 16/10/2025 | ⏸️ Aguardando |
| Dashboard Discípulo | 20/10/2025 | ⏸️ Aguardando |
| Sistema de Aprovação | 28/10/2025 | ⏸️ Aguardando |
| Deploy em Produção | 18/11/2025 | ⏸️ Aguardando |

---

## 📚 RECURSOS E LINKS ÚTEIS

### Documentação
- [PLANO_MIGRACAO.md](./PLANO_MIGRACAO.md) - Plano completo de migração
- [Igreja-12/DOC/](../Igreja-12/DOC/) - Documentação do projeto original
- [starter-kit-v2/docs/](../starter-kit-v2/docs/) - Documentação da base

### Links Externos
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)

### Referências Internas (.context)
- `.context/docs/README.md` — Índice de documentação
- `.context/agents/README.md` — Playbooks e melhores práticas

### Políticas de PR e Testes (`.context/agents/README.md`)
- Executar `npm run test` (usar `-- --watch` ao iterar)
- Antes do PR: `npm run build && npm run test`
- Adotar Conventional Commits no título/descrição
- Atualizar índices (`docs/README.md`, `agents/README.md`) ao criar novos guias
- Armazenar artefatos determinísticos em `.context/` para replays

---

## 🔄 INSTRUÇÕES DE USO DESTE ARQUIVO

### Como Atualizar
1. **Ao concluir uma tarefa**: Marque com `[x]` e adicione observações
2. **Ao iniciar nova fase**: Atualize status e barra de progresso
3. **Ao identificar bloqueio**: Adicionar na seção de bloqueios
4. **Ao tomar decisão**: Registrar na seção de decisões
5. **Diariamente**: Atualizar registro de atividades

### Frequência de Atualização
- ✅ **A cada tarefa concluída**: Marcar checklist
- ✅ **A cada 2-3 horas**: Atualizar progresso da fase
- ✅ **Diariamente**: Atualizar registro de atividades
- ✅ **Ao final de cada fase**: Atualizar métricas gerais

### Legenda de Status
- ✅ **Concluída**: Tarefa/Fase finalizada
- 🔄 **Em Andamento**: Atualmente sendo executada
- ⏸️ **Aguardando**: Aguardando dependências
- ⚠️ **Bloqueada**: Impedimento identificado
- ❌ **Cancelada**: Tarefa removida do escopo

---

## 📞 RESPONSABILIDADES

### Equipe de Desenvolvimento
- Executar tarefas conforme planejamento
- Atualizar este arquivo regularmente
- Reportar bloqueios imediatamente
- Documentar decisões técnicas

### Product Owner
- Aprovar decisões de escopo
- Priorizar funcionalidades
- Validar entregas

---

**Última Sincronização**: 11 de outubro de 2025, 21:45  
**Próxima Revisão Programada**: 12 de outubro de 2025, 14:00

---

> 💡 **Dica**: Mantenha este arquivo sempre atualizado! Ele é sua fonte única de verdade para o progresso da migração.

