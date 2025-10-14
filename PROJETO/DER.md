# DER – Célula Connect

Documento de relacionamento entre entidades após a atualização do schema Prisma (Out/2025). Abrange o core SaaS herdado do Starter Kit e as entidades específicas do domínio Igreja-12.

## 1. Visão Geral

- **Total de modelos Prisma**: 14 (9 do core + 5 do domínio Igreja-12).
- **Enums**: `OperationType`, `PerfilUsuario`, `StatusAssinatura`, `CargoCelula`.
- **Chaves primárias**: todas usam `cuid()` (strings) para compatibilidade com ambientes serverless; exceção aos enums.
- **Índices**: as colunas de lookup mais críticas (`clerkId`, `clerkUserId`, `igrejaId`, `planoId`, `perfil`, `timestamp`) já possuem índices dedicados.

## 2. Núcleo SaaS (Starter Kit)

```
User ──1─┐
         │
         │      CreditBalance ──┐
         │                      │
         └──< UsageHistory >────┘

Plan ──< User (futuro) / SubscriptionEvent

AdminSettings ➝ (configura overrides de créditos)
StorageObject ➝ (uploads por usuário)
Feature ➝ (metadados de funcionalidades por workspace)
```

| Modelo | Finalidade | Campos-chave |
| --- | --- | --- |
| `User` | Usuário vinculado ao Clerk (clerkId, email, estados). | `clerkId`, `email`, `isActive`. |
| `CreditBalance` | Cache do saldo de créditos por usuário. | `userId`, `clerkUserId`, `creditsRemaining`. |
| `UsageHistory` | Log de consumo de créditos (chat/imagem). | `operationType`, `timestamp`, `creditsUsed`. |
| `AdminSettings` | Configurações globais (custos customizados). | `featureCosts`. |
| `Plan` | Planos ofertados e sincronizados com Clerk. | `clerkId`, `credits`, `highlight`, `ctaType`. |
| `SubscriptionEvent` | Telemetria de eventos de cobrança. | `clerkUserId`, `status`, `planKey`, `occurredAt`. |
| `StorageObject` | Arquivos salvos via Vercel Blob. | `userId`, `pathname`, `provider`, `deletedAt`. |
| `Feature` | Catálogo de funcionalidades por workspace (não usado ainda). | `workspaceId`, `name`, `tags`. |

### Considerações

- `OperationType` (enum): `AI_TEXT_CHAT`, `AI_IMAGE_GENERATION` — mantém paridade com custos configurados em `src/lib/credits/feature-config.ts`.
- `Plan` difere de `Plano` (domínio Igreja-12); o primeiro é monetização do template, o segundo representa planos de igreja (limites de células, etc.).
- `StorageObject` guarda uploads vinculados ao Clerk; a exclusão lógica usa `deletedAt`.

## 3. Domínio Igreja-12 (Migração)

```
Plano ──< Igreja ──< Usuario ──< Celula ──< MembroCelula
                               │
                               └─< ReuniaoCelula
```

| Entidade | Papel | Principais campos/relacionamentos |
| --- | --- | --- |
| `Plano` | Plano comercial para igrejas (limites e funcionalidades). | `nome`, `precoMensal`, `maxUsuarios`, `funcionalidades`. |
| `Igreja` | Organização eclesiástica. | `planoId`, `statusAssinatura`, `cidade`, `trialInicio/trialFim`. |
| `Usuario` | Representa membro/funcionário da igreja migrado do legado. | `clerkUserId`, `perfil` (`PerfilUsuario`), `igrejaId`, `ativo`. |
| `Celula` | Grupo pequeno vinculado à igreja. | `igrejaId`, `liderId`, `supervisorId`, `diaSemana`, `metaMembros`. |
| `MembroCelula` | Relação usuário↔célula com cargo e datas. | `celulaId`, `usuarioId`, `cargo`, `dataEntrada`, `dataSaida`. |
| `ReuniaoCelula` | Histórico de reuniões com contagem de presentes/visitantes. | `celulaId`, `data`, `tema`, `presentes`, `visitantes`. |

### Relacionamentos e Cardinalidades

- `Plano 1─n Igreja`: uma igreja pertence a um plano; alteração de plano deve registrar histórico (futuro).
- `Igreja 1─n Usuario`: usuários herdam `PerfilUsuario` (Discípulo, Líder, Supervisor, Pastor) para controlar dashboards.
- `Usuario 1─n Celula` (como líder) e `Usuario 1─n Celula` (como supervisor) via relações nomeadas (`CelulaLider`, `CelulaSupervisor`).
- `Celula 1─n MembroCelula`: armazena histórico de participação com cargos (`CargoCelula`: MEMBRO, LIDER, AUXILIAR).
- `Celula 1─n ReuniaoCelula`: permite métricas de frequência.

### Seeds e Dados de Teste

- `prisma/seed.ts` cria um plano seed, igreja central, supervisor, líder, discípulo, célula e reunião.
- IDs seed (`seed-*`) facilitam limpeza e diferenciam dados de produção.

## 4. Próximas Extensões (Planejadas)

| Módulo | Entidades previstas | Observações |
| --- | --- | --- |
| Trilha de crescimento | `EtapaTrilha`, `ProgressoTrilha`, `AprovacaoTrilha` | Necessário para replicar workflow do legado. |
| Sistema bíblico | `LivroBiblia`, `CapituloBiblia`, `VersiculoBiblia`, `MetaLeitura`, `LeituraUsuario` | Avaliar estratégia de importação (bulk load + scripts). |
| Avisos e devocionais | `Aviso`, `SegmentoAviso`, `Devocional`, `HistoricoEnvio` | Demandará job scheduler e fila. |
| Gestão financeira | `HistoricoAssinaturas`, `TransacaoManual` | Para rastrear upgrades/downgrades de igrejas. |

## 5. Boas Práticas de Evolução

- **Migrações**: usar `prisma migrate dev` para novas tabelas; evitar `db push` em produção.
- **Consistência**: manter chaves estrangeiras explícitas no Prisma com `@@index` nos campos usados em filtros.
- **Seeds**: atualizar `prisma/seed.ts` sempre que um novo relacionamento exigir dados de apoio.
- **Auditoria**: avaliar inclusão futura de campos `createdBy`/`updatedBy` conforme dashboards recebam edição multiusuário.

## 6. Referências

- Schema completo: `prisma/schema.prisma`
- Seed oficial: `prisma/seed.ts`
- Guia de banco de dados: `docs/database.md`
