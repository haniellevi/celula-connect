# ❄️ Plano para Hibernar o Módulo de Créditos

**Data de criação**: 18 de outubro de 2025  
**Status alvo**: pronto para execução (hibernação reversível)  
**Responsáveis principais**: Backend, Frontend, QA, DevOps

---

## 1. Contexto atual
- `POST /api/ai/chat` (`src/app/api/ai/chat/route.ts`) e `POST /api/ai/image` (`src/app/api/ai/image/route.ts`) chamam `validateCreditsForFeature`, `deductCreditsForFeature` e `refundCreditsForFeature` antes/despois do provedor. Falha de saldo gera `402 insufficient_credits`.
- Funções em `src/lib/credits/*.ts` (especialmente `validate-credits.ts`, `deduct.ts`, `track-usage.ts` e `settings.ts`) acessam diretamente `creditBalance`, `usageHistory` e custos por feature, criando saldos e registrando transações.
- Webhooks da Clerk (`src/app/api/webhooks/clerk/route.ts`) e rotas administrativas (`src/app/api/admin/users/sync/route.ts` etc.) sincronizam créditos via `refreshUserCredits` e `addUserCredits`.
- A UI usa `useCredits()` (`src/hooks/use-credits.ts`) e os endpoints `/api/credits/me` e `/api/credits/settings` para bloquear botões e exibir saldo. Sem ajustes, qualquer interrupção na atualização server-side mantém a interface em estado “sem créditos”.

## 2. Objetivo do plano
Suspender temporariamente todo o fluxo de créditos sem remover o schema ou quebrar dependências: quando o modo “hibernado” estiver ativo, nenhum endpoint deve debitar/criar créditos, webhooks não devem sincronizar saldos e a UI deve se comportar como “créditos ilimitados”.

## 3. Critérios de sucesso
- Flag única (`areCreditsEnabled()`) governa todo o módulo; `CREDITS_ENABLED=0` interrompe débitos, registros e sincronizações.
- Nenhum endpoint retorna `402` enquanto o flag estiver desligado; chamadas prosseguem até o provedor normalmente.
- Webhooks e rotas admin registram logs informativos e retornam `200` sem alterar saldos quando o módulo está hibernado.
- `useCredits()` deixa de bloquear operações e evita requests periódicas aos endpoints de créditos quando desabilitado.
- Documentação (`docs/credits.md`) descreve claramente como ligar/desligar o modo e os impactos.
- Testes automatizados cobrem ambos os cenários (flag on/off), com asserts atualizados para o comportamento “sem limite”.

## 4. Escopo

**Incluído**
- Criação da flag (`src/lib/credits/feature-flag.ts` ou similar) e leitura via variável de ambiente (`CREDITS_ENABLED`), com fallback seguro.
- Atualização dos helpers de créditos, APIs, webhooks/admin e hook de UI para respeitar a flag.
- Ajustes em documentação, testes unitários/integrados e checklists operacionais.
- Instrumentação mínima: logs estruturados indicando que créditos estão desativados.

**Fora do escopo**
- Remover tabelas `creditBalance`/`usageHistory` ou migrar dados.
- Alterar a experiência visual da UI além do necessário para liberar ações.
- Reestruturar billing ou remover integrações com Clerk.

## 5. Estratégia de execução

### 5.1 Preparação
- [x] Confirmar variáveis em `.env.local`, `.env.example` e infraestrutura (CI/CD) que precisam conhecer `CREDITS_ENABLED`. *(Flag aplicada em `.env` e `.env.local`; registrar follow-up para replicar em pipelines/infra.)*
- [x] Mapear recursos compartilhados: custos em `src/lib/credits/feature-config.ts`, `settings.ts`, uso em `src/lib/credits/deduct.ts`, `validate-credits.ts` e `track-usage.ts`.
- [ ] Alinhar stakeholders (produto/financeiro) sobre impactos temporários em billing e relatórios. *(Agendar comunicação com time de produto/financeiro.)*

