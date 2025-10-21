# Acessibilidade – Follow-up (Contraste & Landmarks)

**Data:** 22/10/2025  
**Responsáveis:** Frontend UI (owner), QA (review)  
**Status:** Aberto

## Contexto
Durante a execução do checklist da Fase 7, as varreduras com axe/Lighthouse identificaram dois blockers WCAG AA:

1. **Baixo contraste** em elementos de texto/CTA (particularmente na landing pública e dashboards com fundo em gradiente + texto claro).
2. **Hierarquia de landmarks** inconsistente (elementos `<main>` aninhados ou ausentes, múltiplos `<header>` sem `aria-label`, dificultando navegação assistiva).

## Plano de Correção
1. **Mapear componentes afetados**  
   - Landing `/` (hero CTA, cards de features).  
   - `/dashboard/pastor` (cards de métricas com texto secundário).  
   - Revisar tokens de cor em `src/styles/tokens` (ou tema Tailwind) para garantir contraste ≥ 4.5:1.
2. **Ajustar contraste**  
   - Atualizar classes/util classes Tailwind (`text-slate-200`, `text-muted-foreground`, etc.) para versões com contraste suficiente.  
   - Regerar screenshots/estórias no Storybook se necessário.
3. **Reorganizar landmarks**  
   - Garantir um `<main>` por página, com cabeçalhos/sidebars marcados como `<aside>`/`<nav>` conforme necessário.  
   - Adicionar `aria-label` claras aos `<header>` internos ou usar `<section>` com `aria-labelledby`.
4. **Retestar**  
   - Rerodar `npx @axe-core/cli` nas rotas: `/`, `/dashboard/pastor`, `/admin`.  
   - Reexecutar checklist manual de teclado/contraste (tabulação, foco visível, verificação DevTools).  
   - Atualizar `docs/testing/evidence/2025-10-22-phase7/acessibilidade/` com novos relatórios e prints.

## Critérios de Aceite
- Score de Acessibilidade ≥ 95 nas rotas auditadas.  
- Nenhum erro de contraste/landmark no relatório axe.  
- Checklist manual de teclado/contraste assinado pelo QA.

## Referências
- `PLAN/ACOMPANHAMENTO_MIGRACAO.md` – seção “Prioridade imediata”.  
- `docs/testing/phase7-qa-checklist.md` – checklist fase 7 (acessibilidade).  
