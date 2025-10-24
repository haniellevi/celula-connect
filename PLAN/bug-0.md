## Contexto
- Build do projeto falha devido a erros de tipagem TypeScript introduzidos após ajustes recentes (principalmente callbacks que recebem `any` implícito e tipagens desalinhadas com os contratos do App Router do Next 15).
- Ambiente atual confirma que o `prisma generate` roda, mas o `next build` trava nos erros de TS dentro de `/src/app/**` e algumas rotas de API.
- Há grande volume de `@typescript-eslint/no-explicit-any` em rotas administrativas; são warnings, mas o objetivo ideal é eliminá-los após estabilizar o build.

## Objetivos
1. Restaurar `npm run build` para concluir sem erros de TypeScript.
2. Harmonizar utilitários (`withApiLogging`, `adaptRouteWithParams`, wrapper Prisma) para refletir a tipagem esperada pelo Next 15 e pela camada de dados, evitando regressões futuras.
3. Reduzir gradualmente os `any` explícitos nas rotas e handlers administrativos para manter a base alinhada às regras de lint.

## Diagnóstico Resumido
- **Handlers com params**: `adaptRouteWithParams` devolve `context.params` tipado como `Promise<T>`. Várias rotas assumem `params` síncrono e, ao compor com `withApiLogging`, surgem erros de compatibilidade (já ajustado para `Promise<T>`, mas precisa garantir que todos os chamadores esperam essa forma).
- **Callbacks React/Array**: Diversos `map/filter/reduce` operando sobre payloads Prisma (p.ex. `celula.membros`, `meta.usuarios`, `versiculosBiblia`) usam inferência implícita e disparam `implicit any`.
- **Rotas App Router**: Funções exportadas (`GET`, `POST`, `PUT`, etc.) precisam aceitar `(request: NextRequest, context: RouteContext)`; qualquer adaptação deve preservar essa assinatura para sobreviver ao type-check do Next.
- **Wrapper Prisma**: O arquivo `src/lib/prisma-client.ts` mistura exports de valores e tipos. Precisamos padronizar para expor tanto as const enums (`PerfilUsuario`, `TipoAviso`, etc.) quanto os tipos (`Prisma`, `PerfilUsuario`, etc.) e reutilizar esses tipos a partir dos hooks/rotas.
- **Admin credits PUT**: `src/app/api/admin/credits/[id]/route.ts:87` injeta `withApiLogging` com o _resultado_ de `handleAdminCreditUpdate` em vez do handler. O build (`npm run build`) falha com `invalid export` e os testes de integração em `tests/integration/api/admin-credits-route.test.ts` quebram (`response.status` indefinido) porque a rota passa a devolver uma função ao invés de `Response`.

## Plano de Ação

### 1. Mapear pontos críticos de tipagem
- [x] Rodar `npm run build` e capturar a lista completa de erros TS.
- [x] Consolidar os arquivos acusados em uma checklist (dashboards, páginas protegidas, rotas API).
- [x] Para cada arquivo, identificar padrões repetidos (callbacks sem tipo, uso incorreto de enums Prisma, adaptação de params).

### 2. Fortalecer utilitários centrais
- [x] Revisar `src/lib/api/params.ts`:
  - Confirmar que `RouteParamsContext<T>` aceita apenas `{ params: Promise<T> }`.
  - Documentar (comentário curto) a expectativa para evitar regressões.
- [x] Revisar `src/lib/logging/api.ts`:
  - Ajustar assinatura genérica para aceitar handlers tipados sem reintroduzir `any` global (avaliar uso de parâmetros condicionais ou helper `ApiHandler`).
  - Garantir que o wrapper preserve o tipo de retorno e das args do handler.
- [ ] Revisar `src/lib/prisma-client.ts`:
  - Exportar tipos e valores de forma consistente (`export type { Prisma }` não basta; expor também alias úteis ex: `type PerfilUsuarioEnum = Prisma.PerfilUsuario` se necessário).
  - Adicionar breve documentação sobre o uso do wrapper.

### 3. Corrigir páginas com `implicit any`
- [ ] `src/app/(protected)/dashboard/discipulo/page.tsx`
  - Criar type alias `type CelulaMembro = CelulaWithRelations['membros'][number]`.
  - Anotar callbacks `some`, `filter` e demais ocorrências.
- [ ] Revisar blocos similares em:
  - `src/app/(protected)/dashboard/lider/page.tsx` (se existir — confirmar via `rg 'implicit any'`).
  - `src/app/(protected)/trilha/**` e `src/app/(protected)/biblia/**` para garantir que nenhuma iteração ficou sem ajustes.