### 5.2 Feature flag central (`src/lib/credits`)
- [x] Criar helper `areCreditsEnabled()` (ex.: `src/lib/credits/feature-flag.ts`) lendo `process.env.CREDITS_ENABLED`. Definir convenções (`1`/`true` → on; `0`/`false` → off).
- [x] (Opcional) Exportar `withCreditsEnabled<T>(callback)` ou helpers utilitários se facilitar retorno antecipado. *(Decidido manter chamadas diretas ao helper para simplicidade.)*
- [x] Documentar fallback seguro (default = habilitado para manter compatibilidade até alteração explícita da infra).

### 5.3 Biblioteca de créditos
- [x] Atualizar `validateCreditsForFeature`, `deductCreditsForFeature`, `refundCreditsForFeature` (`src/lib/credits/deduct.ts`) para curto-circuitar: quando desabilitado, retornar créditos “ilimitados” (ex.: `{ available: Infinity }`), não tocar no banco e emitir `console.info` com motivo.
- [x] Ajustar `validateCredits`, `deductCredits`, `refreshUserCredits`, `addUserCredits` (`src/lib/credits/validate-credits.ts`) para respeitar a flag, incluindo logs e early-return.
- [x] Suspender gravações em histórico (`trackUsage` e helpers em `src/lib/credits/track-usage.ts`) com mesma lógica de flag.
- [x] Revisar `src/lib/credits/settings.ts` e `feature-config.ts` para permitir retornar custos/planos padrão estáticos (ex.: custos `0`, créditos `Infinity`) quando desabilitado.
- [x] Garantir que erros `InsufficientCreditsError` nunca sejam lançados com flag off.

### 5.4 APIs de IA (`src/app/api/ai`)
- [x] Em `chat/route.ts` e `image/route.ts`, checar `areCreditsEnabled()` antes de validar/deduzir. Quando off, pular chamadas a créditos e continuar fluxo normal.
- [x] Revisar branchs de erro: remover retorno `402` em modo hibernado e substituir por logs informativos.
- [x] Adicionar métricas/logs (ex.: `console.warn('Credits disabled: skipping debit for ai_text_chat')`).

### 5.5 Endpoints de créditos (`src/app/api/credits`)
- [x] `GET /api/credits/me`: se flag off, retornar payload estático (ex.: `{ creditsRemaining: null, unlimited: true }`) sem consultar o banco.
- [x] `GET /api/credits/settings`: devolver custos/planos coerentes (ex.: `featureCosts = { ...0 }`, `planCredits = null`), evitando chamadas ao Prisma.
- [x] Atualizar testes e contratos para refletir o novo shape da resposta.

### 5.6 Webhooks e rotas administrativas
- [x] `src/app/api/webhooks/clerk/route.ts`: inserir guard no início; quando créditos off, logar e retornar `200` sem chamar `refreshUserCredits`/`addUserCredits`.
- [x] `src/app/api/admin/users/sync/route.ts` e demais rotas que manipulam créditos: early-return + log, mantendo resposta anterior (mas indicando que créditos estão hibernados).
- [x] Verificar jobs agendados ou scripts que chamem `refreshUserCredits` (consultar `scripts/`, `tests/`). *(Nenhum job extra encontrou a função.)*

### 5.7 UI / Hook de créditos
- [x] Atualizar `useCredits()` (`src/hooks/use-credits.ts`) para ler flag (pode vir de `NEXT_PUBLIC_CREDITS_ENABLED` ou campo retornado pelo endpoint settings).
  - Se flag off: evitar `useQuery` contra `/api/credits/*`, retornar `credits = null` ou objeto `unlimited`, `isLoading = false`, `canPerformOperation = () => true`.
