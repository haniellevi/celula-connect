# 📋 PLANO DE MIGRAÇÃO: IGREJA-12 → CÉLULA CONNECT (STARTER-KIT-V2)

**Data de Criação**: 8 de outubro de 2025  
**Versão**: 1.0  
**Status**: 🚀 Em execução (Fase 3 em preparação)

---

## 🔗 Alinhamento com a Base de Conhecimento (.context)
- Índice de Documentação: `.context/docs/README.md`
- Manual de Agentes: `.context/agents/README.md`

### Checklist rápido de atualização (AI Update Checklist)
1. Coletar contexto (branch atual, mudanças recentes) e conferir `docs/` e `agents/` modificados
2. Validar se a árvore de documentação está alinhada ao índice em `.context/docs/README.md`
3. Atualizar links cruzados se guias foram movidos/renomeados
4. Registrar fontes consultadas e decisões no texto do commit/PR

### Touchpoints de Documentação
- Entrypoints do projeto: `Celula-Connect/docs/README.md` (hub) e `Celula-Connect/README.md` (visão rápida)
- Índice repo-wide: `.context/docs/README.md`
- Playbooks de agentes: `.context/agents/README.md`

### Agentes Envolvidos (referência)
- Code Reviewer, Test Writer, Documentation Writer, Backend/Frontend/Database Specialists (ver `.context/agents/README.md`)

## 📊 RESUMO EXECUTIVO

### Objetivo
Migrar todas as funcionalidades do **Igreja-12** (React 19 + Vite + Cloudflare Workers + D1) para uma nova aplicação chamada **Célula Connect**, construída sobre a base tecnológica do **Starter-Kit-v2** (Next.js 15 + Prisma + PostgreSQL + Clerk).

### Escopo
- 🎯 **33 tabelas** do banco de dados SQLite/D1 → PostgreSQL/Prisma
- 🎯 **80+ páginas** funcionais React/Vite → Next.js App Router
- 🎯 **15+ APIs** Hono/Cloudflare Workers → Next.js API Routes
- 🎯 **50+ componentes** React customizados → Radix UI + TailwindCSS v4
- 🎯 **Sistema de autenticação** Mocha Auth → Clerk
- 🎯 **8 funcionalidades exclusivas** únicas no mercado

### Diferenciais a Preservar
1. **Trilha de crescimento com aprovação por supervisores** (ÚNICO NO MERCADO)
2. **Sistema de avisos dinâmicos** com segmentação inteligente
3. **Landing page configurável** em tempo real
4. **Progresso automático de metas de leitura** bíblica
5. **Sistema de devocionais** com rotação automática
6. **Gestão de células** mais completa do segmento
7. **Dashboards personalizáveis** por perfil
8. **Sistema de convites** com QR codes e tracking

### Atualização — 11 de outubro de 2025 (tarde)
- Modelagem Prisma ampliada com os módulos de trilha (`TrilhaCrescimento`, `UsuarioTrilha`, `AreaSupervisaoTrilha`, `SolicitacaoAvancoTrilha`), comunicação (`Aviso`, `Devocional`), convites, rede e configurações dinâmicas (`LandingPageConfig`, `ConfiguracaoSistema`).
- Seeds expandidas (`prisma/seed.ts`) cobrindo redes, convites, devocionais, avisos, trilhas, áreas de supervisão, solicitações de avanço e parâmetros de landing page / sistema para smoke tests.
- Fixtures sincronizadas em `tests/fixtures/domain-seed.json` refletindo os novos registros seed (`redes`, `convites`, `devocionais`, `avisos`, `trilhas`, `areasSupervisao`, `usuariosTrilha`, `solicitacoesTrilha`, `landingPageConfig`, `configuracoesSistema`).
- Helpers de consulta publicados em `src/lib/queries/{trilhas,avisos,devocionais,convites,settings}.ts` para sustentar as próximas rotas da Fase 4.

### Atualização — 11 de outubro de 2025 (noite)
- Sprint 3 da Fase 3 concluído: consultas do sistema bíblico revisitadas, seeds/fixtures ajustadas e rotas correspondentes preparadas para leitura de livros, capítulos, metas e leituras com filtros completos.
- Adaptação das rotas App Router ao contrato tipado do Next 15 com o helper `adaptRouteWithParams`, garantindo compatibilidade com o `RouteValidator` e `npm run typecheck` limpo.
- Novos utilitários (`src/lib/api/params.ts`) e refatorações nos componentes de Markdown para manter funcionalidades de cópia e destaque sem violar regras de hooks.
- `npm run lint` e `npm run typecheck` executados após os ajustes estruturais — apenas avisos herdados permanecem registrados (nenhum erro bloqueante).

### Atualização — 10 de outubro de 2025
- Modelos `Celula`, `MembroCelula` e `ReuniaoCelula` implementados em `prisma/schema.prisma` com índices principais, enums e relacionamentos (`Usuario` ↔ `Igreja`).
- `npm run db:push` executado contra Supabase (20:44) — novas tabelas criadas e Prisma Client regenerado.
- Script `prisma/seed.ts` criado para popular igreja, usuários, célula, membros e reunião exemplo (executar apenas em ambientes controlados, ex.: Supabase dev).
- Seeds rodadas via `npm run db:seed` (PowerShell, 20:50) garantindo dados de teste para dashboards e validações.
- Conexão direta ao cluster validada; seguir usando `.env.local` para comandos que dependem de rede externa.
- Próximo passo: atualizar checklist da Fase 3 com dependências e métricas baseadas nos dados seeded.
- Documentos de acompanhamento (ACOMPANHAMENTO_MIGRACAO.md) atualizados com o log e novo foco das próximas horas.

### Atualização — 9 de outubro de 2025
- Estrutura base do Next.js (copiada do starter-kit) validada com `npm run lint && npm run build` registrados em 08/10 19:43; dev server pronto para receber módulos de domínio.
- `.env.example` revisado com variáveis padrão e middleware do Clerk ativo; falta preencher chaves reais e validar fluxo completo de sign-in.
- `prisma/schema.prisma` atualizado com os modelos `Usuario`, `Igreja` e `Plano`; restante da modelagem continuará a partir dos artefatos do Igreja-12.
- Código-fonte sincronizado com o `starter-kit-v2` (configs, hooks, README, assets) para manter baseline 1:1 antes da migração de domínio.
- Diretórios `docs/` e `agents/` espelhados do `starter-kit-v2` para garantir que o template completo sirva de base ao projeto.
- Pasta `.context/` restaurada com o índice de documentação e playbooks padrão do template; utilizar esses arquivos como referência base ao migrar processos.
- Modelos Prisma `Usuario`, `Igreja` e `Plano` adicionados; próximos modelos dependem do mapeamento detalhado de Células e relacionamentos derivados.

