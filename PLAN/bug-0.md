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
- [ ] Para cada rota em `/src/app/api/**` com manipulações de arrays/objetos Prisma:
  - Reaproveitar tipos exportados do wrapper (`PerfilUsuario`, `Prisma.<Model>GetPayload` etc.).
  - Substituir `as any` por tipos específicos, preferindo utilitários Prisma (`Prisma.<Model>UpdateArgs['data']`) quando reduz complexidade.
- [ ] Garantir que `withApiLogging` continua aceitando handlers adaptados e que `adaptRouteWithParams` é usado de forma consistente (params sempre acessados via destructuring tipado).

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
