# 🗺️ Rotas Navegáveis do Célula Connect

Referência rápida das páginas acessíveis via navegador, considerando os agrupadores do App Router (`(public)`, `(protected)`, `admin`) e as restrições de perfil descritas na documentação de migração.

## Públicas (sem autenticação)
- `/` — Landing page configurável (hero, benefícios, depoimentos, planos).
- `/sign-in` — Autenticação via Clerk.
- `/sign-up` — Criação de conta via Clerk.
- `/subscribe` — Fluxo de assinatura/upgrade.

## Área autenticada (qualquer usuário logado)
- `/dashboard` — Redireciona para o dashboard do perfil do usuário logado.
- `/ai-chat` — Interface de chat com IA.
- `/avisos` — Central de avisos com filtros e métricas.
- `/devocionais` — Biblioteca de devocionais com agenda e CRUD.
- `/celulas` — Gestão de células (lista, métricas e atalhos de ação).
- `/billing` — Informações de cobrança e planos vinculados.
- `/biblia/leitor` — Leitor bíblico com progresso automático.
- `/biblia/metas` — Painel de metas de leitura.
- `/trilha` — Visão geral da trilha de crescimento e progresso pessoal.

## Dashboards por perfil
- `/dashboard/discipulo` — Painel com foco em discipulado (papel Discípulo).
- `/dashboard/lider` — Painel do líder de célula.
- `/dashboard/supervisor` — Painel do supervisor com visão de rede.
- `/dashboard/pastor` — Painel executivo do pastor.

## Fluxos específicos por perfil
- `/trilha/aprovacao` — Aprovação de solicitações da trilha (Supervisor/Pastor).
- `/dashboard/pastor/landing-config` — Builder da landing page pública (Pastor).

## Área administrativa (perfil Pastor/Admin)
- `/admin` — Overview administrativo.
- `/admin/users` — Gestão de usuários e perfis.
- `/admin/usage` — Métricas de uso da plataforma.
- `/admin/credits` — Controle de créditos e deduções.
- `/admin/storage` — Monitoramento de armazenamento.
- `/admin/settings` — Hub de configurações gerais.
- `/admin/settings/plans` — Administração de planos e preços.
- `/admin/settings/features` — Cadastro de funcionalidades exibidas nos planos.
- `/admin/settings/feature-flags` — Flags operacionais (ex.: `ENABLE_DOMAIN_MUTATIONS`).

> ℹ️ Rotas agrupadas por `(protected)` exigem autenticação via Clerk. Dentro delas, o acesso a cada página respeita os guardas definidos em `src/lib/domain-auth.ts`, alinhados aos perfis `Discípulo`, `Líder`, `Supervisor` e `Pastor`. Rotas do agrupador `admin` seguem políticas equivalentes ao perfil Pastor/Admin.