### Atualização — 8 de outubro de 2025
- Fase 2 (Setup do Projeto) iniciou às 15:00 com foco em montar a base Next.js aproveitando o `starter-kit-v2`.
- O objetivo curto prazo é garantir build limpo (`npm run lint && npm run build`) antes de migrar qualquer regra de domínio.
- Entregáveis P0: estrutura de pastas oficial, dependências instaladas, Tailwind v4 habilitado, Clerk configurado com chaves dummy e `.env.example` registrado.
- Entregáveis P1: primeiros modelos Prisma (Usuário, Igreja, Plano) e conexão PostgreSQL validada.
- Build e lint já executam com sucesso em ambiente offline (fonts migradas para stack local) — evidências registradas em 08/10 às 19:43.
- Critério de saída da fase: pipeline local rodando, documentação atualizada (README, acompanhamento) e backlog da Fase 3 revisado.

---

## 🎯 ANÁLISE COMPARATIVA DE TECNOLOGIAS

### Stack Técnica - ANTES (Igreja-12)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React | 19 |
| **Build Tool** | Vite | Última |
| **Routing** | React Router | v7 |
| **State Management** | Context API + Hooks | - |
| **Styling** | Tailwind CSS | 3.4 |
| **Backend** | Cloudflare Workers + Hono | - |
| **Database** | Cloudflare D1 (SQLite) | - |
| **Auth** | Mocha Auth (Proprietário) | - |
| **Deployment** | Cloudflare Pages | - |
| **Icons** | Lucide React | - |
| **Drag & Drop** | @dnd-kit | - |

### Stack Técnica - DEPOIS (Célula Connect)

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Framework** | Next.js App Router | 15.3.5 |
| **Runtime** | React | 19 |
| **Type Safety** | TypeScript | Rigoroso |
| **Styling** | Tailwind CSS | v4 |
| **UI Components** | Radix UI | Headless |
| **State Management** | TanStack Query + Hooks | - |
| **Backend** | Next.js API Routes | - |
| **Database** | PostgreSQL | - |
| **ORM** | Prisma | Última |
| **Auth** | Clerk | Última |
| **Forms** | React Hook Form + Zod | - |
| **Deployment** | Vercel | - |
| **Icons** | Lucide React | ✅ Mantido |

### Vantagens da Migração

✅ **Performance**: Next.js Server Components + Edge Computing  
✅ **Type Safety**: TypeScript end-to-end com Prisma  
✅ **Developer Experience**: Hot reload, melhor debugging  
✅ **Escalabilidade**: PostgreSQL enterprise-grade  
✅ **Auth Completa**: Clerk com OAuth, 2FA, User Management  
✅ **UI Moderna**: Radix UI acessível + Tailwind v4  
✅ **Deployment**: Vercel com CI/CD automático  
✅ **Manutenibilidade**: Código mais organizado e testável

---

## 🗄️ MAPEAMENTO COMPLETO DE BANCO DE DADOS

### Tabelas do Igreja-12 (33 tabelas) → Prisma Schema

#### 1. MÓDULO DE AUTENTICAÇÃO

**ANTES (SQLite/D1):**
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mocha_user_id TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT,
    perfil TEXT NOT NULL DEFAULT 'discipulo',
    igreja_id INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    data_primeiro_acesso DATE,
    ultimo_acesso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**DEPOIS (Prisma):**
```prisma
model Usuario {
  id                 String    @id @default(cuid())
  clerkUserId        String    @unique // Clerk ao invés de Mocha
  nome               String
  email              String    @unique
  telefone           String?
  perfil             PerfilUsuario @default(DISCIPULO)
  igrejaId           String?
  ativo              Boolean   @default(true)
  dataPrimeiroAcesso DateTime?
  ultimoAcesso       DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  
  // Relacionamentos
  igreja             Igreja?   @relation(fields: [igrejaId], references: [id])
  membrosCelula      MembroCelula[]
  usuarioTrilha      UsuarioTrilha[]
  leituras           LeituraRegistro[]
  creditBalance      CreditBalance? // Do starter-kit
  
  @@index([clerkUserId])
  @@index([email])
  @@index([igrejaId])
  @@index([perfil])
}

enum PerfilUsuario {
  DISCIPULO
  LIDER_CELULA
  SUPERVISOR
  PASTOR
}
```

#### 2. MÓDULO DE IGREJAS E PLANOS

**Igreja-12 → Célula Connect:**
```prisma
model Igreja {
  id                 String   @id @default(cuid())
  nome               String
  pastorPrincipalId  String?
  cep                String?
  cidade             String
  estado             String
  telefone           String?
  email              String?
  cnpj               String?
  enderecoCompleto   String?
  planoId            String   @default("plano_gratuito")
  dataAssinatura     DateTime?
  dataVencimento     DateTime?
  statusAssinatura   StatusAssinatura @default(TRIAL)
  trialInicio        DateTime?
  trialFim           DateTime?
  observacoesAdmin   String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relacionamentos
  plano              Plano    @relation(fields: [planoId], references: [id])
  usuarios           Usuario[]
  celulas            Celula[]
  avisos             Aviso[]
  
  @@index([planoId])
  @@index([statusAssinatura])
  @@index([dataVencimento])
}

enum StatusAssinatura {
  TRIAL
  ATIVA
  SUSPENSA
  CANCELADA
}

model Plano {
  id                 String   @id @default(cuid())
  nome               String   @unique
  descricao          String?
  precoMensal        Decimal  @default(0)
  precoAnual         Decimal  @default(0)
  maxUsuarios        Int?     // NULL = ilimitado
  maxCelulas         Int?
  maxLideres         Int?
  funcionalidades    Json     // Array de features
  ativo              Boolean  @default(true)
  trialDias          Int      @default(30)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  igrejas            Igreja[]
  
  @@index([ativo])
}
```

#### 3. SISTEMA BÍBLICO (7 tabelas)

