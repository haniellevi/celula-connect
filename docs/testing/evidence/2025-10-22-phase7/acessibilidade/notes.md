# Acessibilidade — 20/10/2025 13:26 BRT
- `npx @axe-core/cli` reexecutado para `/`, `/dashboard/pastor` e `/admin`; relatórios salvos com timestamp `20251020-132618`.
- Persistem violações `color-contrast`, `landmark-main-is-top-level`, `landmark-no-duplicate-main`, `landmark-unique`, `region` e `page-has-heading-one`.
- Necessário aplicar patches de contraste nos cards/testemunhos e ajustar a hierarquia de landmarks (`main`, `nav`) antes da próxima auditoria.
- Após correções, repetir checklist de teclado/contraste e gerar novos relatórios `axe-*.json`.
