# PRD – Célula Connect (Migração Igreja-12)

Documento vivo que alinha visão de produto, capacidades entregues e próximos incrementos da migração do **Igreja-12** para a base tecnológica do **Starter Kit v2** (Next.js 15 + Prisma + Clerk).

## 1. Visão Geral

- **Proposta**: prover uma plataforma moderna de gestão de células com trilhas espirituais, créditos e automações, construída sobre um SaaS template já validado em produção.
- **Motivação**: a versão original (React + Cloudflare D1) limita escalabilidade, integrações e time-to-market para novos módulos com IA.
- **Abordagem**: portar funcionalidades por fatias verticais, mantendo a base SaaS (auth, billing, créditos, admin) estável enquanto migramos o domínio eclesiástico.

## 2. Personas & Benefícios

| Persona | Necessidade | Valor Entregue |
| --- | --- | --- |
| Pastor executivo | Visão macro da igreja e assinatura | Cockpit administrativo com métricas e gestão de planos (`src/app/admin/page.tsx`). |
| Supervisor de células | Acompanhar redes e aprovar trilhas | Modelagem de supervisão já mapeada em `prisma/schema.prisma` (PerfilUsuario.SUPERVISOR); UI em planejamento. |
| Líder de célula | Operar reuniões, membros e metas | Estrutura de dados (`Celula`, `MembroCelula`, `ReuniaoCelula`) e seeds prontas (`prisma/seed.ts`); telas serão migradas. |
| Discípulo/membro | Consumir trilha, devocionais, avisos | Fluxos ainda não migrados; prioridade após dashboards básicos. |
| Time interno | Configurar produto, monetização e IA | Painéis protegidos + admin, IA chat (`src/app/(protected)/ai-chat/page.tsx`) e sistema de créditos operacionais. |

## 3. Estado Atual da Plataforma

### 3.1 Fundação SaaS (entregue)

| Capacidade | Descrição | Status |
| --- | --- | --- |
| Autenticação & acesso | Fluxos Clerk (login, registro), middleware e layout protegido (`src/app/(protected)/layout.tsx`). | ✅ |
| Assinatura e gating | Verificação de subscription (`src/app/api/subscription/status/route.ts`) e redirecionamento para `/subscribe`. | ✅ |
| Planos & créditos | Leitura de planos ativos (`src/lib/queries/plans.ts`), saldo de créditos (`src/hooks/use-credits.ts`) e ajuste administrativo (`src/app/admin/credits/page.tsx`). | ✅ |
| IA conversacional | Chat streaming com seleção de provedores e anexos (`src/app/(protected)/ai-chat/page.tsx`). | ✅ |
| IA imagens | Rota `POST /api/ai/image` com controle de créditos e geração via OpenRouter (`src/hooks/use-ai-image.ts`). | ✅ |
| Administração | Dashboard executivo, gestão de usuários, créditos, storage e configurações (`src/app/admin/*`). | ✅ |
| Uploads | Integração Vercel Blob em `POST /api/upload` com rastreio em `StorageObject`. | ✅ |

### 3.2 Migração Igreja-12 (em andamento)

- **Modelagem**: entidades `Plano`, `Igreja`, `Usuario`, `Celula`, `MembroCelula` e `ReuniaoCelula` adicionadas ao Prisma (`prisma/schema.prisma`).
- **Seeds**: `prisma/seed.ts` gera igreja, líderes, membros e reuniões de exemplo para validar consultas.
- **Integração com UI**: ainda não há rotas dedicadas aos papéis eclesiásticos; backlog inclui dashboards por perfil e gestão de células.
- **Landing page**: continuará configurável, porém o conteúdo atual segue o template padrão (`src/app/(public)/page.tsx`) até que o copy específico da igreja seja migrado.

### 3.3 Backlog Prioritário