```prisma
model LivroBiblia {
  id         String   @id @default(cuid())
  codigo     String   @unique // GEN, EXO, etc
  nome       String
  abreviacao String
  testamento Testamento
  ordem      Int      @unique
  capitulos  Int      // Total de capítulos
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  capitulosBiblia CapituloBiblia[]
  
  @@index([codigo])
  @@index([ordem])
  @@index([testamento])
}

enum Testamento {
  AT
  NT
}

model CapituloBiblia {
  id          String   @id @default(cuid())
  livroId     String
  numero      Int
  titulo      String?
  texto       String   @db.Text
  versiculos  Int      // Quantidade
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  livro       LivroBiblia @relation(fields: [livroId], references: [id])
  versiculosBiblia VersiculoBiblia[]
  
  @@unique([livroId, numero])
  @@index([livroId])
}

model VersiculoBiblia {
  id         String   @id @default(cuid())
  capituloId String
  numero     Int
  texto      String   @db.Text
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  capitulo   CapituloBiblia @relation(fields: [capituloId], references: [id])
  
  @@unique([capituloId, numero])
  @@index([capituloId])
}

model MetaLeitura {
  id          String   @id @default(cuid())
  titulo      String
  descricao   String?
  criadoPor   String
  igrejaId    String
  celulaId    String?
  tipoMeta    TipoMeta
  valorMeta   Int
  unidade     UnidadeTempo
  periodo     String
  dataInicio  DateTime
  dataFim     DateTime
  ativa       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  igreja      Igreja   @relation(fields: [igrejaId], references: [id])
  celula      Celula?  @relation(fields: [celulaId], references: [id])
  usuarios    MetaLeituraUsuario[]
  
  @@index([igrejaId])
  @@index([celulaId])
  @@index([ativa])
}

enum TipoMeta {
  CAPITULOS
  LIVROS
  BIBLIA_COMPLETA
}

enum UnidadeTempo {
  DIA
  SEMANA
  MES
  ANO
}

model MetaLeituraUsuario {
  id                String   @id @default(cuid())
  metaId            String
  usuarioId         String
  atribuidaPor      String
  ativa             Boolean  @default(true)
  progressoAtual    Int      @default(0)
  ultimaAtualizacao DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  meta              MetaLeitura @relation(fields: [metaId], references: [id])
  usuario           Usuario     @relation(fields: [usuarioId], references: [id])
  progressoAutomatico ProgressoAutomaticoMeta[]
  
  @@index([metaId])
  @@index([usuarioId])
  @@index([ativa])
}

// FUNCIONALIDADE EXCLUSIVA: Progresso Automático
model ProgressoAutomaticoMeta {
  id                String   @id @default(cuid())
  metaUsuarioId     String
  livroCodigo       String
  capitulo          Int
  dataLeitura       DateTime
  tempoLeitura      Int      // minutos
  percentualConcluido Float  @default(100.0)
  contribuiuMeta    Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  metaUsuario       MetaLeituraUsuario @relation(fields: [metaUsuarioId], references: [id])
  
  @@unique([metaUsuarioId, livroCodigo, capitulo, dataLeitura])
  @@index([metaUsuarioId])
  @@index([dataLeitura])
}

model LeituraRegistro {
  id           String   @id @default(cuid())
  usuarioId    String
  livroCodigo  String
  capitulo     Int
  dataLeitura  DateTime
  tempoLeitura Int?     // minutos
  observacoes  String?
  metaId       String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  usuario      Usuario  @relation(fields: [usuarioId], references: [id])
  
  @@index([usuarioId])
  @@index([dataLeitura])
  @@index([livroCodigo, capitulo])
}
```

#### 4. TRILHA DE CRESCIMENTO COM APROVAÇÃO (EXCLUSIVO)

```prisma
model TrilhaCrescimento {
  id          String   @id @default(cuid())
  ordem       Int      @unique
  titulo      String
  descricao   String
  tipo        TipoTrilha
  duracaoDias Int      @default(0)
  requisitos  String?
  ativa       Boolean  @default(true)
  conteudo    Json?    // Materiais e recursos
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  usuariosTrilha UsuarioTrilha[]
  etapasArea     EtapaAreaSupervisao[]
  
  @@index([ordem])
  @@index([ativa])
}

enum TipoTrilha {
  CURSO
  EVENTO
  ATIVIDADE
  CERTIFICACAO
}

model UsuarioTrilha {
  id             String   @id @default(cuid())
  usuarioId      String
  trilhaId       String
  etapaAtual     Int      @default(1)
  concluido      Boolean  @default(false)
  dataInicio     DateTime?
  dataConclusao  DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  usuario        Usuario           @relation(fields: [usuarioId], references: [id])
  trilha         TrilhaCrescimento @relation(fields: [trilhaId], references: [id])
  
  @@index([usuarioId])
  @@index([trilhaId])
}

// FUNCIONALIDADE EXCLUSIVA: Sistema de Aprovação
model AreaSupervisaoTrilha {
  id          String   @id @default(cuid())
  nome        String
  descricao   String
  supervisorId String
  igrejaId    String
  ativa       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  igreja      Igreja   @relation(fields: [igrejaId], references: [id])
  etapas      EtapaAreaSupervisao[]
  solicitacoes SolicitacaoAvancoTrilha[]
  
  @@index([supervisorId])
  @@index([igrejaId])
  @@index([ativa])
}

model EtapaAreaSupervisao {
  id          String   @id @default(cuid())
  areaId      String
  trilhaId    String
  podeAprovar Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  area        AreaSupervisaoTrilha @relation(fields: [areaId], references: [id])
  trilha      TrilhaCrescimento    @relation(fields: [trilhaId], references: [id])
  
  @@index([areaId])
  @@index([trilhaId])
}

model SolicitacaoAvancoTrilha {
  id                    String   @id @default(cuid())
  usuarioId             String
  trilhaId              String
  liderSolicitanteId    String
  areaSupervisaoId      String
  motivo                String?
  observacoesLider      String?
  status                StatusSolicitacao @default(PENDENTE)
  dataSolicitacao       DateTime
  dataResposta          DateTime?
  supervisorResponsavelId String?
  observacoesSupervisor String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  area                  AreaSupervisaoTrilha @relation(fields: [areaSupervisaoId], references: [id])
  
  @@index([usuarioId])
  @@index([status])
  @@index([supervisorResponsavelId])
}

enum StatusSolicitacao {
  PENDENTE
  APROVADA
  REJEITADA
}
```

#### 5. GESTÃO DE CÉLULAS

