# Sitemap – Célula Connect (Out/2025)

Inventário de páginas e agrupamentos do App Router após a migração para o Starter Kit v2. Fontes principais: `src/app` e `src/app/admin`.

## 1. Estrutura Atual

```
/
├── (public)/
│   ├── page.tsx                → Landing
│   ├── layout.tsx              → PublicLayout
│   ├── sign-in/[[...sign-in]]  → Login (Clerk)
│   └── sign-up/[[...sign-up]]  → Cadastro (Clerk)
├── (protected)/
│   ├── layout.tsx              → Auth + subscription guard
│   ├── dashboard/page.tsx      → Dashboard padrão
│   ├── dashboard/discipulo/    → Dashboard Discípulo
│   ├── dashboard/lider/        → Dashboard Líder
│   ├── dashboard/supervisor/   → Dashboard Supervisor
│   ├── dashboard/pastor/       → Dashboard Pastor
│   ├── ai-chat/page.tsx        → Chat IA
│   └── billing/page.tsx        → Cobrança e créditos
├── subscribe/page.tsx          → Seleção inicial de plano
└── admin/
    ├── layout.tsx              → Admin guard
    ├── page.tsx                → Painel executivo
    ├── users/page.tsx
    ├── credits/page.tsx
    ├── storage/page.tsx
    ├── usage/page.tsx
    └── settings/
        ├── page.tsx
        ├── features/page.tsx
        └── plans/page.tsx
```

## 2. Resumo por Seção

| Seção | Descrição | Páginas | Observações |
| --- | --- | --- | --- |
| Público | Landing + auth | 3 principais | Conteúdo da landing ainda é o do template. |
| Assinatura | `/subscribe`, `/billing` | 2 | Requer sessão ativa; `/subscribe` acessível sem plano. |
| Protegido | `/dashboard`, `/dashboard/discipulo`, `/dashboard/lider`, `/dashboard/supervisor`, `/dashboard/pastor`, `/ai-chat` | 6 | Gating por assinatura em `layout.tsx`; dashboards por perfil usam APIs de domínio. |
| Administração | Painel, usuários, créditos, storage, usage, settings | 6 + subpáginas | Restringido por `isAdmin`. |

## 3. Conteúdo e Status

- **Landing (`/`)**: apresenta benefícios do template, aguardando copy customizada do Igreja-12.
- **Dashboard (`/dashboard`)**: cartões de status de créditos; agora acompanhado por subpainéis específicos.
- **Dashboard Discípulo (`/dashboard/discipulo`)**: mostra célula vinculada, liderança e próximos encontros (placeholder com dados seed).
- **Dashboard Líder (`/dashboard/lider`)**: destaca metas de membros, visitas e agenda da célula (placeholder com dados seed).
- **Dashboard Supervisor (`/dashboard/supervisor`)**: agrega métricas de células supervisionadas, membros e presença (placeholder seed).
- **Dashboard Pastor (`/dashboard/pastor`)**: visão executiva com contagem de igrejas, células, membros e liderança (placeholder seed).
- **AI Chat (`/ai-chat`)**: funcional, com seleção de provedores e geração de imagens.
- **Billing (`/billing`)**: abas de planos e status dos créditos, integradas a `PlanGrid` e `CreditStatus`.
- **Admin**: completo para operações de créditos, usuários, storage, usage e configurações de planos/features.

## 4. Backlog de Páginas

| Página | Escopo | Prioridade |
| --- | --- | --- |
| `/admin/igrejas` | CRUD, aprovação e onboarding de igrejas. | Alta. |
| `/admin/devocionais` | CMS leve para devocionais/avisos. | Média. |
| `/public/*` | Novas páginas de marketing (features, pricing dedicado). | Baixa (dependente de copy). |
| `/api/igrejas/[id]`, `/api/celulas/[id]` | Operações de update/delete para consolidar módulo. | Alta (próximo sprint). |

## 5. Recomendações

1. **Consistência**: seguir convenção do App Router (grupos) ao criar rotas de perfil.
2. **SEO**: atualizar `src/lib/brand-config.ts` e metadados globais após definir copy final.
3. **Autorização**: reutilizar `PerfilUsuario` para filtrar acesso às novas rotas protegidas.
4. **Documentação**: ao adicionar rotas, atualizar este sitemap e `PROJETO/ROTAS_ORGANIZADAS.md`.

## 6. Referências

- Rotas detalhadas: `PROJETO/ROTAS_ORGANIZADAS.md`
- Fluxos de usuário: `PROJETO/FLUXOGRAMA_USUARIO.md`
- Lógica e módulos: `PROJETO/LOGICA.md`
