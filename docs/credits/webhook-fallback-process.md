# 🔧 Processo de Fallback - Webhooks Desativados

## Estado Atual
- **Webhooks de Billing**: DESATIVADOS
- **Clerk Billing**: Não configurado
- **Sincronização**: Manual obrigatória

## Processo de Manutenção

### 1. Ajustes de Créditos
- Usar painel `/admin/users` para ajustes individuais
- Usar `/admin/users/sync` para sincronização em lote
- Registrar todas as operações no checklist de QA

### 2. Monitoramento
- Verificar logs de sincronização diariamente
- Acompanhar métricas de sucesso/falha
- Documentar operações manuais

### 3. Transição Futura
- Quando webhooks forem ativados, este processo será descontinuado
- Manter documentação para referência histórica

## ⚠️ Limitações Atuais

### Webhooks Desativados
- Eventos de billing do Clerk não são processados automaticamente
- Mudanças de plano não atualizam créditos automaticamente
- Pagamentos de credit packs não são processados
- Cancelamentos de assinatura não reduzem créditos

### Sincronização Manual Obrigatória
- Administradores devem ajustar créditos manualmente
- Usuários não recebem créditos automáticos ao assinar
- Mudanças de plano requerem intervenção manual
- Monitoramento ativo é necessário

## 🔄 Processo de Manutenção Diária

### Checklist Diário
- [ ] Verificar logs de sincronização
- [ ] Acompanhar novos usuários registrados
- [ ] Validar saldos de créditos
- [ ] Documentar operações manuais
- [ ] Verificar métricas de uso

### Checklist Semanal
- [ ] Revisar histórico de operações
- [ ] Validar sincronização com Clerk
- [ ] Atualizar documentação se necessário
- [ ] Verificar performance das operações
- [ ] Planejar transição para webhooks

## 📊 Métricas de Monitoramento

### Operações de Sincronização
- Número de usuários sincronizados por dia
- Taxa de sucesso das operações
- Tempo médio de resposta
- Erros de conectividade

### Saldos de Créditos
- Distribuição de saldos por usuário
- Usuários com saldo zero
- Usuários com saldo alto
- Padrões de uso

## 🚨 Alertas e Notificações

### Alertas Críticos
- Falha na sincronização com Clerk
- Usuários sem saldo de créditos
- Erros de conectividade
- Operações que falharam

### Notificações de Manutenção
- Novos usuários registrados
- Mudanças de plano detectadas
- Operações manuais realizadas
- Atualizações de documentação

## 🔗 Integração com Sistema

### APIs Utilizadas
- `PUT /api/admin/users/[id]/credits` - Ajuste individual
- `PUT /api/admin/credits/[id]` - Ajuste por saldo
- `POST /api/admin/users/sync` - Sincronização em lote

### Funções de Sincronização
- `syncClerkCreditsMetadata()` - Sincroniza com Clerk
- `refreshUserCredits()` - Atualiza saldo local
- `addUserCredits()` - Adiciona créditos

## 📝 Logs e Auditoria

### Logs de Sincronização
```bash
# Sucesso
[admin/users/sync] processed=5, createdUsers=2, creditsRefreshed=3

# Falha
Failed to sync Clerk credits metadata for admin adjustment Error: Clerk offline

# Ajuste
Updated user usr_xxx credits to 150
```

### Auditoria de Operações
- Data e hora da operação
- Usuário que executou
- Tipo de operação
- Resultado da operação
- Logs de erro (se houver)

## 🔄 Transição para Produção

### Pré-requisitos
1. Configurar `CLERK_WEBHOOK_SECRET`
2. Ativar webhooks no Clerk Dashboard
3. Testar eventos de billing
4. Validar sincronização automática
5. Documentar processo de transição

### Plano de Transição
1. **Fase 1**: Configurar webhooks em ambiente de teste
2. **Fase 2**: Validar eventos de billing
3. **Fase 3**: Ativar webhooks em produção
4. **Fase 4**: Desativar sincronização manual
5. **Fase 5**: Atualizar documentação

### Rollback
- Manter sincronização manual como fallback
- Documentar processo de rollback
- Preparar scripts de emergência
- Treinar equipe no processo

## 📋 Checklist de Validação

### Validação Diária
- [ ] Verificar logs de sincronização
- [ ] Confirmar saldos de créditos
- [ ] Validar operações manuais
- [ ] Documentar incidentes

### Validação Semanal
- [ ] Revisar métricas de performance
- [ ] Atualizar documentação
- [ ] Planejar melhorias
- [ ] Preparar transição

### Validação Mensal
- [ ] Auditoria completa do sistema
- [ ] Revisão de processos
- [ ] Atualização de treinamento
- [ ] Planejamento de transição

## 🔗 Referências

- [Playbook de Sincronização Manual](./manual-sync-playbook.md)
- [Documentação de Créditos](../credits.md)
- [Guia de QA Admin](../testing/admin-qa-guide.md)
- [API de Créditos](../api.md)
- [Webhooks Clerk](../dev-webhooks.md)
