# Performance Remediation – Dashboards & Trilha

**Data:** 22/10/2025  
**Responsáveis:** Frontend Performance (owner), Backend (support)  
**Status:** Planejado

## Situação
As auditorias Lighthouse/INP (pré-sign-off Fase 7) apontaram scores abaixo de 90 em:
- `/dashboard/pastor` – LCP e INP elevados (cards pesados, gráficos em carga inicial).  
- `/trilha` – LCP alto (renderização de listas complexas + imagens), best-practices com warnings de assets sem `width/height`.

## Ações Planejadas
1. **LCP (Largest Contentful Paint)**
   - Implementar `next/image` com `priority` apenas nos heros críticos; lazy load para demais imagens.  
   - Dividir dashboards em componentes `Suspense`/lazy (`React.lazy`) carregando gráficos após dados principais.  
   - Reduzir payload inicial das rotas (`select` no Prisma, cache de métricas).
2. **INP (Interaction to Next Paint)**
   - Debounce em filtros/pesquisas (`/dashboard` e `/trilha`).  
   - Otimizar tabelas com virtualization (TanStack Table + react-window) para listas grandes.  
   - Garantir que chamadas de API disparadas após interações usem `useTransition` ou carregadores diferenciados.
3. **Best Practices**
   - Padronizar `rel="preload"` para fontes locais.  
   - Garantir `width`/`height` em imagens/iframes; revisar `console` para warnings.  
   - Auditar importações de libs pesadas (charts) para tree-shaking.
4. **Medições**
   - Após ajustes, rodar Lighthouse desktop/mobile e registrar métricas (LCP, INP, CLS, TTFB) em `docs/testing/evidence/2025-10-22-phase7/lighthouse/notes.md`.  
   - Repetir `npm run test:e2e` para validar regressões funcionais.

## Entregáveis
- PR(s) com otimizações e benchmarks antes/depois.  
- Atualização do plano fase 7 com novos scores ≥ 90.  
- Checklist de QA assinado confirmando ausência de regressões visuais/UX.

## Referências
- `PLAN/PLANO_MIGRACAO.md` – Fase 7 (Testes & Qualidade).  
- `docs/testing/phase7-qa-checklist.md` – metas de performance.  
- `docs/observability/api-alerts.md` (após criação) para monitorar impacto em latência.  
