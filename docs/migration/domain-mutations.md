# Controle de Mutação de Domínio

Este documento resume como o repositório utiliza a feature flag `ENABLE_DOMAIN_MUTATIONS` para proteger atualizações sensíveis durante a migração.

## Endpoints afetados
- `PUT/DELETE /api/igrejas/[id]`
- `PUT /api/celulas/[id]`
- `PATCH /api/usuarios/[id]`

Quando a flag estiver desligada (`false`), esses endpoints retornam `423 Locked` com a mensagem “Mutação temporariamente desabilitada”.

## Interface
- Admin → Configurações → Feature Flags: painel onde apenas pastores podem ativar/desativar a flag.
- Dashboards (Líder/Supervisor) e a sidebar exibem um aviso visual quando a flag está desligada.

## Uso recomendado
1. Antes de iniciar QA ou migração de dados sensível, desligue a flag para impedir alterações enquanto o pipeline roda.
2. Após concluir a importação/validação, reative a flag para que mutações voltem a funcionar normalmente.
3. Sempre registre a mudança no acompanhamento (`PLAN/ACOMPANHAMENTO_MIGRACAO.md`) para rastreabilidade.
4. O front exibe alertas em Admin Settings, SideBar, TopBar e dashboards (Pastor/Líder/Supervisor) informando quando a flag estiver desligada; use-os como feedback rápido durante QA.
5. Ao desligar/religar a flag em ambientes de teste, capture screenshots dos avisos para anexar ao acompanhamento (`PLAN/ACOMPANHAMENTO_MIGRACAO.md`) e facilitar o review do time de produto/QA.