```prisma
model Celula {
  id              String   @id @default(cuid())
  nome            String
  liderId         String
  endereco        String?
  diaSemana       String
  horario         String
  supervisorId    String?
  igrejaId        String
  ativa           Boolean  @default(true)
  metaMembros     Int      @default(12)
  dataInauguracao DateTime?
  proximaReuniao  DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  igreja          Igreja   @relation(fields: [igrejaId], references: [id])
  membros         MembroCelula[]
  reunioes        ReuniaoCelula[]
  metas           MetaLeitura[]
  
  @@index([liderId])
  @@index([supervisorId])
  @@index([igrejaId])
  @@index([ativa])
}

model MembroCelula {
  id          String   @id @default(cuid())
  celulaId    String
  usuarioId   String
  cargo       CargoCelula @default(MEMBRO)
  dataEntrada DateTime
  dataSaida   DateTime?
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  celula      Celula   @relation(fields: [celulaId], references: [id])
  usuario     Usuario  @relation(fields: [usuarioId], references: [id])
  
  @@index([celulaId])
  @@index([usuarioId])
  @@index([ativo])
}

enum CargoCelula {
  MEMBRO
  LIDER
  AUXILIAR
}

model ReuniaoCelula {
  id             String   @id @default(cuid())
  celulaId       String
  data           DateTime
  tema           String
  presentes      Int      @default(0)
  visitantes     Int      @default(0)
  observacoes    String?
  liderPresente  Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  celula         Celula   @relation(fields: [celulaId], references: [id])
  
  @@index([celulaId])
  @@index([data])
}

model Rede {
  id           String   @id @default(cuid())
  nome         String
  supervisorId String
  igrejaId     String
  cor          String   @default("#3B82F6")
  ativa        Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@index([supervisorId])
  @@index([igrejaId])
  @@index([ativa])
}
```

#### 6. COMUNICAÇÃO (Avisos + Devocionais)

```prisma
model Devocional {
  id                String   @id @default(cuid())
  titulo            String
  versiculoReferencia String
  versiculoTexto    String   @db.Text
  conteudo          String   @db.Text
  dataDevocional    DateTime @unique
  ativo             Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([dataDevocional])
  @@index([ativo])
}

// FUNCIONALIDADE EXCLUSIVA: Avisos Dinâmicos
model Aviso {
  id          String   @id @default(cuid())
  titulo      String
  conteudo    String   @db.Text
  tipo        TipoAviso
  prioridade  PrioridadeAviso @default(NORMAL)
  igrejaId    String?
  celulaId    String?
  usuarioId   String?
  dataInicio  DateTime
  dataFim     DateTime?
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  igreja      Igreja?  @relation(fields: [igrejaId], references: [id])
  
  @@index([igrejaId])
  @@index([celulaId])
  @@index([usuarioId])
  @@index([dataInicio])
  @@index([prioridade])
  @@index([ativo])
}

enum TipoAviso {
  GERAL
  URGENTE
  INFORMATIVO
  SISTEMA
}

enum PrioridadeAviso {
  BAIXA
  NORMAL
  ALTA
  URGENTE
}
```

#### 7. CONFIGURAÇÕES E LANDING PAGE

```prisma
// FUNCIONALIDADE EXCLUSIVA: Landing Page Configurável
model LandingPageConfig {
  id        String   @id @default(cuid())
  secao     String
  chave     String
  valor     String   @db.Text
  tipo      String   @default("text")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([secao, chave])
  @@index([secao])
}

model ConfiguracaoSistema {
  id        String   @id @default(cuid())
  chave     String   @unique
  valor     String   @db.Text
  categoria String
  descricao String?
  tipoCampo String   @default("text")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([categoria])
  @@index([chave])
}
```

#### 8. SISTEMA DE CONVITES

```prisma
model Convite {
  id             String   @id @default(cuid())
  convidadoPor   String
  emailConvidado String
  nomeConvidado  String
  celulaId       String
  cargo          String   @default("membro")
  tokenConvite   String   @unique
  usado          Boolean  @default(false)
  dataExpiracao  DateTime
  usadoPor       String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([tokenConvite])
  @@index([emailConvidado])
  @@index([usado])
}
```

### Resumo de Migração de Dados

| Módulo | Tabelas Igreja-12 | Modelos Prisma | Complexidade |
|--------|-------------------|----------------|--------------|
| Autenticação | 3 | 3 | 🟡 Média |
| Igrejas/Planos | 3 | 4 | 🟢 Baixa |
| Sistema Bíblico | 7 | 7 | 🔴 Alta |
| Trilha c/ Aprovação | 6 | 6 | 🔴 Alta |
| Células | 5 | 5 | 🟡 Média |
| Comunicação | 3 | 3 | 🟢 Baixa |
| Configurações | 4 | 2 | 🟢 Baixa |
| Convites | 2 | 1 | 🟢 Baixa |
| **TOTAL** | **33** | **31** | - |

**Nota:** Algumas tabelas foram consolidadas no Prisma para melhor normalização.

---

## 📱 MAPEAMENTO DE FUNCIONALIDADES

### 1. Sistema de Autenticação

**ANTES (Mocha Auth):**
- Login/Logout com JWT
- OAuth callback
- Recuperação de senha
- Sessões persistentes
- RoleGuard por perfil

**DEPOIS (Clerk):**
- ✅ Tudo que Mocha fazia + mais:
  - Social logins (Google, GitHub, etc)
  - 2FA nativo
  - User management dashboard
  - Webhooks para sincronização
  - Session management avançado
  - Customização completa de UI

**Ações Necessárias:**
1. Substituir `useAuth` do Mocha → `useAuth` do Clerk
2. Atualizar middleware de autenticação
3. Criar webhooks para sincronizar usuários
4. Mapear `mocha_user_id` → `clerk_user_id`
5. Manter sistema de perfis (discipulo, lider, supervisor, pastor)

---

### 2. Dashboards por Perfil

**Dashboards Implementados (4 únicos):**
- ✅ Dashboard Discípulo
- ✅ Dashboard Líder de Célula
- ✅ Dashboard Supervisor
- ✅ Dashboard Pastor

**Migração:**
1. Criar páginas no App Router: `/app/(protected)/dashboard/[perfil]/page.tsx`
2. Usar Server Components para dados iniciais
3. Client Components para interatividade
4. TanStack Query para fetch client-side
5. Manter lógica de negócio de cada dashboard

---

### 3. Sistema Bíblico

**Funcionalidades Atuais:**
- 66 livros, 1.189 capítulos, 31.102 versículos
- Leitor com configurações personalizadas
- Sistema de metas automáticas (EXCLUSIVO)
- Destaques e anotações
- Favoritos e histórico
- Sessões cronometradas
- Progresso automático (ÚNICO NO MERCADO)

