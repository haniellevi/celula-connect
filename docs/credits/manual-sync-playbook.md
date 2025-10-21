# 🔄 Playbook de Sincronização Manual de Créditos

## Contexto
Durante o desenvolvimento e antes da ativação dos webhooks de billing do Clerk, o sistema opera em modo de sincronização manual. Este documento descreve os processos para manter os saldos de créditos sincronizados entre o banco de dados local e o Clerk.

## ⚠️ Estado Atual dos Webhooks
- **Webhooks de Billing**: DESATIVADOS
- **Clerk Billing**: Não configurado para produção
- **Sincronização**: Manual via painel administrativo

## 🔧 Processos de Sincronização

### 1. Ajuste Individual de Créditos
**Localização**: `/admin/users` → Ação "Ajustar Créditos"

**Processo**:
1. Acessar `/admin/users`
2. Localizar o usuário desejado
3. Clicar em "Ajustar Créditos"
4. Inserir valor absoluto ou ajuste relativo
5. Confirmar operação

**Endpoints utilizados**:
- `PUT /api/admin/users/[id]/credits` - Ajuste por usuário
- `PUT /api/admin/credits/[id]` - Ajuste por saldo

**Funcionalidades**:
- ✅ Atualiza `CreditBalance.creditsRemaining`
- ✅ Registra histórico em `UsageHistory`
- ✅ Sincroniza com Clerk via `syncClerkCreditsMetadata()`
- ✅ Fallback gracioso se Clerk estiver offline

### 2. Sincronização em Lote do Clerk
**Localização**: `/admin/users` → "Sincronizar do Clerk"

**Processo**:
1. Acessar `/admin/users`
2. Clicar em "Sincronizar do Clerk"
3. Configurar parâmetros:
   - `syncUsers`: Importar usuários do Clerk
   - `syncPlans`: Sincronizar planos de assinatura
   - `setCredits`: Aplicar créditos baseados no plano
   - `overrideCredits`: Valor fixo para todos (opcional)
4. Executar sincronização
5. Verificar toast de confirmação

**Endpoint utilizado**:
- `POST /api/admin/users/sync`

**Funcionalidades**:
- ✅ Importa usuários do Clerk em lotes
- ✅ Cria `CreditBalance` para novos usuários
- ✅ Sincroniza planos de assinatura
- ✅ Aplica créditos baseados no plano ativo
- ✅ Registra logs detalhados da operação

### 3. Verificação de Sincronização
**Indicadores de sucesso**:
- Toast de confirmação com estatísticas
- `CreditBalance.lastSyncedAt` atualizado
- `User.publicMetadata.creditsRemaining` sincronizado
- `User.publicMetadata.lastCreditsSyncAt` atualizado

**Indicadores de falha**:
- `metadataSynced: false` na resposta da API
- Logs de erro no console
- Toast de erro com detalhes

## 🚨 Cenários de Fallback

### Clerk Offline
Quando o Clerk não está disponível:
- Operações locais continuam funcionando
- `metadataSynced: false` é retornado
- Logs de erro são registrados
- Sincronização pode ser retentada posteriormente

### Webhooks Desativados
Durante desenvolvimento:
- Todos os eventos de billing são ignorados
- Sincronização manual é obrigatória
- Processo documentado neste playbook

## 📊 Monitoramento

### Logs Importantes
```bash
# Sincronização bem-sucedida
[admin/users/sync] processed=5, createdUsers=2, creditsRefreshed=3

# Falha na sincronização
Failed to sync Clerk credits metadata for admin adjustment Error: Clerk offline

# Ajuste de créditos
Updated user usr_xxx credits to 150
```

### Métricas a Acompanhar
- Número de usuários sincronizados
- Taxa de sucesso da sincronização
- Tempo de resposta das operações
- Erros de conectividade com Clerk

## 🔄 Transição para Produção

Quando os webhooks forem ativados:
1. Configurar `CLERK_WEBHOOK_SECRET`
2. Ativar webhooks no Clerk Dashboard
3. Testar eventos de billing
4. Desativar sincronização manual
5. Atualizar este documento

## 📝 Checklist de Validação

- [ ] Usuários seed têm saldos corretos
- [ ] Ajustes individuais funcionam
- [ ] Sincronização em lote processa todos os usuários
- [ ] Fallbacks funcionam quando Clerk está offline
- [ ] Histórico de uso é registrado corretamente
- [ ] Logs são gerados adequadamente

## 🧪 Testes de Validação

### Teste 1: Ajuste Individual
```bash
# 1. Acessar /admin/users
# 2. Localizar usuário seed
# 3. Ajustar créditos para 100
# 4. Verificar toast de sucesso
# 5. Confirmar saldo atualizado na tabela
```

### Teste 2: Sincronização em Lote
```bash
# 1. Acessar /admin/users
# 2. Clicar "Sincronizar do Clerk"
# 3. Configurar: syncUsers=true, setCredits=true
# 4. Executar sincronização
# 5. Verificar toast com estatísticas
# 6. Confirmar logs no console
```

### Teste 3: Fallback Clerk Offline
```bash
# 1. Desconectar internet temporariamente
# 2. Tentar ajustar créditos
# 3. Verificar que operação local funciona
# 4. Confirmar metadataSynced=false
# 5. Reconectar e re-tentar sincronização
```

## 📋 Evidências de Execução

### Data: 21/10/2025
- **Operação**: Sincronização em lote
- **Resultado**: ✅ Sucesso
- **Usuários processados**: 1
- **Usuários criados**: 0
- **Créditos atualizados**: 1
- **Logs**: `[admin/users/sync] processed=1, createdUsers=0, activeSubscriptions=0`

### Data: 20/10/2025
- **Operação**: Ajuste individual
- **Resultado**: ✅ Sucesso
- **Usuário**: `rvstecnologia@gmail.com`
- **Saldo anterior**: 0
- **Saldo novo**: 100
- **Sincronização Clerk**: ✅ Sucesso

## 🔗 Referências

- [Documentação de Créditos](../credits.md)
- [Guia de QA Admin](../testing/admin-qa-guide.md)
- [API de Créditos](../api.md)
- [Webhooks Clerk](../dev-webhooks.md)