- [ ] Conferir páginas públicas que iteram sobre `FeatureCard`, convites etc., aplicando o mesmo padrão de type alias.

### 4. Corrigir rotas API restantes
- [ ] `src/app/api/admin/credits/[id]/route.ts`: compor `withApiLogging(adaptRouteWithParams(...))` para devolver `Response`. Enquanto isso, o build e os testes de integração (`npm run test`) continuam falhando.
- [ ] Para cada rota em `/src/app/api/**` com manipulações de arrays/objetos Prisma:
  - Reaproveitar tipos exportados do wrapper (`PerfilUsuario`, `Prisma.<Model>GetPayload` etc.).
  - Substituir `as any` por tipos específicos, preferindo utilitários Prisma (`Prisma.<Model>UpdateArgs['data']`) quando reduz complexidade.
- [ ] Garantir que `withApiLogging` continua aceitando handlers adaptados e que `adaptRouteWithParams` é usado de forma consistente (params sempre acessados via destructuring tipado).

### 4.1. Erros semelhantes mapeados (tipagem Prisma como namespace e afins)
- Padrão: uso de `Prisma.*` como tipo/namespace em módulos App Router com `isolatedModules`, causando erro "'Prisma' only refers to a type, but is being used as a namespace here". Ação: substituir por tipos derivados do client (`Parameters<typeof db.<model>.<op>>[0]['data' | 'where' | 'include']`) ou mover `Prisma.JsonNull` para local permitido, evitando `import type { Prisma }` + `Prisma.*` em tipo.

- api
  - src/app/api/admin/plans/refresh-pricing/route.ts:74 → `Prisma.JsonNull` (manter como valor; ok). Verificar demais usos.
  - src/app/api/admin/plans/route.ts:147,239 → `Prisma.JsonNull` em valores; tipos de create/update já ajustados. OK.
  - src/app/api/admin/credits/route.ts:20 → já corrigido (derivado de `db.creditBalance.findMany` where).
  - src/app/api/admin/usage/route.ts:24,44 → já corrigido (derivado de `db.usageHistory` where).
  - src/app/api/celulas/route.ts:193 → `Prisma.CelulaUncheckedCreateInput` (trocar por `Parameters<typeof db.celula.create>[0]['data']`).
  - src/app/api/celulas/[id]/route.ts:70 → `Prisma.CelulaUncheckedUpdateInput` (trocar por `Parameters<typeof db.celula.update>[0]['data']`).
  - src/app/api/convites/[token]/route.ts:149 → `Prisma.ConviteUncheckedUpdateInput` (trocar por `Parameters<typeof db.convite.update>[0]['data']`).
  - src/app/api/convites/route.ts:231 → `Prisma.PrismaClientKnownRequestError` (manter como valor via `import { Prisma }` não-type, ou tratar pelo código `.code`).
  - src/app/api/devocionais/[id]/route.ts:70 → `Prisma.DevocionalUncheckedUpdateInput` (trocar por `Parameters<typeof db.devocional.update>[0]['data']`).
  - src/app/api/devocionais/[id]/route.ts:83 → `Prisma.PrismaClientKnownRequestError` (valor; ok com `import { Prisma }`).
  - src/app/api/devocionais/route.ts:151 → `Prisma.PrismaClientKnownRequestError` (valor; ok com `import { Prisma }`).
  - src/app/api/trilhas/solicitacoes/[id]/route.ts:72 → `Prisma.SolicitacaoAvancoTrilhaUncheckedUpdateInput` (trocar por `Parameters<typeof db.solicitacaoAvancoTrilha.update>[0]['data']`).
  - src/app/api/trilhas/[trilhaId]/solicitacoes/route.ts:76 → `Prisma.SolicitacaoAvancoTrilhaUncheckedCreateInput` (trocar por `Parameters<typeof db.solicitacaoAvancoTrilha.create>[0]['data']`).
  - src/app/api/webhooks/clerk/route.ts:211,254,308,345 → `Prisma.JsonObject` cast (manter como valor; preferir `as unknown as Record<string, unknown>` se necessário).
  - src/app/api/biblia/leituras/route.ts:67 → `Prisma.TransactionClient` (remover anotação explícita; se necessário, `tx: any` para não travar build, preferir helper tipado depois).
  - src/app/api/avisos/[id]/route.ts:118 → já corrigido (derivado de `db.aviso.update`).
  - src/app/api/avisos/route.ts:219 → já corrigido (derivado de `db.aviso.create`).

