# Fluxograma de Usuário – Célula Connect

Mapeia as jornadas atuais e planejadas após a migração para o Starter Kit v2.

## 1. Visão Geral

- Experiência pública: landing + autenticação (`src/app/(public)/*`).
- Fluxos autenticados: dashboard, IA, billing (`src/app/(protected)/*`).
- Fluxos administrativos: gestão interna (`src/app/admin/*`).
- Fluxos eclesiásticos: previstos para próximas fases (a partir das entidades já modeladas).

## 2. Fluxos Ativos

### 2.1 Visitante → Conta → Assinatura → Dashboard

```
[Landing] 
   │ CTA/sign-up
   ▼
[Clerk Sign-up/Sign-in]
   │ sessão criada
   ▼
{Verificar assinatura}
   ├─ plan ativo? → sim → [Dashboard protegido (/dashboard)]
   └─ não → [Página /subscribe] → escolhe plano → volta ao dashboard
```

- Landing: `src/app/(public)/page.tsx`.
- Assinatura: `src/app/subscribe/page.tsx` consumindo `usePublicPlans`.
- Redirecionamento automático implementado em `src/app/(protected)/layout.tsx`.

### 2.2 Uso de IA (chat/imagem)

```
[Dashboard] → [AI Chat (/ai-chat)]
   │ valida créditos via GET /api/credits/me
   │ canPerformOperation?
   ├─ não → aviso + CTA para /billing
   └─ sim → envia prompt
            │  POST /api/ai/chat → debita créditos (validate + deduct)
            │  streaming de resposta
            ▼
         [Mensagens renderizadas + refresh do saldo]
```

- Hook principal: `src/hooks/use-chat-logic.ts` + `useCredits`.
- Uploads opcionais (Vercel Blob) integrados ao fluxo.

### 2.3 Autoatendimento Financeiro

```
[Dashboard] → [/billing]
   │ Abas: Planos | Status de Créditos
   │ Consulta `/api/public/plans` e `/api/credits/me`
   │ Usuário escolhe upgrade → redireciona para Clerk/checkout (CTA)
   ▼
[Saldo atualizado] (refetch automático via React Query)
```

### 2.4 Operações Administrativas

```
[Usuário admin autenticado] → [/admin]
   │ isAdmin(userId) ?
   ├─ não → redirect /dashboard
   └─ sim → Painel Admin
            │ Hooks:
            │  - useDashboard → métricas
            │  - useAdminUsers → invites, sync com Clerk
            │  - useAdminCredits → ajuste de saldo
            │  - useStorage/useUsage → auditoria
            ▼
         [Ações persistem via rotas /api/admin/**]
```

## 3. Regras de Acesso e Estados

| Estado | Descrição | Acesso liberado |
| --- | --- | --- |
| **Guest** | Visitante não autenticado. | Landing, sign-in, sign-up. |
| **Authenticated sem plano** | Sessão válida porém sem assinatura ativa. | `/subscribe`, `/billing` (para comprar), demais rotas bloqueadas. |
| **Authenticated com plano** | Usuário em dia com assinatura/trial. | `/dashboard`, `/ai-chat`, `/billing`. |
| **Admin** | Usuário Clerk listado em `isAdmin`. | Todos os itens + `/admin/*`. |
| **Perfis eclesiásticos** | `Usuario.perfil` (`DISCIPULO`, `LIDER_CELULA`, etc.). | Persistidos no banco; aguardam UI específica. |

## 4. Fluxos Planejados (Migração Igreja-12)

1. **Onboarding da Igreja**  
   `Pastor` solicita acesso → admin valida → igreja criada (`Igreja`, `Plano`) → convites automáticos para equipe.

2. **Dashboard por Perfil**  
   - Discípulo: trilha de crescimento, devocionais, avisos.  
   - Líder: visão da célula (membros, reuniões, metas).  
   - Supervisor: acompanhamento de múltiplas células.  
   - Pastor: overview da rede, métricas e configurações.

3. **Registro de Reuniões**  
   Líder abre tela da célula → preenche reunião (`ReuniaoCelula`) → atualiza presença → atualiza membros (`MembroCelula`).

4. **Trilha de Crescimento**  
   Discípulo solicita avanço → supervisor aprova → histórico salvo → dashboards atualizados.

5. **Avisos e Devocionais**  
   Admin/pastor agenda comunicados → segmentação por perfil e célula → entrega via app/notificações.

## 5. Pontos de Atenção

- Garantir sincronização de créditos após cada operação (refetch manual via `credits.refresh()`).
- Implementar fallback elegante quando Clerk Billing API estiver indisponível (já existe fallback em `subscription/status` lendo `SubscriptionEvent`).
- Definir políticas de escalonamento quando usuário pertence a múltiplas igrejas (não suportado ainda).
- Auditar impacto de futuras filas/cronjobs para notificações e devocionais.

## 6. Referências

- PRD: `PROJETO/PRD.md`
- Lógica de sistema: `PROJETO/LOGICA.md`
- Rotas detalhadas: `PROJETO/ROTAS_ORGANIZADAS.md`
