# Observabilidade & Logging — 22/10/2025 11:05 BRT
- Integração (`npm run test:integration`) executada com `API_LOGGING=true`, `API_LOG_LEVEL=info`, `API_LOG_MIN_STATUS=400`, `API_LOG_SUCCESS_SAMPLE_RATE=0.1`. Output: `logs-integration.ndjson`.
- Tentativa de rodar E2E no sandbox ainda falha (`Process from config.webServer exited early`) por restrição de bind em 127.0.0.1:3100; repetir em ambiente local e anexar `logs-e2e.ndjson`.
- Alertas definidos em `docs/observability/api-alerts.md` (erros ≥2% e latência >1.5s para `/api/credits` e `/api/trilhas`) aguardam configuração no provedor.
- Após configurar os alertas, anexar screenshot/export do monitor neste diretório e atualizar o checklist fase 7.