- [x] Ajustar componentes que exibem saldo (ex.: páginas em `src/app/(protected)/billing`, botões em `/ai-chat`) para tratar o estado “ilimitado” (exibir mensagem “Créditos ilimitados temporariamente”).
- [x] Validar se existe polling/manual refresh adicional (ex.: `queryClient.invalidateQueries`) e garantir que não rodem quando off.

### 5.8 Documentação e comunicação
- [x] Atualizar `docs/credits.md` com a seção “Modo hibernação” descrevendo flag, comportamento esperado e como reativar.
- [x] Adicionar notas em `docs/backend.md` e `docs/frontend.md` (seções de IA/credit hooks) referenciando o flag.
- [x] Registrar mudança em `CHANGELOG.md` e em qualquer runbook relevante (`docs/testing/admin-qa-guide.md`, `docs/testing/clerk-webhook-scenarios.md`). *(Runbooks permanecem válidos; registrar flag em próxima revisão de QA.)*

### 5.9 Testes e QA
- [x] Atualizar/Adicionar testes unitários (`tests/unit/credits/*.test.ts`) cobrindo flag desativado.
- [x] Ajustar testes de integração (`tests/integration/api/webhooks-clerk-route.test.ts`, `tests/e2e` se houver) para verificar early-return sem side effects.
- [ ] Validar manualmente:
  - [ ] IA chat/imagem executam com flag off e não fazem writes em `creditBalance`.
  - [ ] UI mostra estado ilimitado e não bloqueia ações.
  - [ ] Webhooks Clerk respondem `200` com log de “credits disabled”.
- [ ] Definir plano de monitoramento (logs CloudWatch/Datadog etc.) para confirmar ausência de writes inesperadas. *(Sugerir criar alerta específico assim que observabilidade estiver configurada.)*

## 6. Dependências e riscos
- **Infra**: necessidade de propagar `CREDITS_ENABLED` (Back + Front). Mitigação: criar valor default `1` e coordenar deploy com atualização de variáveis.
- **Auditoria/financeiro**: relatórios que usam `usageHistory` ficarão congelados. Mitigação: comunicar stakeholders e, se necessário, exportar snapshot antes da hibernação.
- **Consistência de UI**: componentes que assumem números podem quebrar com `null`/`Infinity`. Mitigação: revisar principais views (`/ai-chat`, `/billing`, painéis admin).
- **Sincronização Clerk**: ao reativar, confirmar se há delta de créditos pendente; considerar script de “realinhamento” antes de ligar novamente.

## 7. Sequenciamento sugerido
1. Implementar feature flag e cobrir helpers de créditos.
2. Atualizar endpoints críticos (IA + créditos) e garantir testes unitários passarem.
3. Tratar webhooks/admin e validar que a flag realmente impede writes.
4. Ajustar UI (`useCredits` + componentes) e realizar smoke test manual.
5. Atualizar documentação/testes finais; preparar checklist de reversão.
6. Deploy com flag `CREDITS_ENABLED=0` em estágio → produção após validação.

## 8. Plano de reversão
- Flag `CREDITS_ENABLED=1` reativa todo o fluxo imediatamente.
- Executar `refreshUserCredits` para planos ativos se houver período longo desligado (avaliar script manual) para normalizar saldos.
- Monitorar logs de erro após reativação (`InsufficientCreditsError`, writes em `creditBalance`).

## 9. Referências úteis
- Arquitetura e integrações: `docs/architecture.md`, `docs/backend.md`.
- Guia de créditos atual: `docs/credits.md`.
- Hook de front-end: `src/hooks/use-credits.ts`.
- Testes relevantes: `tests/unit/credits/`, `tests/integration/api/webhooks-clerk-route.test.ts`.
- Webhooks Clerk: `src/app/api/webhooks/clerk/route.ts`.
- Custos/configurações: `src/lib/credits/feature-config.ts`, `src/lib/credits/settings.ts`.

> Observação: manter schema e dados existentes garante retorno rápido. Não remover jobs nem índices; apenas evitar que código execute operações enquanto o modo “sleep” estiver ativo.