**Migração:**
1. Migrar todos os versículos para PostgreSQL
2. Criar API routes para busca e leitura
3. Implementar sistema de metas com TanStack Query
4. Manter progresso automático (funcionalidade única)
5. UI com Radix UI + Tailwind v4

---

### 4. Trilha de Crescimento com Aprovação (PRIORIDADE MÁXIMA)

**Funcionalidade ÚNICA NO MUNDO:**
- 4 etapas estruturadas
- Sistema de aprovação por supervisores
- Áreas de supervisão
- Workflow de solicitações
- Histórico completo

**Migração (CUIDADO ESPECIAL):**
1. Preservar 100% da lógica de aprovação
2. Criar APIs para solicitações
3. Implementar notificações (Clerk + custom)
4. Dashboard de aprovações para supervisores
5. Timeline visual de progresso

---

### 5. Gestão de Células

**Funcionalidades:**
- CRUD completo de células
- Gestão de membros
- Planejamento de reuniões
- Relatórios de frequência
- Sistema de visitantes
- Metas de multiplicação

**Migração:**
1. Criar páginas no App Router
2. APIs CRUD com Next.js
3. Formulários com React Hook Form + Zod
4. Relatórios com gráficos (Recharts)
5. Manter toda lógica de negócio

---

### 6. Sistema de Avisos Dinâmicos (EXCLUSIVO)

**Funcionalidade ÚNICA:**
- Segmentação inteligente (igreja, célula, usuário)
- Sistema de prioridades
- Feed dinâmico personalizado
- Expiração automática
- Analytics de visualização

**Migração:**
1. Criar modelo Prisma de avisos
2. API para CRUD e filtragem
3. ✅ Hook customizado `useAvisos()`
4. ✅ Componente de feed com TanStack Query (dashboards atualizados)
5. Sistema de notificações (Clerk webhooks)

---

### 7. Landing Page Configurável (EXCLUSIVO)

**Funcionalidade ÚNICA NO MERCADO GOSPEL:**
- Editor visual em tempo real
- Todas as seções configuráveis
- Preview instantâneo
- SEO dinâmico
- A/B testing ready

**Migração:**
1. Criar página pública `/app/(public)/page.tsx`
2. API para configurações `/api/landing-config`
3. ✅ Hook `useLandingConfig()` e consumo no Hero
4. ✅ Editor visual para admin (builder protegido)
5. SSG para performance

---

### 8. Sistema de Convites

**Funcionalidades:**
- Geração de tokens únicos
- QR codes automáticos
- Links seguros
- Tracking de conversões
- Expiração inteligente

**Migração:**
1. Modelo Prisma de convites
2. ✅ API para geração e validação + hooks (`useConvites`)
3. Página pública de processamento
4. QR code com biblioteca React
5. Analytics de conversão

---

## 🛠️ PLANO DE EXECUÇÃO DETALHADO

### FASE 1: PLANEJAMENTO E ANÁLISE (✅ CONCLUÍDA)

**Duração**: 1 dia  
**Status**: ✅ 100% Completo

- [x] Análise completa da documentação
- [x] Mapeamento de schema de banco
- [x] Mapeamento de funcionalidades
- [x] Criação deste documento

---

### FASE 2: SETUP DO PROJETO (Concluída em 10/10/2025)

**Objetivo**: Criar estrutura base do Célula Connect

#### 2.1 Estrutura de Pastas
```bash
Celula-Connect/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (protected)/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── public/
├── .env.local
├── package.json
└── README.md
```

#### 2.2 Dependências Principais
```json
{
  "dependencies": {
    "next": "15.3.5",
    "react": "19",
    "@clerk/nextjs": "^6.23.0",
    "@prisma/client": "latest",
    "@tanstack/react-query": "latest",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^4",
    "zod": "latest",
    "react-hook-form": "latest",
    "lucide-react": "latest"
  }
}
```

#### 2.3 Configuração de Banco
1. Criar PostgreSQL database
2. Configurar DATABASE_URL
3. Criar schema.prisma completo
4. Executar primeira migração

#### 2.4 Configuração de Autenticação
1. Criar conta Clerk ✅ (`celula-connect-dev`, chaves test em `.env.local`)
2. Configurar OAuth providers ✅ (Google ativo, GitHub opcional)
3. Setup webhooks ➡️ Postergado para Fase 4 (depende das rotas de billing)
4. Configurar middleware ✅ (`src/middleware.ts`)

#### 2.5 Backlog imediato de modelagem (10/10)

| Entrega                         | Referência                                     | Observações operacionais                                                                 |
|---------------------------------|------------------------------------------------|------------------------------------------------------------------------------------------|
| ✅ Modelos de Células           | `prisma/schema.prisma` (linhas 268-339)        | Relacionamentos com `Usuario`/`Igreja` implementados e sincronizados com Supabase.       |
| ✅ Seeds de células/membros     | `prisma/seed.ts`                               | Registros de igreja, usuários e reuniões para validação (executar apenas em ambientes controlados).|
| ✅ Checklist Fase 3 (pré-reqs)  | Seção **Fase 3: Migração de Banco de Dados**   | Queries de verificação catalogadas; pronto para iniciar Sprint 1.                       |


**Entregáveis (status atual):**
- ✅ Projeto Next.js configurado (base Next 15 + Tailwind v4 ativa)
- ⏳ Prisma schema completo (depende da modelagem das 33 tabelas a partir dos docs do Igreja-12)
- ✅ Clerk integrado (provider, middleware, OAuth Google/GitHub ativados; aguarda chaves finais)
- ✅ Estrutura de pastas organizada

---

### FASE 3: MIGRAÇÃO DE BANCO DE DADOS (3-4 dias)

**Objetivo**: Migrar todas as 33 tabelas para Prisma/PostgreSQL

#### 3.1 Priorização de Migração

**Status Atual**: ⏸️ Não iniciado — pré-requisitos satisfeitos; aguardando kickoff do Sprint 1.

**Pré-requisitos confirmados (10/10)**
- ✅ Seeds `seed-*` aplicadas no Supabase dev (`npm run db:seed`) para servir de baseline em testes de migração.
- ✅ Relacionamentos `Celula`, `MembroCelula`, `ReuniaoCelula` sincronizados com Supabase (`npm run db:push` 10/10 20:44).
- ✅ `package.json`/`tsconfig.json` atualizados com scripts e strict mode habilitado.
- ✅ Consultas de verificação catalogadas para validar seeds (`seed-*`) antes da migração em massa.

