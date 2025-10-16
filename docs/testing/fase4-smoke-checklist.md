# Smoke QA – Fase 4 (Backend)

Plano enxuto para o smoke test das entregas de backend da Fase 4. Utilize após concluir Sprint 1 e sempre que novas rotas forem integradas.

## Pré-condições
- Seeds atualizadas (`npm run db:seed`).
- Feature flag `ENABLE_DOMAIN_MUTATIONS` ativada (salvo roteiros específicos que exigem bloqueio).
- Usuários de teste com perfis: Discípulo, Líder, Supervisor, Pastor.
- `CLERK_WEBHOOK_SECRET` configurado para simular eventos.

## Checklist Essencial
1. **Solicitações de Trilha**
   - Criar solicitação como líder (POST).
   - Aprovar como supervisor (PATCH).
   - Listar pendências com filtros (`scope=pendentes`, `take=1`).
2. **Webhooks Clerk**
   - `subscription.updated` → créditos atualizados para plano (`refreshUserCredits`).
   - `invoice.payment_succeeded` → créditos adicionais (`addUserCredits`).
3. **Feature Flags**
   - Desativar `ENABLE_DOMAIN_MUTATIONS` e confirmar bloqueio 423 nas mutações.
   - Reativar e validar fluxo normal das rotas.
4. **Documentação**
   - Conferir `docs/api.md` para garantir parâmetros e payloads alinhados.
   - Registrar resumo das execuções em `PLAN/ACOMPANHAMENTO_MIGRACAO.md`.

## Evidências
- Logs ou prints dos requests/responses.
- Resultado dos testes automatizados (`npm run test -- trilhas-solicitacoes-route --runInBand`, `npm run test -- webhooks-clerk-route --runInBand`).
- Captura de `docs/testing/clerk-webhook-scenarios.md` preenchida com horários executados.

## Próximos Incrementos
- Adicionar cenários para `subscriptionItem.*` quando front consumir esses metadados.
- Integrar smoke aos pipelines (GitHub Actions) com execução diária.
