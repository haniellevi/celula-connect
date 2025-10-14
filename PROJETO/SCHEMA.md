# SCHEMA – Célula Connect (Out/2025)

Resumo técnico do schema Prisma utilizado na migração Igreja-12 → Starter Kit v2. Consulte `prisma/schema.prisma` para a fonte de verdade.

## 1. Visão Geral

- **Banco alvo**: PostgreSQL (Prisma Client em `prisma/generated/client`).
- **Chaves primárias**: `@id @default(cuid())` (string) para modelos; enums dedicados para domínios fixos.
- **Estratégia**: manter o core SaaS estável enquanto adicionamos gradualmente entidades do domínio Igreja-12.

## 2. Modelos do Core SaaS

### User

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `String` | PK (`cuid()`). |
| `clerkId` | `String` | Chave única para mapear usuário no Clerk. |
| `email` | `String?` | Opcional; há índice dedicado. |
| `name` | `String?` | Nome completo. |
| `isActive` | `Boolean` | Ativo/inativo (default `true`). |
| `creditBalance` | relação | 1:1 com `CreditBalance`. |
| `usageHistory` | relação | 1:n com `UsageHistory`. |

### CreditBalance

| Campo | Tipo | Notas |
| --- | --- | --- |
| `userId` | `String` | FK (`User.id`). |
| `clerkUserId` | `String` | Referência adicional ao Clerk (única). |
| `creditsRemaining` | `Int` | Saldo atual (default `100`). |
| `usageHistory` | relação | Consumos vinculados. |

### UsageHistory

| Campo | Tipo | Notas |
| --- | --- | --- |
| `operationType` | `OperationType` | `AI_TEXT_CHAT` ou `AI_IMAGE_GENERATION`. |
| `creditsUsed` | `Int` | Valor debitado (positivo). |
| `details` | `Json?` | Payload adicional (ex.: modelo, prompt). |
| `timestamp` | `DateTime` | Default `now()`, indexado. |

### Plan

| Campo | Tipo | Notas |
| --- | --- | --- |
| `clerkId` | `String?` | ID do plano no Clerk (`cplan_*`). |
| `credits` | `Int` | Quantidade padrão de créditos. |
| `currency`, `priceMonthlyCents`, `priceYearlyCents` | `String?` / `Int?` | Dados de precificação. |
| `features` | `Json?` | Lista de benefícios exibidos na UI. |
| `ctaType`, `ctaUrl` | `String?` | Configura Call-to-Action (checkout, contato). |
| `billingSource` | `String` | Ex.: `clerk`, `manual`. |

### AdminSettings

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `"singleton"` | Única linha. |
| `featureCosts` | `Json?` | Sobrescreve custos de features (`FeatureKey`). |

### Feature

| Campo | Tipo | Notas |
| --- | --- | --- |
| `workspaceId` | `String` | Identificação futura para multi-workspace. |
| `name` | `String` | Nome legível. |
| `description` | `String?` | Opcional. |
| `tags` | `String[]` | Taxonomia livre. |

### StorageObject

| Campo | Tipo | Notas |
| --- | --- | --- |
| `userId` | `String` | FK (`User`). |
| `provider` | `String` | Default `vercel_blob`. |
| `url` | `String` | URL público do blob. |
| `pathname` | `String` | Caminho interno. |
| `name` | `String` | Nome original do arquivo. |
| `size` | `Int` | Bytes. |
| `deletedAt` | `DateTime?` | Exclusão lógica. |

### SubscriptionEvent

| Campo | Tipo | Notas |
| --- | --- | --- |
| `clerkUserId` | `String` | Usuário no Clerk. |
| `planKey` | `String?` | `Plan.clerkId` ou identificador customizado. |
| `status` | `String` | `active`, `canceled`, etc. |
| `eventType` | `String` | `subscription.updated`, `invoice.payment_succeeded`, ... |
| `occurredAt` | `DateTime` | Ordenação. |
| `metadata` | `Json?` | Payload bruto. |

## 3. Modelos do Domínio Igreja-12

### Plano

| Campo | Tipo | Notas |
| --- | --- | --- |
| `nome` | `String` | Único. |
| `descricao` | `String?` | Texto longo (`@db.Text`). |
| `precoMensal`, `precoAnual` | `Decimal` | Valores referenciais. |
| `maxUsuarios`, `maxCelulas`, `maxLideres` | `Int?` | Limites por plano. |
| `funcionalidades` | `Json?` | Lista de features habilitadas. |
| `trialDias` | `Int` | Default `30`. |
| `igrejas` | relação | Igrejas associadas. |

### Igreja