**Consultas de verificação (Supabase dev)**
```sql
-- Quantidade de usuários seed gerados para validação
SELECT COUNT(*) AS total_usuarios_seed FROM "Usuario" WHERE id LIKE 'seed-%';

-- Garantir que apenas a célula seed está presente
SELECT COUNT(*) AS total_celulas_seed FROM "Celula" WHERE id LIKE 'seed-%';

-- Verificar membros ativos da célula seed
SELECT COUNT(*) AS membros_por_celula_seed FROM "MembroCelula" WHERE celulaId = 'seed-celula-vida';

-- Confirmar registros de reuniões para dashboards iniciais
SELECT COUNT(*) AS reunioes_seed FROM "ReuniaoCelula" WHERE celulaId = 'seed-celula-vida';
```

**Sprint 1 - Core (Dia 1):**
- [ ] Usuários e autenticação _(comparar dados reais vs seeds `seed-user-*`)_
- [ ] Igrejas e planos _(validar com `seed-igreja-central` / `seed-plano-basico`)_
- [ ] Células básicas _(usar `seed-celula-vida` para smoke tests)_

**Sprint 2 - Funcionalidades Críticas (Dia 2):**
- [ ] Trilha de crescimento (com aprovação)
- [ ] Membros de célula _(cross-check com fixtures `seed-membro-*`)_
- [ ] Reuniões _(usar seed inicial para testar dashboards e relatórios)_

**Sprint 3 - Sistema Bíblico (Dia 3):**
- [ ] Livros, capítulos, versículos
- [ ] Metas de leitura
- [ ] Progresso automático

**Sprint 4 - Comunicação e Outros (Dia 4):**
- [ ] Avisos dinâmicos
- [ ] Devocionais
- [ ] Convites
- [ ] Configurações

#### 3.2 Script de Migração de Dados

Criar script para migrar dados existentes:

```typescript
// scripts/migrate-data.ts
import { PrismaClient as OldDB } from './old-db-client';
import { db } from '@/lib/db';

async function migrateUsers() {
  const oldUsers = await oldDB.usuarios.findMany();
  
  for (const oldUser of oldUsers) {
    await db.usuario.create({
      data: {
        clerkUserId: oldUser.mocha_user_id, // Mapear para Clerk
        nome: oldUser.nome,
        email: oldUser.email,
        // ... resto dos campos
      }
    });
  }
}

// Executar todas as migrações
async function main() {
  await migrateUsers();
  await migrateIgrejas();
  await migrateCelulas();
  // ... etc
}
```

**Entregáveis (planejados):**
- ✅ Schema Prisma base (modelos principais e seeds de célula)
- ✅ Seeds de referência aplicadas em ambiente dev (Supabase)
- ⏳ Schema Prisma completo (31 modelos)
- ⏳ Dados migrados de D1 para PostgreSQL
- ⏳ Scripts de migração documentados
- ⏳ Backup de dados antigos

---

### FASE 4: MIGRAÇÃO DE BACKEND (APIs) (5-6 dias)

**Objetivo**: Migrar 15+ APIs de Hono/Workers para Next.js API Routes

#### 4.1 Estrutura de APIs

```
src/app/api/
├── auth/
│   └── [...nextauth]/route.ts
├── usuarios/
│   ├── route.ts              # GET, POST
│   └── [id]/route.ts         # GET, PUT, DELETE
├── igrejas/
│   ├── route.ts
│   └── [id]/route.ts
├── celulas/
│   ├── route.ts
│   └── [id]/route.ts
├── trilha/
│   ├── route.ts
│   ├── solicitacoes/route.ts
│   └── aprovacao/route.ts
├── biblia/
│   ├── livros/route.ts
│   ├── capitulos/route.ts
│   └── metas/route.ts
├── avisos/
│   ├── route.ts
│   └── [id]/route.ts
└── admin/
    ├── landing/route.ts
    └── config/route.ts
```

#### 4.2 Padrão de API Route

```typescript
// src/app/api/celulas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createCelulaSchema = z.object({
  nome: z.string().min(1),
  liderId: z.string(),
  diaSemana: z.string(),
  horario: z.string(),
  // ... resto dos campos
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const celulas = await db.celula.findMany({
      where: { /* filtros */ },
      include: { /* relacionamentos */ }
    });

    return NextResponse.json(celulas);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCelulaSchema.parse(body);

    const celula = await db.celula.create({
      data: validatedData
    });

    return NextResponse.json(celula, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

#### 4.3 Priorização de APIs

**Críticas (Dias 1-2):**
1. Auth e usuários
2. Igrejas e planos
3. Células CRUD

**Importantes (Dias 3-4):**
4. Trilha com aprovação (PRIORIDADE)
5. Metas de leitura
6. Avisos dinâmicos

**Secundárias (Dias 5-6):**
7. Bíblia (livros, capítulos)
8. Convites
9. Landing page config
10. Admin

**Entregáveis:**
- ✅ 15+ API routes funcionais
- ✅ Validação com Zod
- ✅ Autenticação com Clerk
- ✅ Testes de integração

---

### FASE 5: MIGRAÇÃO DE FRONTEND (10-12 dias)

**Objetivo**: Migrar 80+ páginas React/Vite para Next.js App Router

#### 5.1 Estrutura de Páginas

```
src/app/
├── (public)/
│   ├── page.tsx                    # Landing Page
│   ├── sign-in/[[...sign-in]]/     # Clerk Sign-in
│   └── sign-up/[[...sign-up]]/     # Clerk Sign-up
├── (protected)/
│   ├── dashboard/
│   │   ├── discipulo/page.tsx
│   │   ├── lider/page.tsx
│   │   ├── supervisor/page.tsx
│   │   └── pastor/page.tsx
│   ├── celula/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── nova/page.tsx
│   ├── trilha/
│   │   ├── page.tsx
│   │   └── aprovacao/page.tsx
│   ├── biblia/
│   │   ├── leitor/page.tsx
│   │   └── metas/page.tsx
│   └── avisos/
│       └── page.tsx
└── admin/
    ├── landing/page.tsx
    ├── usuarios/page.tsx
    └── config/page.tsx
```

#### 5.2 Conversão de Componentes

**ANTES (React Context):**
```tsx
// src/react-app/pages/dashboard/Discipulo.tsx
import { useAuth } from '@/contexts/AuthContext';

export function DashboardDiscipulo() {
  const { user } = useAuth();
  // ...
}
```

**DEPOIS (Next.js + Clerk):**
```tsx
// src/app/(protected)/dashboard/discipulo/page.tsx
"use client";