| Item | Objetivo | Dependências |
| --- | --- | --- |
| Dashboards por perfil | Recriar visão de discípulo, líder, supervisor e pastor com dados reais. | APIs e consultas sobre novos modelos. |
| Trilha de crescimento | Portar workflow de aprovação e histórico. | Persistência de etapas (novo schema). |
| Sistema bíblico | Importar livros/capítulos/versículos e tracking de leitura. | ETL + rotas de leitura. |
| Avisos e devocionais | Reimplementar scheduler e feed segmentado. | Filas/eventos ou jobs periódicos. |
| Landing configurável | Migrar CMS interno do Igreja-12 para o admin atual. | Storage de blocos vs. templates. |

## 4. Requisitos Funcionais (RF)

| ID | Descrição | Status | Observações |
| --- | --- | --- | --- |
| RF-01 | Usuários autenticam via Clerk e acessam área protegida. | Entregue | `src/app/(public)/sign-in/[[...sign-in]]/page.tsx` |
| RF-02 | Assinatura ativa é obrigatória para acessar recursos pagos. | Entregue | Gating em `src/app/(protected)/layout.tsx`. |
| RF-03 | Créditos são debitados/estornados por operação (chat/imagem). | Entregue | Helpers em `src/lib/credits/deduct.ts`. |
| RF-04 | Admin consegue gerenciar usuários, convites e créditos. | Entregue | Rotas `src/app/admin/users/page.tsx` e `src/app/admin/credits/page.tsx`. |
| RF-05 | Estrutura de igreja/célula persistida no banco. | Em andamento | Tabelas criadas, faltam APIs e UI. |
| RF-06 | Dashboards específicos por perfil eclesiástico. | Planejado | Depende de RF-05. |
| RF-07 | Trilha de crescimento com aprovação por supervisor. | Planejado | Requer modelagem e APIs novas. |
| RF-08 | Landing page gerenciável pelo admin. | Planejado | Aproveitar admin + storage. |

## 5. Requisitos Não Funcionais (RNF)

- **RNF-01 Performance**: páginas críticas devem carregar em <2s em rede 4G; uso de Server Components e caching (Next.js 15).
- **RNF-02 Segurança**: autenticação centralizada no Clerk, APIs validadas com tokens e checagem de créditos; sem dados sensíveis em Client Components.
- **RNF-03 Observabilidade**: logging estruturado via `src/lib/logging/*`; métricas adicionais previstas ao portar fluxos de células.
- **RNF-04 Escalabilidade**: PostgreSQL + Prisma; todas as novas features devem usar camadas de query (`src/lib/queries/*`).
- **RNF-05 Localização**: manter textos em português pt-BR; preparar camada futura de i18n.

## 6. Métricas de Sucesso

- **Adoção**: percentual de igrejas migradas que acessam dashboards específicos nas primeiras 2 semanas.
- **Engajamento**: número médio de reuniões registradas por célula (meta inicial: ≥2/mês) após RF-05 e RF-06.
- **Retenção**: queda <5% em churn após portar trilhas (RF-07).
- **Uso de IA**: pelo menos 60% das células com líderes ativos utilizando chat IA para roteiros/mensagens.

## 7. Dependências e Riscos

- Integração Clerk Billing (tokens administrados fora do repositório).
- Provisionamento OpenRouter / provedores equivalentes para IA.
- Importação confiável do acervo bíblico (licença de conteúdo).
- Complexidade de autorização por perfil ao unir tabelas legacy e novas (risco de regressão).
- Necessidade de job runner/disparos assíncronos para avisos e devocionais.

## 8. Próximos Passos

1. Expor APIs REST/Server Actions para `Igreja`, `Celula` e `MembroCelula`.
2. Criar dashboards MVP por perfil com dados seed.
3. Ajustar landing com conteúdo Igreja-12 e publicar guia de edição no admin.
4. Planejar import/export do acervo bíblico e trilhas.

## 9. Referências

- Roadmap detalhado: `PLAN/PLANO_MIGRACAO.md`
- Log operacional: `PLAN/ACOMPANHAMENTO_MIGRACAO.md`
- Arquitetura base: `docs/architecture.md`
- Diretrizes de desenvolvimento: `docs/development-guidelines.md`