| Campo | Tipo | Notas |
| --- | --- | --- |
| `nome` | `String` | Obrigatório. |
| `pastorPrincipalId` | `String?` | Referência futura para `Usuario`. |
| `cidade`, `estado` | `String` | Indexadas para filtros. |
| `planoId` | `String?` | FK (`Plano`). |
| `statusAssinatura` | `StatusAssinatura` | `TRIAL`, `ATIVA`, `SUSPENSA`, `CANCELADA`. |
| `trialInicio`, `trialFim` | `DateTime?` | Controle de trial. |
| `observacoesAdmin` | `String?` | Notas internas. |
| `usuarios`, `celulas` | relações | Coleções derivadas. |

### Usuario

| Campo | Tipo | Notas |
| --- | --- | --- |
| `clerkUserId` | `String` | Único; mantém ponte com autenticação. |
| `nome`, `email` | `String` | Email único. |
| `perfil` | `PerfilUsuario` | `DISCIPULO`, `LIDER_CELULA`, `SUPERVISOR`, `PASTOR`. |
| `igrejaId` | `String?` | FK (`Igreja`). |
| `ativo` | `Boolean` | Default `true`. |
| `dataPrimeiroAcesso`, `ultimoAcesso` | `DateTime?` | Telemetria. |
| `membrosCelula` | relação | Participações. |
| `celulasLideradas`, `celulasSupervisionadas` | relações nomeadas. |

### Celula

| Campo | Tipo | Notas |
| --- | --- | --- |
| `igrejaId` | `String` | FK (`Igreja`). |
| `liderId` | `String` | FK (`Usuario`) via relação `CelulaLider`. |
| `supervisorId` | `String?` | FK (`Usuario`) via `CelulaSupervisor`. |
| `nome`, `diaSemana`, `horario` | `String` | Dados operacionais. |
| `endereco` | `String?` | Localização física. |
| `metaMembros` | `Int` | Default `12`. |
| `dataInauguracao`, `proximaReuniao` | `DateTime?` | Histórico. |
| `ativa` | `Boolean` | Default `true`. |

### MembroCelula

| Campo | Tipo | Notas |
| --- | --- | --- |
| `celulaId`, `usuarioId` | `String` | PK composta (`@@unique`). |
| `cargo` | `CargoCelula` | `MEMBRO`, `LIDER`, `AUXILIAR`. |
| `dataEntrada`, `dataSaida` | `DateTime` | Histórico de permanência. |
| `ativo` | `Boolean` | Default `true`. |

### ReuniaoCelula

| Campo | Tipo | Notas |
| --- | --- | --- |
| `celulaId` | `String` | FK (`Celula`). |
| `data` | `DateTime` | Indexada (consultas por período). |
| `tema` | `String?` | Título/assunto. |
| `presentes`, `visitantes` | `Int` | Contagem agregada. |
| `observacoes` | `String?` | Notas adicionais. |

## 4. Enums

| Enum | Valores | Uso |
| --- | --- | --- |
| `OperationType` | `AI_TEXT_CHAT`, `AI_IMAGE_GENERATION` | Consumo de créditos. |
| `PerfilUsuario` | `DISCIPULO`, `LIDER_CELULA`, `SUPERVISOR`, `PASTOR` | Controle de acesso nas telas de célula (futuro). |
| `StatusAssinatura` | `TRIAL`, `ATIVA`, `SUSPENSA`, `CANCELADA` | Lifecycle das igrejas. |
| `CargoCelula` | `MEMBRO`, `LIDER`, `AUXILIAR` | Papel do usuário dentro da célula. |

## 5. Seeds e Ambientes

- Script oficial: `npm run db:seed` → `prisma/seed.ts`.
- Objetivo do seed: validar relacionamentos de igreja/célula e permitir dashboards protótipo.
- Recomendação: rodar seeds apenas em ambientes de desenvolvimento/preview.

## 6. Boas Práticas

1. **Camada de queries**: exponha acesso ao Prisma via `src/lib/queries/*`; evite usar `db` direto em componentes/client.
2. **Migrations**: use `prisma migrate dev` para versionar o schema; commit obrigatório.
3. **Indices**: sempre revisar planos de execução para campos consultados com frequência (ex.: `statusAssinatura`, `igrejaId`, `perfil`).
4. **Auditoria futura**: considerar tabelas de histórico (`HistoricoAssinaturas`, `HistoricoTrilha`) ao portar fluxos legados.
5. **Validação**: utilize `zod` nas APIs para garantir coerência com restrições do Prisma.

## 7. Referências

- Fonte de verdade: `prisma/schema.prisma`
- Documentação de banco: `docs/database.md`
- DER resumido: `PROJETO/DER.md`
