# Alertas de API – Créditos & Trilhas

**Objetivo:** habilitar monitoramento automático para os endpoints críticos `/api/credits/*` e `/api/trilhas/*`, cobrindo taxa de erro e latência conforme definido no checklist da Fase 7.

## 1. Variáveis de Log
Certifique-se de rodar o backend com:
```bash
API_LOGGING=true
API_LOG_LEVEL=info
API_LOG_MIN_STATUS=400
API_LOG_SUCCESS_SAMPLE_RATE=0.1
```
Isso garante que `withApiLogging` produza logs estruturados com os campos `method`, `path`, `status`, `durationMs`, `traceId`, `userId` (quando disponível).

## 2. Coleta
1. **Local/dev**: direcione stdout para um collector (ex.: Vector, Fluent Bit).  
2. **Produção**: encaminhe os logs para o provedor escolhido (Datadog, New Relic, Logflare, etc.).  
   - Formato esperado: JSON line por requisição.

## 3. Métricas Derivadas
- **Taxa de erro**: `sum(status >= 500 or status == 429)` / `total requests` em janela de 5 min.  
- **Latência média**: `avg(durationMs)` por rota (`/api/credits`, `/api/trilhas`).  
- **P95/P99**: opcional para alertas avançados.

## 4. Alertas Sugeridos
| Monitor | Condição | Ação |
| ------- | -------- | ---- |
| `CC_API_CREDITS_ERROR_RATE` | erro ≥ 2% por 5 min | Pager / Slack |
| `CC_API_CREDITS_LATENCY` | avg `durationMs` > 1500 ms por 5 min | Slack |
| `CC_API_TRILHAS_ERROR_RATE` | erro ≥ 2% por 5 min | Pager / Slack |
| `CC_API_TRILHAS_LATENCY` | avg `durationMs` > 1500 ms por 5 min | Slack |

### Exemplo Datadog
```text
avg(last_5m):100 * ( sum:http.api.credit*.error{env:prod} / sum:http.api.credit*.count{env:prod} ) > 2
```
```text
avg(last_5m):avg:http.api.trilhas.duration_ms{env:prod} > 1500
```

### Exemplo Prometheus/Alertmanager
```yaml
- alert: CC_API_Credits_ErrorRate
  expr: (sum(rate(app_request_total{route=~"/api/credits.*",status=~"5..|429"}[5m])) / sum(rate(app_request_total{route=~"/api/credits.*"}[5m]))) * 100 > 2
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Erro elevado em /api/credits"
    description: "Taxa de erro acima de 2% por 5 minutos."

- alert: CC_API_Trilhas_Latency
  expr: avg_over_time(app_request_duration_ms_sum{route=~"/api/trilhas.*"}[5m]) / avg_over_time(app_request_duration_ms_count{route=~"/api/trilhas.*"}[5m]) > 1500
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Latência alta em /api/trilhas"
    description: "Tempo médio acima de 1.5s nos últimos 5 minutos."
```

## 5. Integração com `docs/testing/phase7-qa-checklist.md`
- Marcar como concluído quando:  
  1. Os alertas estiverem ativos no provedor.  
  2. Logs de teste (`logs-integration.ndjson`, `logs-e2e.ndjson`) forem enviados para validar os thresholds.  
  3. Evidência (screenshot JSON/export do monitor) anexada em `docs/testing/evidence/2025-10-22-phase7/observabilidade/`.

## 6. Próximos Passos
- Automatizar `logs-e2e.ndjson` após desbloqueio do E2E no ambiente local.  
- Adicionar monitors para `/api/admin/*` conforme evolução da Fase 7.  
- Integrar alertas a um canal dedicado (`#cc-alertas`) e validar runbooks.  
