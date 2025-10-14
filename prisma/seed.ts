import {
  PrismaClient,
  PerfilUsuario,
  CargoCelula,
  StatusAssinatura,
  StatusSolicitacao,
  Testamento,
  TipoMeta,
  TipoTrilha,
  TipoAviso,
  PrioridadeAviso,
  UnidadeTempo,
} from "./generated/client";

const prisma = new PrismaClient();

async function main() {
  const planoBasico = await prisma.plano.upsert({
    where: { id: "seed-plano-basico" },
    update: {
      descricao: "Plano seed para validar relacionamentos de células.",
      ativo: true,
    },
    create: {
      id: "seed-plano-basico",
      nome: "Plano Básico Seed",
      descricao: "Plano seed para validação local de células e membros.",
      ativo: true,
      trialDias: 30,
    },
  });

  const igrejaCentral = await prisma.igreja.upsert({
    where: { id: "seed-igreja-central" },
    update: {
      nome: "Igreja Central Seed",
      cidade: "São Paulo",
      estado: "SP",
      planoId: planoBasico.id,
      observacoesAdmin:
        "Registro seed para validação local das entidades de células.",
      statusAssinatura: StatusAssinatura.ATIVA,
    },
    create: {
      id: "seed-igreja-central",
      nome: "Igreja Central Seed",
      cidade: "São Paulo",
      estado: "SP",
      telefone: "+55 (11) 99999-9999",
      email: "contato@seedigreja.com",
      planoId: planoBasico.id,
      statusAssinatura: StatusAssinatura.ATIVA,
      observacoesAdmin:
        "Registro seed para validação local das entidades de células.",
    },
  });

  const igrejaZonaNorte = await prisma.igreja.upsert({
    where: { id: "seed-igreja-zona-norte" },
    update: {
      nome: "Igreja Zona Norte Seed",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      planoId: planoBasico.id,
      statusAssinatura: StatusAssinatura.TRIAL,
      observacoesAdmin:
        "Igreja seed para validar múltiplas células e perfis supervisionados.",
    },
    create: {
      id: "seed-igreja-zona-norte",
      nome: "Igreja Zona Norte Seed",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      telefone: "+55 (21) 98888-0000",
      email: "contato@zonanorte-seed.com",
      planoId: planoBasico.id,
      statusAssinatura: StatusAssinatura.TRIAL,
      observacoesAdmin:
        "Igreja seed para validar múltiplas células e perfis supervisionados.",
    },
  });

  const pastor = await prisma.usuario.upsert({
    where: { id: "seed-user-pastor" },
    update: {
      nome: "Paulo Pastor Seed",
      email: "pastor.seed@celula-connect.dev",
      perfil: PerfilUsuario.PASTOR,
      igrejaId: igrejaCentral.id,
    },
    create: {
      id: "seed-user-pastor",
      clerkUserId: "usr_seed_pastor",
      nome: "Paulo Pastor Seed",
      email: "pastor.seed@celula-connect.dev",
      perfil: PerfilUsuario.PASTOR,
      igrejaId: igrejaCentral.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-01-02T12:00:00Z"),
    },
  });

  await prisma.igreja.update({
    where: { id: igrejaCentral.id },
    data: { pastorPrincipalId: pastor.id },
  });

  const supervisor = await prisma.usuario.upsert({
    where: { id: "seed-user-supervisor" },
    update: {
      nome: "Sara Supervisora Seed",
      email: "supervisora.seed@celula-connect.dev",
      perfil: PerfilUsuario.SUPERVISOR,
      igrejaId: igrejaCentral.id,
    },
    create: {
      id: "seed-user-supervisor",
      clerkUserId: "usr_seed_supervisor",
      nome: "Sara Supervisora Seed",
      email: "supervisora.seed@celula-connect.dev",
      perfil: PerfilUsuario.SUPERVISOR,
      igrejaId: igrejaCentral.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-01-05T12:00:00Z"),
    },
  });

  const supervisorZonaNorte = await prisma.usuario.upsert({
    where: { id: "seed-user-supervisor-norte" },
    update: {
      nome: "Nádia Supervisora Norte Seed",
      email: "supervisora.norte@celula-connect.dev",
      perfil: PerfilUsuario.SUPERVISOR,
      igrejaId: igrejaZonaNorte.id,
    },
    create: {
      id: "seed-user-supervisor-norte",
      clerkUserId: "usr_seed_supervisor_norte",
      nome: "Nádia Supervisora Norte Seed",
      email: "supervisora.norte@celula-connect.dev",
      perfil: PerfilUsuario.SUPERVISOR,
      igrejaId: igrejaZonaNorte.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-01-08T13:00:00Z"),
    },
  });

  const redeCentral = await prisma.rede.upsert({
    where: { id: "seed-rede-central" },
    update: {
      nome: "Rede Central",
      supervisorId: supervisor.id,
      cor: "#2563EB",
      ativa: true,
    },
    create: {
      id: "seed-rede-central",
      nome: "Rede Central",
      supervisorId: supervisor.id,
      igrejaId: igrejaCentral.id,
      cor: "#2563EB",
      ativa: true,
    },
  });

  const redeZonaNorte = await prisma.rede.upsert({
    where: { id: "seed-rede-zona-norte" },
    update: {
      nome: "Rede Zona Norte",
      supervisorId: supervisorZonaNorte.id,
      cor: "#10B981",
      ativa: true,
    },
    create: {
      id: "seed-rede-zona-norte",
      nome: "Rede Zona Norte",
      supervisorId: supervisorZonaNorte.id,
      igrejaId: igrejaZonaNorte.id,
      cor: "#10B981",
      ativa: true,
    },
  });

  const lider = await prisma.usuario.upsert({
    where: { id: "seed-user-lider" },
    update: {
      nome: "Lucas Líder Seed",
      email: "lider.seed@celula-connect.dev",
      perfil: PerfilUsuario.LIDER_CELULA,
      igrejaId: igrejaCentral.id,
    },
    create: {
      id: "seed-user-lider",
      clerkUserId: "usr_seed_lider",
      nome: "Lucas Líder Seed",
      email: "lider.seed@celula-connect.dev",
      perfil: PerfilUsuario.LIDER_CELULA,
      igrejaId: igrejaCentral.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-01-10T19:30:00Z"),
    },
  });

  const liderFamilia = await prisma.usuario.upsert({
    where: { id: "seed-user-lider-familia" },
    update: {
      nome: "Fernanda Líder Família Seed",
      email: "lider.familia@celula-connect.dev",
      perfil: PerfilUsuario.LIDER_CELULA,
      igrejaId: igrejaCentral.id,
    },
    create: {
      id: "seed-user-lider-familia",
      clerkUserId: "usr_seed_lider_familia",
      nome: "Fernanda Líder Família Seed",
      email: "lider.familia@celula-connect.dev",
      perfil: PerfilUsuario.LIDER_CELULA,
      igrejaId: igrejaCentral.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-01-15T19:30:00Z"),
    },
  });

  const liderExpansao = await prisma.usuario.upsert({
    where: { id: "seed-user-lider-expansao" },
    update: {
      nome: "Rafael Líder Expansão Seed",
      email: "lider.expansao@celula-connect.dev",
      perfil: PerfilUsuario.LIDER_CELULA,
      igrejaId: igrejaZonaNorte.id,
    },
    create: {
      id: "seed-user-lider-expansao",
      clerkUserId: "usr_seed_lider_expansao",
      nome: "Rafael Líder Expansão Seed",
      email: "lider.expansao@celula-connect.dev",
      perfil: PerfilUsuario.LIDER_CELULA,
      igrejaId: igrejaZonaNorte.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-01-18T18:00:00Z"),
    },
  });

  const discipulo = await prisma.usuario.upsert({
    where: { id: "seed-user-discipulo" },
    update: {
      nome: "Daniela Discípula Seed",
      email: "discipula.seed@celula-connect.dev",
      perfil: PerfilUsuario.DISCIPULO,
      igrejaId: igrejaCentral.id,
    },
    create: {
      id: "seed-user-discipulo",
      clerkUserId: "usr_seed_discipulo",
      nome: "Daniela Discípula Seed",
      email: "discipula.seed@celula-connect.dev",
      perfil: PerfilUsuario.DISCIPULO,
      igrejaId: igrejaCentral.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-02-02T21:00:00Z"),
    },
  });

  const discipuloJuvenil = await prisma.usuario.upsert({
    where: { id: "seed-user-discipulo-juvenil" },
    update: {
      nome: "João Discípulo Juvenil Seed",
      email: "discipulo.juvenil@celula-connect.dev",
      perfil: PerfilUsuario.DISCIPULO,
      igrejaId: igrejaCentral.id,
    },
    create: {
      id: "seed-user-discipulo-juvenil",
      clerkUserId: "usr_seed_discipulo_juvenil",
      nome: "João Discípulo Juvenil Seed",
      email: "discipulo.juvenil@celula-connect.dev",
      perfil: PerfilUsuario.DISCIPULO,
      igrejaId: igrejaCentral.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-02-12T21:00:00Z"),
    },
  });

  const discipuloNorte = await prisma.usuario.upsert({
    where: { id: "seed-user-discipulo-norte" },
    update: {
      nome: "Camila Discípula Norte Seed",
      email: "discipula.norte@celula-connect.dev",
      perfil: PerfilUsuario.DISCIPULO,
      igrejaId: igrejaZonaNorte.id,
    },
    create: {
      id: "seed-user-discipulo-norte",
      clerkUserId: "usr_seed_discipulo_norte",
      nome: "Camila Discípula Norte Seed",
      email: "discipula.norte@celula-connect.dev",
      perfil: PerfilUsuario.DISCIPULO,
      igrejaId: igrejaZonaNorte.id,
      ativo: true,
      dataPrimeiroAcesso: new Date("2025-02-20T20:00:00Z"),
    },
  });

  const celulaVida = await prisma.celula.upsert({
    where: { id: "seed-celula-vida" },
    update: {
      nome: "Célula Vida em Cristo",
      liderId: lider.id,
      supervisorId: supervisor.id,
      igrejaId: igrejaCentral.id,
      redeId: redeCentral.id,
      diaSemana: "Quinta-feira",
      horario: "20:00",
      endereco: "Rua das Acácias, 120 - Vila Esperança",
      ativa: true,
      metaMembros: 15,
      proximaReuniao: new Date("2025-10-17T23:00:00Z"),
    },
    create: {
      id: "seed-celula-vida",
      nome: "Célula Vida em Cristo",
      liderId: lider.id,
      supervisorId: supervisor.id,
      igrejaId: igrejaCentral.id,
      redeId: redeCentral.id,
      diaSemana: "Quinta-feira",
      horario: "20:00",
      endereco: "Rua das Acácias, 120 - Vila Esperança",
      ativa: true,
      metaMembros: 15,
      dataInauguracao: new Date("2024-03-14T23:00:00Z"),
      proximaReuniao: new Date("2025-10-17T23:00:00Z"),
    },
  });

  const celulaFamilia = await prisma.celula.upsert({
    where: { id: "seed-celula-familia" },
    update: {
      nome: "Célula Família em Aliança",
      liderId: liderFamilia.id,
      supervisorId: supervisor.id,
      igrejaId: igrejaCentral.id,
      redeId: redeCentral.id,
      diaSemana: "Terça-feira",
      horario: "19:30",
      endereco: "Rua das Laranjeiras, 45 - Centro",
      ativa: true,
      metaMembros: 12,
      proximaReuniao: new Date("2025-10-21T22:00:00Z"),
    },
    create: {
      id: "seed-celula-familia",
      nome: "Célula Família em Aliança",
      liderId: liderFamilia.id,
      supervisorId: supervisor.id,
      igrejaId: igrejaCentral.id,
      redeId: redeCentral.id,
      diaSemana: "Terça-feira",
      horario: "19:30",
      endereco: "Rua das Laranjeiras, 45 - Centro",
      ativa: true,
      metaMembros: 12,
      dataInauguracao: new Date("2024-08-10T22:00:00Z"),
      proximaReuniao: new Date("2025-10-21T22:00:00Z"),
    },
  });

  const celulaExpansao = await prisma.celula.upsert({
    where: { id: "seed-celula-expansao" },
    update: {
      nome: "Célula Expansão Zona Norte",
      liderId: liderExpansao.id,
      supervisorId: supervisorZonaNorte.id,
      igrejaId: igrejaZonaNorte.id,
      redeId: redeZonaNorte.id,
      diaSemana: "Sábado",
      horario: "18:00",
      endereco: "Rua das Mangueiras, 300 - Zona Norte",
      ativa: true,
      metaMembros: 20,
      proximaReuniao: new Date("2025-10-25T21:00:00Z"),
    },
    create: {
      id: "seed-celula-expansao",
      nome: "Célula Expansão Zona Norte",
      liderId: liderExpansao.id,
      supervisorId: supervisorZonaNorte.id,
      igrejaId: igrejaZonaNorte.id,
      redeId: redeZonaNorte.id,
      diaSemana: "Sábado",
      horario: "18:00",
      endereco: "Rua das Mangueiras, 300 - Zona Norte",
      ativa: true,
      metaMembros: 20,
      dataInauguracao: new Date("2024-06-01T21:00:00Z"),
      proximaReuniao: new Date("2025-10-25T21:00:00Z"),
    },
  });

  await prisma.membroCelula.upsert({
    where: { id: "seed-membro-lider" },
    update: {
      cargo: CargoCelula.LIDER,
      ativo: true,
    },
    create: {
      id: "seed-membro-lider",
      celulaId: celulaVida.id,
      usuarioId: lider.id,
      cargo: CargoCelula.LIDER,
      dataEntrada: new Date("2024-03-14T23:00:00Z"),
      ativo: true,
    },
  });

  await prisma.membroCelula.upsert({
    where: { id: "seed-membro-discipulo" },
    update: {
      ativo: true,
    },
    create: {
      id: "seed-membro-discipulo",
      celulaId: celulaVida.id,
      usuarioId: discipulo.id,
      cargo: CargoCelula.MEMBRO,
      dataEntrada: new Date("2025-02-05T23:00:00Z"),
      ativo: true,
    },
  });

  await prisma.membroCelula.upsert({
    where: { id: "seed-membro-lider-familia" },
    update: {
      cargo: CargoCelula.LIDER,
      ativo: true,
    },
    create: {
      id: "seed-membro-lider-familia",
      celulaId: celulaFamilia.id,
      usuarioId: liderFamilia.id,
      cargo: CargoCelula.LIDER,
      dataEntrada: new Date("2024-08-10T22:00:00Z"),
      ativo: true,
    },
  });

  await prisma.membroCelula.upsert({
    where: { id: "seed-membro-juvenil" },
    update: {
      ativo: true,
    },
    create: {
      id: "seed-membro-juvenil",
      celulaId: celulaFamilia.id,
      usuarioId: discipuloJuvenil.id,
      cargo: CargoCelula.AUXILIAR,
      dataEntrada: new Date("2024-09-15T22:00:00Z"),
      ativo: true,
    },
  });

  await prisma.membroCelula.upsert({
    where: { id: "seed-membro-lider-expansao" },
    update: {
      cargo: CargoCelula.LIDER,
      ativo: true,
    },
    create: {
      id: "seed-membro-lider-expansao",
      celulaId: celulaExpansao.id,
      usuarioId: liderExpansao.id,
      cargo: CargoCelula.LIDER,
      dataEntrada: new Date("2024-06-01T21:00:00Z"),
      ativo: true,
    },
  });

  await prisma.membroCelula.upsert({
    where: { id: "seed-membro-norte" },
    update: {
      ativo: true,
    },
    create: {
      id: "seed-membro-norte",
      celulaId: celulaExpansao.id,
      usuarioId: discipuloNorte.id,
      cargo: CargoCelula.MEMBRO,
      dataEntrada: new Date("2024-07-10T21:00:00Z"),
      ativo: true,
    },
  });

  await prisma.convite.upsert({
    where: { id: "seed-convite-familia-novo" },
    update: {
      dataExpiracao: new Date("2025-11-30T23:59:59Z"),
      usado: false,
    },
    create: {
      id: "seed-convite-familia-novo",
      convidadoPorId: liderFamilia.id,
      emailConvidado: "novo.membro@celula-connect.dev",
      nomeConvidado: "Novo Membro Família Seed",
      celulaId: celulaFamilia.id,
      cargo: CargoCelula.MEMBRO,
      tokenConvite: "seed-token-familia",
      usado: false,
      dataExpiracao: new Date("2025-11-30T23:59:59Z"),
    },
  });

  await prisma.convite.upsert({
    where: { id: "seed-convite-vida-aceito" },
    update: {
      usado: true,
      usadoPorId: discipulo.id,
    },
    create: {
      id: "seed-convite-vida-aceito",
      convidadoPorId: lider.id,
      emailConvidado: "daniela.discipula@celula-connect.dev",
      nomeConvidado: "Daniela Discípula Seed",
      celulaId: celulaVida.id,
      cargo: CargoCelula.MEMBRO,
      tokenConvite: "seed-token-vida",
      usado: true,
      dataExpiracao: new Date("2025-09-30T23:59:59Z"),
      usadoPorId: discipulo.id,
    },
  });

  await prisma.reuniaoCelula.upsert({
    where: { id: "seed-reuniao-2025-10-03" },
    update: {
      tema: "O Poder da Oração em Unidade",
      presentes: 12,
      visitantes: 2,
      observacoes: "Visitantes confirmaram retorno na próxima reunião.",
    },
    create: {
      id: "seed-reuniao-2025-10-03",
      celulaId: celulaVida.id,
      data: new Date("2025-10-03T23:00:00Z"),
      tema: "O Poder da Oração em Unidade",
      presentes: 12,
      visitantes: 2,
      observacoes: "Visitantes confirmaram retorno na próxima reunião.",
    },
  });

  await prisma.reuniaoCelula.upsert({
    where: { id: "seed-reuniao-2025-10-18" },
    update: {
      tema: "Famílias em missão",
      presentes: 10,
      visitantes: 1,
      observacoes: "Família visitante interessada em aderir ao grupo.",
    },
    create: {
      id: "seed-reuniao-2025-10-18",
      celulaId: celulaFamilia.id,
      data: new Date("2025-10-18T22:00:00Z"),
      tema: "Famílias em missão",
      presentes: 10,
      visitantes: 1,
      observacoes: "Família visitante interessada em aderir ao grupo.",
    },
  });

  await prisma.reuniaoCelula.upsert({
    where: { id: "seed-reuniao-2025-10-24" },
    update: {
      tema: "Multiplicação de células na Zona Norte",
      presentes: 14,
      visitantes: 4,
      observacoes: "Equipe alinhada para abertura de nova frente em 2026.",
    },
    create: {
      id: "seed-reuniao-2025-10-24",
      celulaId: celulaExpansao.id,
      data: new Date("2025-10-24T21:00:00Z"),
      tema: "Multiplicação de células na Zona Norte",
      presentes: 14,
      visitantes: 4,
      observacoes: "Equipe alinhada para abertura de nova frente em 2026.",
    },
  });

  await prisma.devocional.upsert({
    where: { id: "seed-devocional-2025-10-12" },
    update: {
      titulo: "Confiança em Deus",
      versiculoReferencia: "Salmo 27:1",
      versiculoTexto: "O Senhor é a minha luz e a minha salvação; de quem terei medo?",
      conteudo:
        "Incentive a célula a colocar diante de Deus os desafios da semana e a confiar que Ele cuida de cada detalhe.",
      ativo: true,
    },
    create: {
      id: "seed-devocional-2025-10-12",
      titulo: "Confiança em Deus",
      versiculoReferencia: "Salmo 27:1",
      versiculoTexto: "O Senhor é a minha luz e a minha salvação; de quem terei medo?",
      conteudo:
        "Incentive a célula a colocar diante de Deus os desafios da semana e a confiar que Ele cuida de cada detalhe.",
      dataDevocional: new Date("2025-10-12T00:00:00Z"),
      ativo: true,
    },
  });

  await prisma.devocional.upsert({
    where: { id: "seed-devocional-2025-10-13" },
    update: {
      titulo: "Unidade em oração",
      versiculoReferencia: "Atos 4:31",
      versiculoTexto: "Tendo eles orado, tremeu o lugar em que estavam reunidos.",
      conteudo:
        "Estimule os membros a formarem duplas de oração ao longo da semana para fortalecer os laços de discipulado.",
      ativo: true,
    },
    create: {
      id: "seed-devocional-2025-10-13",
      titulo: "Unidade em oração",
      versiculoReferencia: "Atos 4:31",
      versiculoTexto: "Tendo eles orado, tremeu o lugar em que estavam reunidos.",
      conteudo:
        "Estimule os membros a formarem duplas de oração ao longo da semana para fortalecer os laços de discipulado.",
      dataDevocional: new Date("2025-10-13T00:00:00Z"),
      ativo: true,
    },
  });

  await prisma.aviso.upsert({
    where: { id: "seed-aviso-geral" },
    update: {
      titulo: "Encontro de líderes",
      conteudo:
        "Reunião estratégica com todos os líderes de célula para alinhar metas do próximo trimestre.",
      prioridade: PrioridadeAviso.ALTA,
      dataFim: new Date("2025-10-20T12:00:00Z"),
      ativo: true,
    },
    create: {
      id: "seed-aviso-geral",
      titulo: "Encontro de líderes",
      conteudo:
        "Reunião estratégica com todos os líderes de célula para alinhar metas do próximo trimestre.",
      tipo: TipoAviso.GERAL,
      prioridade: PrioridadeAviso.ALTA,
      igrejaId: igrejaCentral.id,
      dataInicio: new Date("2025-10-10T12:00:00Z"),
      dataFim: new Date("2025-10-20T12:00:00Z"),
      ativo: true,
      usuarioId: pastor.id,
    },
  });

  await prisma.aviso.upsert({
    where: { id: "seed-aviso-celula" },
    update: {
      prioridade: PrioridadeAviso.NORMAL,
      dataFim: new Date("2025-10-22T23:00:00Z"),
      ativo: true,
    },
    create: {
      id: "seed-aviso-celula",
      titulo: "Treinamento para auxiliares",
      conteudo:
        "Auxiliares devem participar do treinamento prático nesta semana para apoiar as multiplicações.",
      tipo: TipoAviso.INFORMATIVO,
      prioridade: PrioridadeAviso.NORMAL,
      igrejaId: igrejaCentral.id,
      celulaId: celulaFamilia.id,
      usuarioId: supervisor.id,
      dataInicio: new Date("2025-10-15T18:00:00Z"),
      dataFim: new Date("2025-10-22T23:00:00Z"),
      ativo: true,
    },
  });

  const trilhaFundamentos = await prisma.trilhaCrescimento.upsert({
    where: { id: "seed-trilha-fundamentos" },
    update: {
      titulo: "Fundamentos da Fé",
      descricao: "Trilha inicial para novos discípulos compreenderem os pilares da igreja.",
      requisitos: "Participar de 4 encontros sequenciais e realizar devocionais semanais.",
      ativa: true,
      conteudo: {
        etapas: [
          { ordem: 1, titulo: "Novo nascimento", duracaoDias: 7 },
          { ordem: 2, titulo: "Vida devocional", duracaoDias: 7 },
          { ordem: 3, titulo: "Comunhão", duracaoDias: 7 },
          { ordem: 4, titulo: "Serviço", duracaoDias: 7 },
        ],
      },
    },
    create: {
      id: "seed-trilha-fundamentos",
      ordem: 1,
      titulo: "Fundamentos da Fé",
      descricao: "Trilha inicial para novos discípulos compreenderem os pilares da igreja.",
      tipo: TipoTrilha.CURSO,
      duracaoDias: 28,
      requisitos: "Participar de 4 encontros sequenciais e realizar devocionais semanais.",
      ativa: true,
      conteudo: {
        etapas: [
          { ordem: 1, titulo: "Novo nascimento", duracaoDias: 7 },
          { ordem: 2, titulo: "Vida devocional", duracaoDias: 7 },
          { ordem: 3, titulo: "Comunhão", duracaoDias: 7 },
          { ordem: 4, titulo: "Serviço", duracaoDias: 7 },
        ],
      },
    },
  });

  const trilhaLideranca = await prisma.trilhaCrescimento.upsert({
    where: { id: "seed-trilha-lideranca" },
    update: {
      titulo: "Formação de Líderes",
      descricao: "Trilha avançada para preparar novos líderes de célula.",
      duracaoDias: 42,
      ativa: true,
    },
    create: {
      id: "seed-trilha-lideranca",
      ordem: 2,
      titulo: "Formação de Líderes",
      descricao: "Trilha avançada para preparar novos líderes de célula.",
      tipo: TipoTrilha.CERTIFICACAO,
      duracaoDias: 42,
      requisitos: "Concluir a trilha Fundamentos da Fé.",
      ativa: true,
      conteudo: {
        etapas: [
          { ordem: 1, titulo: "Chamado pastoral", duracaoDias: 14 },
          { ordem: 2, titulo: "Gestão de célula", duracaoDias: 14 },
          { ordem: 3, titulo: "Multiplicação", duracaoDias: 14 },
        ],
      },
    },
  });

  const areaCentral = await prisma.areaSupervisaoTrilha.upsert({
    where: { id: "seed-area-trilha-central" },
    update: {
      nome: "Área Central de Crescimento",
      descricao: "Área responsável por acompanhar as trilhas da igreja central.",
      ativa: true,
    },
    create: {
      id: "seed-area-trilha-central",
      nome: "Área Central de Crescimento",
      descricao: "Área responsável por acompanhar as trilhas da igreja central.",
      supervisorId: supervisor.id,
      igrejaId: igrejaCentral.id,
      ativa: true,
    },
  });

  const areaZonaNorte = await prisma.areaSupervisaoTrilha.upsert({
    where: { id: "seed-area-trilha-norte" },
    update: {
      nome: "Área Norte de Crescimento",
      descricao: "Acompanha os processos de formação na Zona Norte.",
      ativa: true,
    },
    create: {
      id: "seed-area-trilha-norte",
      nome: "Área Norte de Crescimento",
      descricao: "Acompanha os processos de formação na Zona Norte.",
      supervisorId: supervisorZonaNorte.id,
      igrejaId: igrejaZonaNorte.id,
      ativa: true,
    },
  });

  await prisma.etapaAreaSupervisao.upsert({
    where: { id: "seed-etapa-central-fundamentos" },
    update: {
      podeAprovar: true,
    },
    create: {
      id: "seed-etapa-central-fundamentos",
      areaId: areaCentral.id,
      trilhaId: trilhaFundamentos.id,
      podeAprovar: true,
    },
  });

  await prisma.etapaAreaSupervisao.upsert({
    where: { id: "seed-etapa-central-lideranca" },
    update: {
      podeAprovar: true,
    },
    create: {
      id: "seed-etapa-central-lideranca",
      areaId: areaCentral.id,
      trilhaId: trilhaLideranca.id,
      podeAprovar: true,
    },
  });

  await prisma.usuarioTrilha.upsert({
    where: { id: "seed-usuario-trilha-discipulo" },
    update: {
      etapaAtual: 2,
      concluido: false,
    },
    create: {
      id: "seed-usuario-trilha-discipulo",
      usuarioId: discipulo.id,
      trilhaId: trilhaFundamentos.id,
      etapaAtual: 2,
      concluido: false,
      dataInicio: new Date("2025-09-20T12:00:00Z"),
    },
  });

  await prisma.usuarioTrilha.upsert({
    where: { id: "seed-usuario-trilha-lider" },
    update: {
      etapaAtual: 3,
      concluido: false,
    },
    create: {
      id: "seed-usuario-trilha-lider",
      usuarioId: liderFamilia.id,
      trilhaId: trilhaLideranca.id,
      etapaAtual: 3,
      concluido: false,
      dataInicio: new Date("2025-08-01T18:00:00Z"),
    },
  });

  await prisma.solicitacaoAvancoTrilha.upsert({
    where: { id: "seed-solicitacao-discipulo" },
    update: {
      status: StatusSolicitacao.PENDENTE,
      observacoesLider: "Discípula demonstrou comprometimento consistente.",
    },
    create: {
      id: "seed-solicitacao-discipulo",
      usuarioId: discipulo.id,
      trilhaId: trilhaFundamentos.id,
      liderSolicitanteId: liderFamilia.id,
      areaSupervisaoId: areaCentral.id,
      motivo: "Avanço para a etapa 3 após conclusão das tarefas devocionais.",
      observacoesLider: "Discípula demonstrou comprometimento consistente.",
      status: StatusSolicitacao.PENDENTE,
      dataSolicitacao: new Date("2025-10-09T13:00:00Z"),
    },
  });

  await prisma.solicitacaoAvancoTrilha.upsert({
    where: { id: "seed-solicitacao-lider" },
    update: {
      status: StatusSolicitacao.APROVADA,
      supervisorResponsavelId: supervisor.id,
      dataResposta: new Date("2025-10-05T14:00:00Z"),
      observacoesSupervisor: "Líder completa treinamento com excelência.",
    },
    create: {
      id: "seed-solicitacao-lider",
      usuarioId: liderFamilia.id,
      trilhaId: trilhaLideranca.id,
      liderSolicitanteId: pastor.id,
      areaSupervisaoId: areaCentral.id,
      motivo: "Preparar líder para multiplicação da célula família.",
      status: StatusSolicitacao.APROVADA,
      dataSolicitacao: new Date("2025-09-20T10:30:00Z"),
      dataResposta: new Date("2025-10-05T14:00:00Z"),
      supervisorResponsavelId: supervisor.id,
      observacoesSupervisor: "Líder completa treinamento com excelência.",
    },
  });

  await prisma.landingPageConfig.upsert({
    where: { id: "seed-landing-hero-title" },
    update: {
      valor: "Transforme sua rede de células em uma comunidade vibrante.",
    },
    create: {
      id: "seed-landing-hero-title",
      secao: "hero",
      chave: "headline",
      valor: "Transforme sua rede de células em uma comunidade vibrante.",
      tipo: "text",
    },
  });

  await prisma.landingPageConfig.upsert({
    where: { id: "seed-landing-hero-cta" },
    update: {
      valor: "Comece agora o período de avaliação",
    },
    create: {
      id: "seed-landing-hero-cta",
      secao: "hero",
      chave: "cta_label",
      valor: "Comece agora o período de avaliação",
      tipo: "text",
    },
  });

  await prisma.configuracaoSistema.upsert({
    where: { chave: "trial_dias" },
    update: {
      valor: "30",
      descricao: "Quantidade padrão de dias de avaliação após aprovação da igreja.",
    },
    create: {
      id: "seed-config-trial-dias",
      chave: "trial_dias",
      valor: "30",
      categoria: "assinaturas",
      descricao: "Quantidade padrão de dias de avaliação após aprovação da igreja.",
      tipoCampo: "number",
    },
  });

  await prisma.configuracaoSistema.upsert({
    where: { chave: "suporte_email" },
    update: {
      valor: "suporte@celulaconnect.com",
    },
    create: {
      id: "seed-config-suporte-email",
      chave: "suporte_email",
      valor: "suporte@celulaconnect.com",
      categoria: "comunicacao",
      descricao: "Canal oficial de suporte para pastores.",
      tipoCampo: "text",
    },
  });

  const livroGenesis = await prisma.livroBiblia.upsert({
    where: { id: "seed-livro-genesis" },
    update: {
      nome: "Gênesis",
      abreviacao: "Gn",
      capitulos: 50,
    },
    create: {
      id: "seed-livro-genesis",
      codigo: "GEN",
      nome: "Gênesis",
      abreviacao: "Gn",
      testamento: Testamento.AT,
      ordem: 1,
      capitulos: 50,
    },
  });

  const livroJoao = await prisma.livroBiblia.upsert({
    where: { id: "seed-livro-joao" },
    update: {
      nome: "João",
      abreviacao: "Jo",
      capitulos: 21,
    },
    create: {
      id: "seed-livro-joao",
      codigo: "JOA",
      nome: "João",
      abreviacao: "Jo",
      testamento: Testamento.NT,
      ordem: 43,
      capitulos: 21,
    },
  });

  const genesisCapitulo1 = await prisma.capituloBiblia.upsert({
    where: { id: "seed-capitulo-gen-1" },
    update: {
      titulo: "A Criação",
      texto:
        "No princípio, Deus criou os céus e a terra. A terra era sem forma e vazia...",
      versiculos: 3,
    },
    create: {
      id: "seed-capitulo-gen-1",
      livroId: livroGenesis.id,
      numero: 1,
      titulo: "A Criação",
      texto:
        "No princípio, Deus criou os céus e a terra. A terra era sem forma e vazia...",
      versiculos: 3,
    },
  });

  const joaoCapitulo1 = await prisma.capituloBiblia.upsert({
    where: { id: "seed-capitulo-jo-1" },
    update: {
      titulo: "O Verbo",
      texto:
        "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus...",
      versiculos: 3,
    },
    create: {
      id: "seed-capitulo-jo-1",
      livroId: livroJoao.id,
      numero: 1,
      titulo: "O Verbo",
      texto:
        "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus...",
      versiculos: 3,
    },
  });

  await prisma.versiculoBiblia.upsert({
    where: { id: "seed-versiculo-gen-1-1" },
    update: {
      texto: "No princípio Deus criou os céus e a terra.",
    },
    create: {
      id: "seed-versiculo-gen-1-1",
      capituloId: genesisCapitulo1.id,
      numero: 1,
      texto: "No princípio Deus criou os céus e a terra.",
    },
  });

  await prisma.versiculoBiblia.upsert({
    where: { id: "seed-versiculo-gen-1-2" },
    update: {
      texto: "A terra era sem forma e vazia; trevas cobriam a face do abismo.",
    },
    create: {
      id: "seed-versiculo-gen-1-2",
      capituloId: genesisCapitulo1.id,
      numero: 2,
      texto: "A terra era sem forma e vazia; trevas cobriam a face do abismo.",
    },
  });

  await prisma.versiculoBiblia.upsert({
    where: { id: "seed-versiculo-gen-1-3" },
    update: {
      texto: "Disse Deus: \"Haja luz\", e houve luz.",
    },
    create: {
      id: "seed-versiculo-gen-1-3",
      capituloId: genesisCapitulo1.id,
      numero: 3,
      texto: "Disse Deus: \"Haja luz\", e houve luz.",
    },
  });

  await prisma.versiculoBiblia.upsert({
    where: { id: "seed-versiculo-jo-1-1" },
    update: {
      texto: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
    },
    create: {
      id: "seed-versiculo-jo-1-1",
      capituloId: joaoCapitulo1.id,
      numero: 1,
      texto: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
    },
  });

  await prisma.versiculoBiblia.upsert({
    where: { id: "seed-versiculo-jo-1-2" },
    update: {
      texto: "Ele estava no princípio com Deus.",
    },
    create: {
      id: "seed-versiculo-jo-1-2",
      capituloId: joaoCapitulo1.id,
      numero: 2,
      texto: "Ele estava no princípio com Deus.",
    },
  });

  await prisma.versiculoBiblia.upsert({
    where: { id: "seed-versiculo-jo-1-3" },
    update: {
      texto: "Todas as coisas foram feitas por intermédio dele; sem ele nada do que existe teria sido feito.",
    },
    create: {
      id: "seed-versiculo-jo-1-3",
      capituloId: joaoCapitulo1.id,
      numero: 3,
      texto:
        "Todas as coisas foram feitas por intermédio dele; sem ele nada do que existe teria sido feito.",
    },
  });

  const metaLeituraIgreja = await prisma.metaLeitura.upsert({
    where: { id: "seed-meta-leitura-anual" },
    update: {
      descricao: "Plano anual de leitura em família com foco nos primeiros livros.",
      ativa: true,
    },
    create: {
      id: "seed-meta-leitura-anual",
      titulo: "Meta Anual de Leitura",
      descricao: "Plano anual de leitura em família com foco nos primeiros livros.",
      criadoPor: pastor.id,
      igrejaId: igrejaCentral.id,
      celulaId: celulaFamilia.id,
      tipoMeta: TipoMeta.CAPITULOS,
      valorMeta: 52,
      unidade: UnidadeTempo.SEMANA,
      periodo: "2025",
      dataInicio: new Date("2025-01-01T00:00:00Z"),
      dataFim: new Date("2025-12-31T23:59:59Z"),
      ativa: true,
    },
  });

  const metaUsuarioLider = await prisma.metaLeituraUsuario.upsert({
    where: { id: "seed-meta-usuario-lider" },
    update: {
      progressoAtual: 3,
      ultimaAtualizacao: new Date("2025-10-05T12:00:00Z"),
    },
    create: {
      id: "seed-meta-usuario-lider",
      metaId: metaLeituraIgreja.id,
      usuarioId: liderFamilia.id,
      atribuidaPor: pastor.id,
      ativa: true,
      progressoAtual: 3,
      ultimaAtualizacao: new Date("2025-10-05T12:00:00Z"),
    },
  });

  await prisma.progressoAutomaticoMeta.upsert({
    where: { id: "seed-progresso-meta-lider-gen" },
    update: {
      tempoLeitura: 18,
    },
    create: {
      id: "seed-progresso-meta-lider-gen",
      metaUsuarioId: metaUsuarioLider.id,
      livroCodigo: livroGenesis.codigo,
      capitulo: 1,
      dataLeitura: new Date("2025-10-03T00:00:00Z"),
      tempoLeitura: 18,
      percentualConcluido: 100,
      contribuiuMeta: true,
    },
  });

  await prisma.progressoAutomaticoMeta.upsert({
    where: { id: "seed-progresso-meta-lider-jo" },
    update: {
      tempoLeitura: 12,
    },
    create: {
      id: "seed-progresso-meta-lider-jo",
      metaUsuarioId: metaUsuarioLider.id,
      livroCodigo: livroJoao.codigo,
      capitulo: 1,
      dataLeitura: new Date("2025-10-10T00:00:00Z"),
      tempoLeitura: 12,
      percentualConcluido: 100,
      contribuiuMeta: true,
    },
  });

  await prisma.leituraRegistro.upsert({
    where: { id: "seed-leitura-lider-gen" },
    update: {
      tempoLeitura: 18,
      observacoes: "Compartilhado com a família durante a célula.",
    },
    create: {
      id: "seed-leitura-lider-gen",
      usuarioId: liderFamilia.id,
      livroCodigo: livroGenesis.codigo,
      capitulo: 1,
      dataLeitura: new Date("2025-10-03T00:00:00Z"),
      tempoLeitura: 18,
      observacoes: "Compartilhado com a família durante a célula.",
      metaId: metaLeituraIgreja.id,
    },
  });

  await prisma.leituraRegistro.upsert({
    where: { id: "seed-leitura-lider-jo" },
    update: {
      tempoLeitura: 12,
    },
    create: {
      id: "seed-leitura-lider-jo",
      usuarioId: liderFamilia.id,
      livroCodigo: livroJoao.codigo,
      capitulo: 1,
      dataLeitura: new Date("2025-10-10T00:00:00Z"),
      tempoLeitura: 12,
      observacoes: "Texto usado na devocional semanal.",
      metaId: metaLeituraIgreja.id,
    },
  });

  console.log("✅ Seeds de células criadas com sucesso.");
  console.log(
    `Igrejas seeds: ${igrejaCentral.nome}, ${igrejaZonaNorte.nome}`,
  );
  console.log(
    `Células seeds: ${celulaVida.nome}, ${celulaFamilia.nome}, ${celulaExpansao.nome}`,
  );
  console.log(
    `Livros bíblicos seeds: ${livroGenesis.nome}, ${livroJoao.nome}`,
  );
  console.log(
    `Metas de leitura seeds: ${metaLeituraIgreja.titulo}`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Erro ao executar seeds de células:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