import { useUser } from '@clerk/nextjs';
import { usePageConfig } from '@/hooks/use-page-config';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export default function DashboardDiscipuloPage() {
  const { user } = useUser();
  const { data, isLoading } = useDashboardData();
  
  usePageConfig("Dashboard", "Bem-vindo ao seu painel");
  
  if (isLoading) return <Loading />;
  
  return <DashboardContent data={data} />;
}
```

#### 5.3 Hooks Customizados

Criar hooks para substituir Context API:

```typescript
// src/hooks/use-dashboard-data.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/dashboard/me'),
    staleTime: 5 * 60 * 1000,
  });
}

// src/hooks/use-celulas.ts
export function useCelulas() {
  return useQuery({
    queryKey: ['celulas'],
    queryFn: () => api.get('/api/celulas'),
  });
}

export function useCreateCelula() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => api.post('/api/celulas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['celulas'] });
    },
  });
}
```

#### 5.4 Priorização de Páginas

**Sprint 1 - Core (Dias 1-2):**
- Landing Page configurável
- Sign-in/Sign-up (Clerk)
- Dashboard Discípulo
- Dashboard Líder

**Sprint 2 - Dashboards (Dias 3-4):**
- Dashboard Supervisor
- Dashboard Pastor
- Navegação e layout

**Sprint 3 - Funcionalidades Críticas (Dias 5-6):**
- Gestão de Células
- Trilha de Crescimento
- Sistema de Aprovação (PRIORIDADE)

**Sprint 4 - Sistema Bíblico (Dias 7-8):**
- Leitor de Bíblia
- Gestão de Metas
- Progresso Automático

**Sprint 5 - Comunicação (Dias 9-10):**
- Sistema de Avisos
- Devocionais
- Feed dinâmico

**Sprint 6 - Admin e Polimento (Dias 11-12):**
- Painel administrativo
- Landing page editor
- Configurações
- Ajustes finais

**Entregáveis (planejados):**
- ⏳ 80+ páginas migradas
- ⏳ Todos os dashboards funcionais
- ⏳ Funcionalidades exclusivas preservadas
- ⏳ UI moderna com Radix + Tailwind v4

---

### FASE 6: FUNCIONALIDADES EXCLUSIVAS (3-4 dias)

**Foco TOTAL nas funcionalidades que diferenciam o produto:**

#### 6.1 Trilha com Aprovação (Dia 1-2)
- Dashboard de supervisores
- Workflow de solicitações
- Sistema de notificações
- Timeline de progresso
- Testes completos

#### 6.2 Avisos Dinâmicos (Dia 2-3)
- Sistema de segmentação
- Feed personalizado
- Priorização automática
- Analytics de visualização

#### 6.3 Landing Page Configurável (Dia 3)
- Editor visual
- Preview real-time
- Sistema de configurações
- SSG otimizado

#### 6.4 Progresso Automático de Metas (Dia 4)
- Tracking automático
- Cálculo de progresso
- Notificações de conquistas
- Gamificação

**Entregáveis (planejados):**
- ⏳ Todas funcionalidades exclusivas 100% funcionais
- ⏳ Testes completos
- ⏳ Documentação atualizada

---

### FASE 7: TESTES E QUALIDADE (2-3 dias)

#### 7.1 Testes Automatizados

```typescript
// __tests__/api/celulas.test.ts
import { GET, POST } from '@/app/api/celulas/route';

describe('/api/celulas', () => {
  it('retorna lista de células autenticado', async () => {
    // ... teste
  });
  
  it('cria célula com dados válidos', async () => {
    // ... teste
  });
});

// __tests__/components/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';

describe('Dashboard Discípulo', () => {
  it('renderiza dados do usuário', () => {
    // ... teste
  });
});
```

#### 7.2 Testes E2E com Playwright

```typescript
// e2e/trilha-aprovacao.spec.ts
import { test, expect } from '@playwright/test';

test('fluxo completo de aprovação de trilha', async ({ page }) => {
  // 1. Login como líder
  // 2. Solicitar avanço
  // 3. Login como supervisor
  // 4. Aprovar solicitação
  // 5. Verificar atualização
});
```

#### 7.3 Checklist de Qualidade

- [ ] Todos os testes passando
- [ ] Zero erros no console
- [ ] Performance < 2s loading
- [ ] Mobile responsive 100%
- [ ] Acessibilidade WCAG AA
- [ ] SEO otimizado
- [ ] Lighthouse score > 90

**Entregáveis (planejados):**
- ⏳ Suite de testes completa
- ⏳ Cobertura > 70%
- ⏳ Sem bugs críticos
- ⏳ Performance otimizada

---

### FASE 8: DEPLOYMENT E DOCUMENTAÇÃO (1-2 dias)

#### 8.1 Deployment Vercel

```bash
# Configurar variáveis de ambiente
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=...
NEXT_PUBLIC_APP_URL=https://celulaconnect.com

