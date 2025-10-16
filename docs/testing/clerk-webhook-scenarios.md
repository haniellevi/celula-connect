# Clerk Webhook – Exercícios Locais

Este guia descreve como validar manualmente os eventos principais do webhook `/api/webhooks/clerk` sem depender de ambiente externo. Use-o como checklist para a sessão de testes planejada para 14/10 (tarde).

## Pré-requisitos
- `CLERK_WEBHOOK_SECRET` configurado em `.env.local` (valor fictício, ex.: `whsec_test`).
- Servidor rodando (`npm run dev`) ou rota executada via `npx tsx`/`jest`.
- `npm run test -- webhooks-clerk-route --runInBand` garante baseline automatizado.

## 1. Assinatura ativa (`subscription.updated`)
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: evt_local_1" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test" \
  -d '{
    "type": "subscription.updated",
    "data": {
      "id": "sub_local_123",
      "user_id": "user_local_123",
      "status": "active",
      "plan_id": "cplan_pro"
    }
  }'
```
1. Mockar verificação Svix (adapte `src/app/api/webhooks/clerk/route.ts` ou use `tests/integration/api/webhooks-clerk-route.test.ts`).
2. Esperar chamada `refreshUserCredits("user_local_123", <créditos do plano>)`.
3. Registrar log da execução (`console` ou Jest).

## 2. Compra pontual (`invoice.payment_succeeded`)
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: evt_local_2" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test" \
  -d '{
    "type": "invoice.payment_succeeded",
    "data": {
      "customer_id": "user_local_987",
      "lines": [
        { "price_id": "price_small_pack" }
      ]
    }
  }'
```
1. Certifique-se de que `CREDIT_PACK_PRICE_TO_CREDITS` contenha `price_small_pack`.
2. Verificar incremento com `addUserCredits("user_local_987", 100)`.
3. Em ambiente real, confirmar saldo via `/api/credits/usage` ou Prisma Studio.

## 3. Assinatura cancelada (`subscription.deleted`)
```bash
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: evt_local_3" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: test" \
  -d '{
    "type": "subscription.deleted",
    "data": {
      "user_id": "user_local_555",
      "plan_id": "cplan_pro"
    }
  }'
```
1. Esperar `refreshUserCredits("user_local_555", 0)`.
2. Confirmar persistência do evento em `subscriptionEvent`.

## Evidências Recomendadas
- Capturas de tela do console/terminal com os logs de cada evento.
- JSON exportado de `Prisma Studio` mostrando `creditBalance` atualizado.
- Anotação em `PLAN/ACOMPANHAMENTO_MIGRACAO.md` indicando horário de execução.

## Observações
- Em ambientes sem Svix real, substitua a verificação do webhook por stub (ver testes integrados).
- Para auditoria, considere registrar o `svix-id` recebido no banco ou logging stack (`withApiLogging` já adiciona metadados).
- Os eventos listados são obrigatórios para o smoke test da Fase 4; demais eventos (`subscriptionItem.*`, `invoice.payment_failed`) podem ser verificados oportunamente.
