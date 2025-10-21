# Phase 7 – QA, Acessibilidade e Observabilidade

Documento operacional para conduzir a Fase 7 do plano de migração. Consolida responsáveis, prazos, métricas de saída e checklists para as frentes de acessibilidade, performance (Lighthouse) e observabilidade/logging.

## 1. Agenda e Responsáveis

| Frente | Responsável (primário) | Suporte | Deadline | Métrica de Saída |
| ------ | ---------------------- | ------- | -------- | ---------------- |
| Acessibilidade (WCAG AA) | Frontend / UI | QA | 22/10/2025 12:00 BRT | 0 blockers WCAG AA; relatório axe anexado |
| Lighthouse & Web Vitals | Frontend / Perf | QA | 22/10/2025 15:00 BRT | Lighthouse ≥ 90 (Performance, Accessibility, Best Practices, SEO) em `/`, `/dashboard`, `/admin` |
| Observabilidade & Logging | Backend / Infra | QA | 22/10/2025 18:00 BRT | `API_LOGGING=true` validado; logs estruturados coletados; alertas básicos definidos |

> Armazenar evidências em `docs/testing/evidence/2025-10-22-phase7/{acessibilidade,lighthouse,observabilidade}` (prints, CSV, trace, notas).

## 2. Checklist – Acessibilidade

1. **Preparação**
   - Rodar `npm run dev:e2e` para manter bypass de autenticação ativo (`E2E_AUTH_BYPASS=1`).
   - Instalar extensão axe DevTools ou utilizar `npx @axe-core/cli https://127.0.0.1:3100/rota`.
2. **Varredura automatizada**
   - `/` (landing pública), `/dashboard/pastor`, `/admin`.
   - Exportar relatório axe (JSON/HTML). Nome de arquivo sugerido: `axe-{rota}-{timestamp}.json`.
3. **Checks manuais**
   - Navegação por teclado (Tab/Shift+Tab/Enter/Espaço) sem armadilhas.
   - Foco visível em todos os CTAs e elementos interativos.
   - Verificar contraste utilizando o painel “Accessibility” do DevTools (mínimo 4.5:1 para texto normal).
4. **WCAG AA blockers**
   - Classificar achados em blocker/major/minor.
   - Blockers devem ser tratados antes da conclusão da fase 7 ou registrados como risco com plano de mitigação (ver [Acessibilidade – Follow-up](../issues/accessibility-contrast-landmarks.md)).

## 3. Checklist – Lighthouse & Web Vitals

1. **Configuração**
   - `npm run dev:e2e` ativo.
   - Lighthouse em modo Desktop e Mobile (Chrome DevTools > Lighthouse).
2. **Rotas alvo**
   - `/` (pública), `/dashboard/pastor`, `/admin`, `/trilha`.
3. **Metas**
   - Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90.
   - TTFB < 600 ms (modo local), Largest Contentful Paint < 2.5 s, CLS < 0.1.
4. **Evidências**
   - Exportar relatórios (JSON + PDF). Nome: `lighthouse-{rota}-{mobile|desktop}.json`.
   - Registrar observações em `docs/testing/evidence/2025-10-22-phase7/lighthouse/notes.md`.
5. **Ajustes**
   - Se alguma métrica ficar < 90, abrir itens no backlog com causa raiz, impacto e correção planejada (ver [Performance Remediation – Dashboards & Trilha](../performance/dashboards-trilha-remediation.md)).

## 4. Checklist – Observabilidade & Logging

1. **Pré-requisitos**
   - Definir em `.env.local`:\
     `API_LOGGING=true`\
     `API_LOG_LEVEL=info`\
     `API_LOG_MIN_STATUS=400`\
     `API_LOG_SUCCESS_SAMPLE_RATE=0.1`
2. **Validação de logs**
   - Rodar `npm run test:e2e` e `npm run test:integration` com as variáveis acima.
   - Garantir que logs de sucesso sejam amostrados (10%) e erros ≥ 400 sejam sempre emitidos.
   - Verificar formato JSON (campos `method`, `path`, `status`, `durationMs`, `userId` quando disponível).
3. **Alertas básicos**
   - Definir scripts (ou task em monitoramento externo) para alertar quando:
     - Taxa de erro HTTP ≥ 2% por 5 minutos.
     - Tempo médio de resposta > 1.5 s em rotas críticas (`/api/credits`, `/api/trilhas`).
   - Documentar no caderno de observabilidade (linkar ferramenta: Sentry, Datadog, Logtail etc. conforme ambiente).
4. **Auditoria final**
   - Registrar evidências dos logs e alertas em `docs/testing/evidence/2025-10-22-phase7/observabilidade/log-samples.ndjson`.
   - Confirmar que `withApiLogging` está aplicado nas rotas críticas (consultar `src/app/api/**` caso surjam lacunas).

## 5. Entregáveis da Fase 7

- Relatórios axe + Lighthouse anexados ao PR de migração.
- Planilha ou doc com métricas finais (scores, tempos, erros por rota).
- Ticket(s) no backlog para qualquer unidade que não atinja as metas estabelecidas, com plano de correção.
- Atualização do acompanhamento (`PLAN/ACOMPANHAMENTO_MIGRACAO.md`) marcando checklist concluído.

## 6. Referências

- `PLAN/PLANO_MIGRACAO.md` – seção **Fase 7: Testes e Qualidade**.
- `docs/testing/admin-qa-guide.md` – fluxo administrativo e seeds.
- `agents/qa-agent.md` – playbook geral de QA.
- `docs/development-guidelines.md` – métricas de performance e acessibilidade recomendadas.
- `docs/issues/accessibility-contrast-landmarks.md` – ticket de follow-up para contraste/landmarks.
- `docs/performance/dashboards-trilha-remediation.md` – plano de otimização LCP/INP.
- `docs/observability/api-alerts.md` – alertas de erro/latência para `/api/credits` e `/api/trilhas`.