# Deploy
vercel --prod
```

#### 8.2 Documentação

Criar documentação completa:

```
Celula-Connect/
├── README.md                    # Overview do projeto
├── ARCHITECTURE.md              # Arquitetura técnica
├── API.md                       # Documentação de APIs
├── CONTRIBUTING.md              # Guia de contribuição
└── CHANGELOG.md                 # Histórico de mudanças
```

#### 8.3 Treinamento

- Criar vídeos tutoriais
- Documentar fluxos principais
- Guia de primeiros passos
- FAQ

**Entregáveis (planejados):**
- ⏳ Aplicação em produção
- ⏳ Documentação completa
- ⏳ Materiais de treinamento
- ⏳ Monitoramento configurado

---

## 💾 Ritmo de Commits Profissionais
- Abrir branches focadas por entrega e sincronizar com `main` antes de iniciar.
- Gerar commits ao concluir cada marco do plano (modelagem Prisma, configuração Clerk, fluxos de UI), mantendo pacotes pequenos.
- Usar Conventional Commits no título e detalhar no corpo comandos executados, evidências e referências ao plano/acompanhamento.
- Rodar validações locais (`npm run lint`, `npm run test`, `npx prisma db push` quando aplicável) antes de commitar.
- Enviar os commits para o GitHub imediatamente após a revisão local para evitar trabalho não versionado.

---

## 🔒 Políticas de PR, Testes e Evidências
- Antes do PR: `npm run build && npm run test` (adicionar saída resumida no PR)
- Conventional Commits no título/descrição do PR
- Cruzar links de novos scaffolds em `docs/README.md` e `agents/README.md` quando aplicável
- Armazenar artefatos gerados e exemplos em `.context/` para reprodutibilidade
- Capturar evidências: links de PRs, hashes de commit, prints/logs de testes, notas de design

## 📚 Referências Internas (.context)
- `.context/docs/README.md` — Índice e mapa de documentação
- `.context/agents/README.md` — Playbooks e responsabilidades por agente
- `.context/plans/` — Modelos de plano e evidências esperadas

## 📊 CRONOGRAMA CONSOLIDADO

| Fase | Descrição | Duração | Status |
|------|-----------|---------|--------|
| 1 | Planejamento e Análise | 1 dia | ✅ Concluída |
| 2 | Setup do Projeto | 2 dias | 🔜 Próxima |
| 3 | Migração de Banco | 4 dias | 📋 Pendente |
| 4 | Migração de APIs | 6 dias | 📋 Pendente |
| 5 | Migração de Frontend | 12 dias | 📋 Pendente |
| 6 | Funcionalidades Exclusivas | 4 dias | 📋 Pendente |
| 7 | Testes e Qualidade | 3 dias | 📋 Pendente |
| 8 | Deployment | 2 dias | 📋 Pendente |
| **TOTAL** | | **34 dias** (~7 semanas) | |

---

## 🎯 CRITÉRIOS DE SUCESSO

### Funcionalidades Core
- [ ] Todos os 4 dashboards funcionais
- [ ] Sistema de trilha com aprovação 100%
- [ ] Sistema de avisos dinâmicos 100%
- [ ] Landing page configurável 100%
- [ ] Progresso automático de metas 100%
- [ ] Sistema bíblico completo
- [ ] Gestão de células completa

### Performance
- [ ] Loading time < 2s
- [ ] Lighthouse score > 90
- [ ] Mobile responsive 100%
- [ ] Zero erros de console
- [ ] Uptime > 99.9%

### Qualidade
- [ ] Cobertura de testes > 70%
- [ ] Zero bugs críticos
- [ ] Documentação completa
- [ ] Código TypeScript 100%

### Diferenciação
- [ ] Todas as 8 funcionalidades exclusivas preservadas
- [ ] UI/UX moderna superior ao original
- [ ] Performance melhor que Igreja-12
- [ ] Escalabilidade enterprise

---

## 🚨 RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de funcionalidade exclusiva | Baixa | Alto | Testes extensivos + revisão manual |
| Problemas de performance | Média | Médio | Monitoramento contínuo + otimização |
| Bugs na migração de dados | Média | Alto | Scripts de validação + backups |
| Atraso no cronograma | Média | Médio | Buffer de 20% no tempo estimado |
| Incompatibilidade Clerk vs Mocha | Baixa | Médio | POC de autenticação no início |

---

## 📝 PRÓXIMOS PASSOS IMEDIATOS

### 1. Aprovação do Plano ✅
- Revisar este documento
- Aprovar arquitetura proposta
- Confirmar prioridades

### 2. Setup Inicial (Próximas 4 horas)
```bash
# 1. Replicar estrutura base do starter-kit
cp -R starter-kit-v2/. Celula-Connect/
# (Se necessário, remova cópias de arquivos específicos já existentes como estes documentos de migração)

# 2. Atualizar dependências e scripts
cd Celula-Connect
npm install
npm install @clerk/nextjs @tanstack/react-query @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# 3. Inicializar Prisma (novo schema e .env.example)
npx prisma init --datasource-provider postgresql

# 4. Configurar Clerk (variáveis dummy para desenvolvimento)
cp .env.example .env.local
```

#### Validações rápidas
- Executar `npm run lint && npm run build` e registrar evidências (logs resumidos) no PR

### 3. Primeira Sprint (Próximos 2 dias)
- Provisionar banco PostgreSQL local ou em container e validar conexão (`npx prisma db push`)
- Implementar autenticação Clerk (middleware + componentes de layout)
- Criar primeiros 3 modelos Prisma (Usuário, Igreja, Plano) com seeds mínimas
- Entregar primeira rota API (status/healthcheck) e página pública (Landing)

---

## 💡 RECOMENDAÇÕES FINAIS

### Prioridades Absolutas
1. **Preservar funcionalidades exclusivas** - São o diferencial competitivo
2. **Testes da trilha com aprovação** - Funcionalidade mais crítica
3. **Performance** - Deve ser igual ou superior ao original
4. **Documentação** - Essencial para manutenção futura

### Não Fazer
- ❌ Não cortar funcionalidades para ganhar tempo
- ❌ Não skipar testes das features exclusivas
- ❌ Não fazer deploy sem testes E2E
- ❌ Não migrar sem backups completos

### Oportunidades de Melhoria
- ✨ Adicionar system dark/light theme
- ✨ PWA para experiência mobile
- ✨ Notificações push
- ✨ AI para insights de células
- ✨ Analytics avançados

---

## ✅ CHECKLIST FINAL

Antes de considerar a migração concluída:

### Funcional
- [ ] Todas as páginas funcionais (80+)
- [ ] Todas as APIs funcionais (15+)
- [ ] Todos os modelos criados (31)
- [ ] Todas funcionalidades exclusivas (8)
- [ ] Autenticação completa
- [ ] Permissões por perfil

### Técnico
- [ ] TypeScript 100%
- [ ] Zero erros de build
- [ ] Zero warnings críticos
- [ ] Testes passando
- [ ] Performance OK
- [ ] Mobile responsive

### Negócio
- [ ] Dados migrados
- [ ] Backups criados
- [ ] Documentação completa
- [ ] Treinamento realizado
- [ ] Deploy em produção
- [ ] Monitoramento ativo

---

## 📞 SUPORTE E CONTATO

**Documentação Técnica**: Este arquivo  
**Arquitetura**: Ver `/ARCHITECTURE.md` (a criar)  
**APIs**: Ver `/API.md` (a criar)  
**Issues**: GitHub Issues  

---

**RESUMO**: Este é um plano completo e executável para migrar o Igreja-12 para a stack moderna do Starter-Kit-v2, preservando todas as funcionalidades exclusivas que fazem do produto um líder de mercado. O cronograma de ~7 semanas é realista e contempla todas as fases necessárias para uma migração de sucesso.

**PRÓXIMO PASSO**: Elaborar plano do Sprint 1 da Fase 3 (Usuários/Igrejas/Células) com base nas seeds e queries catalogadas.

---

**Data**: 8 de outubro de 2025  
**Última atualização**: 10 de outubro de 2025  
**Versão**: 1.0  
**Status**: 🚀 Em execução (Fase 3 em preparação)

