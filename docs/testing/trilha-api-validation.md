# Trilha – Checklist de Validação das Rotas

Este guia consolida os contratos e validações das rotas de **Solicitações de Trilha de Crescimento** para facilitar a revisão funcional agendada para 14/10. Use-o como referência rápida durante QA ou code review.

## Referências
- Rotas: `src/app/api/trilhas/[trilhaId]/solicitacoes/route.ts`, `src/app/api/trilhas/solicitacoes/route.ts`, `src/app/api/trilhas/solicitacoes/[id]/route.ts`
- Schemas Zod: definidos inline nos arquivos acima.
- Testes: `tests/integration/api/trilhas-solicitacoes-route.test.ts`
- Documentação pública: `docs/api.md#trilha-de-crescimento`

## POST `/api/trilhas/[trilhaId]/solicitacoes`
| Campo | Obrigatório | Regra | Observações |
| --- | --- | --- | --- |
| `areaSupervisaoId` | Sim | `string` não vazia | Rejeita com `400` se ausente. |
| `motivo` | Sim | `string` 1–500 caracteres | Espacos em branco são removidos (`trim`). |
| `usuarioId` | Não | `string` | Obrigatório apenas quando um pastor cria para terceiro. Discípulo só pode usar o próprio ID. |
| `liderSolicitanteId` | Condicional | `string` não vazia | Autopreenchido para líderes/pastores; necessário para demais perfis. |
| `observacoesLider` | Não | `string` ≤ 500 | Normalizado para `null` quando vazio. |

**Perfis autorizados:** Discípulo (para si), Líder de célula, Supervisor, Pastor.  
**Efeitos:** Cria registro `SolicitacaoAvancoTrilha` com `status=PENDENTE` e `dataSolicitacao=now`.

## GET `/api/trilhas/solicitacoes`
| Query | Tipo | Normalização | Observações |
| --- | --- | --- | --- |
| `scope` | `mine\|lider\|pendentes\|all` | `enum` opcional | Ajusta filtros por perfil (discípulo → `usuarioId`, líder → `liderSolicitanteId`). |
| `status` | `string` | Uppercase → `StatusSolicitacao` | Falha com `400` se valor desconhecido. |
| `take` | `string` numérica | `1–100` | Define paginação manual (`hasMore`). |
| `skip` | `string` numérica | `>=0` | Deslocamento dos resultados. |
| `includeUsuario|Trilha|Area|Lider|Supervisor` | `boolean` (`"true"/"false"`) | `true` por padrão para `usuario`, `trilha`, `lider`. |  

**Perfis autorizados:** Discípulo, Líder, Supervisor, Pastor.  
**Resposta:** `{ data: Solicitação[], meta: { count, hasMore } }`.

## PATCH `/api/trilhas/solicitacoes/[id]`
| Campo | Obrigatório | Regra | Observações |
| --- | --- | --- | --- |
| `status` | Não | `StatusSolicitacao` | Ajusta `dataResposta` e `supervisorResponsavelId` (default: usuário autenticado). |
| `observacoesSupervisor` | Não | `string` ≤ 500 | Converte vazio em `null`. |
| `observacoesLider` | Não | `string` ≤ 500 | Converte vazio em `null`. |
| `motivo` | Não | `string` ≤ 500 | Permite reescrever justificativa. |
| `areaSupervisaoId` | Não | `string` não vazia | Atualiza área da solicitação. |
| `supervisorResponsavelId` | Condicional | `string` não vazia | Permite atribuição manual quando `status` permanece `PENDENTE`. |

**Perfis autorizados:** Supervisor, Pastor.  
**Fluxo esperado:** retorna `404` quando ID inexistente; `400` se payload vazio/inválido.

## Dicas para QA Manual
1. **Discípulo:** tentar abrir solicitação para outro usuário deve retornar `403`.
2. **Supervisor:** aprovar (`status=APROVADA`) precisa preencher `dataResposta` e `supervisorResponsavelId`.
3. **Filtro de pendências:** GET com `scope=pendentes` para supervisor deve retornar apenas `StatusSolicitacao.PENDENTE`.
4. **Paginação:** `take=1&skip=1` deve respeitar `hasMore`.
5. **Área inexistente:** enviar `areaSupervisaoId` inválido deve resultar em erro do Prisma (500) — registrar bug se comportamento diferir.

## Itens para a Revisão de 14/10
- [ ] Confirmar que `docs/api.md` reflete limites e normalização descritos acima.
- [ ] Validar que seeds cobrem pelo menos 1 solicitação pendente, 1 aprovada e 1 rejeitada para smoke test.
- [ ] Avaliar necessidade de respostas com paginação completa (`totalCount`) para dashboards.
- [ ] Decidir se `observacoesLider` deve permitir edição via `PATCH` após aprovação.