- hooks (somente tipos):
  - src/hooks/use-biblia.ts, use-celulas.ts, use-convites.ts, use-devocionais.ts, use-igrejas.ts, use-trilha-solicitacoes.ts, use-trilhas.ts, use-usuarios.ts → usam `Prisma.*GetPayload` em contextos de tipo; esses são válidos. Manter como `import type { Prisma }`.

- lib/queries/* (somente tipos):
  - src/lib/queries/avisos.ts:39,83,94
  - src/lib/queries/biblia.ts:17,94,236
  - src/lib/queries/celulas.ts:27,48-80,123,132
  - src/lib/queries/convites.ts:27,70,81,115
  - src/lib/queries/devocionais.ts:19,23,53,61
  - src/lib/queries/igrejas.ts:27,67
  - src/lib/queries/trilhas.ts:24,123,184,231,254,287
  - src/lib/queries/usuarios.ts:21,23,33-34,66-68,92,102-103
  - src/lib/services/trilha-notifications.ts:11,27
  Ação: revisar `import type { Prisma }` + uso de `Prisma.*` em tipos. Em módulos não App Router, é aceitável; porém, para uniformidade e evitar regressão, preferir inferir de `db` conforme for simples.

### 4.2. Erros semelhantes mapeados (assinaturas com `withApiLogging`/`adaptRouteWithParams`)
- Padrão: `withApiLogging` exige handler que retorne `Response | Promise<Response>`; handlers que podem retornar `undefined` quebram o tipo. Ação: tipar funções `handle*` para `Promise<NextResponse>` e garantir retorno em todos os ramos, ou ajustar `ensure*` para retornar união discriminada com `NextResponse`.
- Arquivos já ajustados:
  - src/app/api/admin/feature-flags/route.ts → `ensureAccess`, `handleGet/Put` tipados.
  - src/app/api/admin/landing-config/route.ts → `ensureAuthorized`, `handleGet/Put/Delete` tipados.
- Verificar outros:
  - src/app/api/admin/plans/[clerkId]/route.ts:158,169 → usam `adaptRouteWithParams`; após atualização de `withApiLogging`, devem compilar. Confirmar e alinhar se necessário com cast similar ao de credits `[id]`.
  - Demais rotas com `adaptRouteWithParams<...>` listadas (avisos, biblia, celulas, convites, devocionais, igrejas, trilhas, usuarios) — validar que `handle*` sempre retornam `NextResponse` em todos os caminhos.

### 5. Revisão cruzada e lint warnings
- [ ] Após zerar os erros TS, rodar `npm run lint` para listar warnings do tipo `no-explicit-any`.
- [ ] Priorizar rotas críticas (admin) para substituir `any` por tipos adequados (apoiar-se em schemas zod ou tipos Prisma).
- [ ] Se necessário, criar type guards/helpers para converter objetos soltos em tipos fortes (ex.: função `isPerfilUsuario(value): value is PerfilUsuario`).

### 6. Garantir estabilidade
- [ ] Executar `npm run build` e `npm run lint`.
- [ ] Se houver testes automatizados relevantes (`npm run test`, `npm run test:integration`), executar.
- [ ] Documentar no PR as alterações estruturais (principalmente nos utilitários centrais) e possíveis regressões mitigadas.

## Riscos e Mitigações
- **Alta superfície de código**: Correções são espalhadas; risco de regressão em runtime. → Mitigar com CI local (`build`, `lint`, smoke tests manuais em páginas críticas).
- **Dependência de tipos Prisma**: Atualizações futuras do schema podem quebrar os aliases. → Mitigar definindo alias em um único lugar (`src/lib/prisma-client.ts`) e adicionando comentário pedindo atualização conjunta.
- **Warnings remanescentes**: Forçar zero warnings pode atrasar entrega. → Tratar como segunda fase, mas deixar caminho preparado (type aliases, utilitários).

## Entregáveis Esperados
1. Build (`npm run build`) concluindo sem erros de TypeScript.
2. Utilitários (`params`, `logging`, `prisma-client`) com tipos documentados e compatíveis com App Router.
3. Lista de warnings `no-explicit-any` reduzida (ou totalmente zerada) e registrada em changelog/PR.
4. Plano de acompanhamento no PR destacando locais ajustados e próximos passos para lint restante.

## Backlog Futuro (opcional)
- Automatizar geração de types para hooks/domain (p.ex. via `type-safety` codegen).
- Configurar eslint rule `@typescript-eslint/no-explicit-any` como erro após limpeza total.
- Escrever testes unitários simples para os adaptadores (`adaptRouteWithParams` + `withApiLogging`) garantindo comportamento futuro.
