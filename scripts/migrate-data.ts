import path from "node:path";
import { readFile } from "node:fs/promises";
import {
  PrismaClient,
  PerfilUsuario,
  CargoCelula,
  StatusAssinatura,
  TipoAviso,
  PrioridadeAviso,
  TipoTrilha,
  StatusSolicitacao,
  Testamento,
  TipoMeta,
  UnidadeTempo,
} from "../prisma/generated/client";

type Nullable<T> = T | null | undefined;

interface DomainSeed {
  generatedAt?: string;
  igrejas?: Array<Record<string, any>>;
  usuarios?: Array<Record<string, any>>;
  celulas?: Array<Record<string, any>>;
  redes?: Array<Record<string, any>>;
  membros?: Array<Record<string, any>>;
  convites?: Array<Record<string, any>>;
  reunioes?: Array<Record<string, any>>;
  devocionais?: Array<Record<string, any>>;
  avisos?: Array<Record<string, any>>;
  trilhas?: Array<Record<string, any>>;
  areasSupervisao?: Array<Record<string, any>>;
  usuariosTrilha?: Array<Record<string, any>>;
  solicitacoesTrilha?: Array<Record<string, any>>;
  landingPageConfig?: Array<Record<string, any>>;
  configuracoesSistema?: Array<Record<string, any>>;
  livrosBiblia?: Array<Record<string, any>>;
  capitulosBiblia?: Array<Record<string, any>>;
  versiculosBiblia?: Array<Record<string, any>>;
  metasLeitura?: Array<Record<string, any>>;
  metaLeituraUsuarios?: Array<Record<string, any>>;
  progressoAutomaticoMetas?: Array<Record<string, any>>;
  leituras?: Array<Record<string, any>>;
}

const prisma = new PrismaClient();
const DEFAULT_DATA_PATH = process.env.OLD_DB_EXPORT
  ? path.resolve(process.cwd(), process.env.OLD_DB_EXPORT)
  : path.resolve(process.cwd(), "tests/fixtures/domain-seed.json");
const DEFAULT_TIMESTAMP = new Date("2025-01-01T00:00:00Z");

function parseDate(value: Nullable<string>, fallback: Date = DEFAULT_TIMESTAMP): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function ensureString(value: Nullable<string>, fallback: string): string {
  if (!value) return fallback;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : fallback;
}

function ensureNumber(value: Nullable<number>, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapEnum<
  TEnum extends Record<string, string | number>,
  TReturn = TEnum[keyof TEnum]
>(enumObj: TEnum, value: Nullable<string>, fallback: TReturn): TReturn {
  if (!value) return fallback;
  const normalized = value.replaceAll("-", "_").replaceAll(" ", "_").toUpperCase();
  if (normalized in enumObj) {
    return enumObj[normalized as keyof TEnum] as TReturn;
  }
  return fallback;
}

async function upsertPlanos(data: DomainSeed) {
  const planoIds = new Set<string>();
  data.igrejas?.forEach((igreja) => {
    if (igreja.planoId) planoIds.add(String(igreja.planoId));
  });

  for (const planoId of planoIds) {
    await prisma.plano.upsert({
      where: { id: planoId },
      update: {},
      create: {
        id: planoId,
        nome: ensureString(planoId, `Plano ${planoId}`),
        descricao: "Plano migrado automaticamente",
        ativo: true,
        trialDias: 30,
      },
    });
  }
}

async function upsertIgrejas(data: DomainSeed) {
  if (!data.igrejas) return;

  for (const igreja of data.igrejas) {
    await prisma.igreja.upsert({
      where: { id: String(igreja.id) },
      update: {
        nome: ensureString(igreja.nome, `Igreja ${igreja.id}`),
        cidade: ensureString(igreja.cidade, "Cidade"),
        estado: ensureString(igreja.estado, "SP"),
        telefone: igreja.telefone ?? null,
        email: igreja.email ?? null,
        cnpj: igreja.cnpj ?? null,
        enderecoCompleto: igreja.enderecoCompleto ?? null,
        statusAssinatura: mapEnum(StatusAssinatura, igreja.statusAssinatura, StatusAssinatura.TRIAL),
        planoId: igreja.planoId ?? null,
        observacoesAdmin: igreja.observacoesAdmin ?? null,
        pastorPrincipalId: igreja.pastorPrincipalId ?? null,
        trialInicio: igreja.trialInicio ? parseDate(igreja.trialInicio) : null,
        trialFim: igreja.trialFim ? parseDate(igreja.trialFim) : null,
        dataAssinatura: igreja.dataAssinatura ? parseDate(igreja.dataAssinatura) : null,
        dataVencimento: igreja.dataVencimento ? parseDate(igreja.dataVencimento) : null,
      },
      create: {
        id: String(igreja.id),
        nome: ensureString(igreja.nome, `Igreja ${igreja.id}`),
        cidade: ensureString(igreja.cidade, "Cidade"),
        estado: ensureString(igreja.estado, "SP"),
        telefone: igreja.telefone ?? null,
        email: igreja.email ?? null,
        cnpj: igreja.cnpj ?? null,
        enderecoCompleto: igreja.enderecoCompleto ?? null,
        statusAssinatura: mapEnum(StatusAssinatura, igreja.statusAssinatura, StatusAssinatura.TRIAL),
        planoId: igreja.planoId ?? null,
        observacoesAdmin: igreja.observacoesAdmin ?? null,
        pastorPrincipalId: igreja.pastorPrincipalId ?? null,
        trialInicio: igreja.trialInicio ? parseDate(igreja.trialInicio) : null,
        trialFim: igreja.trialFim ? parseDate(igreja.trialFim) : null,
        dataAssinatura: igreja.dataAssinatura ? parseDate(igreja.dataAssinatura) : null,
        dataVencimento: igreja.dataVencimento ? parseDate(igreja.dataVencimento) : null,
      },
    });
  }
}

async function upsertUsuarios(data: DomainSeed) {
  if (!data.usuarios) return;

  for (const usuario of data.usuarios) {
    await prisma.usuario.upsert({
      where: { id: String(usuario.id) },
      update: {
        nome: ensureString(usuario.nome, `Usuário ${usuario.id}`),
        email: ensureString(usuario.email, `${usuario.id}@migracao.local`),
        perfil: mapEnum(PerfilUsuario, usuario.perfil, PerfilUsuario.DISCIPULO),
        telefone: usuario.telefone ?? null,
        ativo: usuario.ativo ?? true,
        igrejaId: usuario.igrejaId ?? null,
        dataPrimeiroAcesso: usuario.dataPrimeiroAcesso ? parseDate(usuario.dataPrimeiroAcesso) : null,
        ultimoAcesso: usuario.ultimoAcesso ? parseDate(usuario.ultimoAcesso) : null,
      },
      create: {
        id: String(usuario.id),
        clerkUserId: ensureString(usuario.clerkUserId, `migrado_${usuario.id}`),
        nome: ensureString(usuario.nome, `Usuário ${usuario.id}`),
        email: ensureString(usuario.email, `${usuario.id}@migracao.local`),
        telefone: usuario.telefone ?? null,
        perfil: mapEnum(PerfilUsuario, usuario.perfil, PerfilUsuario.DISCIPULO),
        igrejaId: usuario.igrejaId ?? null,
        ativo: usuario.ativo ?? true,
        dataPrimeiroAcesso: usuario.dataPrimeiroAcesso ? parseDate(usuario.dataPrimeiroAcesso) : null,
        ultimoAcesso: usuario.ultimoAcesso ? parseDate(usuario.ultimoAcesso) : null,
      },
    });
  }
}

async function upsertRedes(data: DomainSeed) {
  if (!data.redes) return;

  for (const rede of data.redes) {
    await prisma.rede.upsert({
      where: { id: String(rede.id) },
      update: {
        nome: ensureString(rede.nome, `Rede ${rede.id}`),
        supervisorId:
          rede.supervisorId ??
          data.usuarios?.find((user) => user.perfil === "SUPERVISOR")?.id ??
          data.usuarios?.[0]?.id ??
          "seed-user-supervisor",
        igrejaId: rede.igrejaId ?? data.igrejas?.[0]?.id ?? "seed-igreja",
        cor: rede.cor ?? "#2563EB",
        ativa: rede.ativa ?? true,
      },
      create: {
        id: String(rede.id),
        nome: ensureString(rede.nome, `Rede ${rede.id}`),
        supervisorId: ensureString(rede.supervisorId, data.usuarios?.[0]?.id ?? "seed-user-supervisor"),
        igrejaId: ensureString(rede.igrejaId, data.igrejas?.[0]?.id ?? "seed-igreja"),
        cor: rede.cor ?? "#2563EB",
        ativa: rede.ativa ?? true,
      },
    });
  }
}

async function upsertCelulas(data: DomainSeed) {
  if (!data.celulas) return;

  for (const celula of data.celulas) {
    const fallbackIgreja = data.igrejas?.[0]?.id ?? "seed-igreja";
    const fallbackLider = data.usuarios?.find((user) => user.perfil === "LIDER_CELULA")?.id ?? data.usuarios?.[0]?.id;

    if (!celula.liderId && !fallbackLider) {
      console.warn(`⚠️  Celula ${celula.id} ignorada: nenhum líder disponível`);
      continue;
    }

    await prisma.celula.upsert({
      where: { id: String(celula.id) },
      update: {
        nome: ensureString(celula.nome, `Célula ${celula.id}`),
        liderId: celula.liderId ?? fallbackLider,
        supervisorId: celula.supervisorId ?? null,
        igrejaId: celula.igrejaId ?? fallbackIgreja,
        redeId: celula.redeId ?? null,
        diaSemana: ensureString(celula.diaSemana, "Quinta-feira"),
        horario: ensureString(celula.horario, "20:00"),
        endereco: celula.endereco ?? null,
        ativa: celula.ativa ?? true,
        metaMembros: ensureNumber(celula.metaMembros, 12),
        dataInauguracao: celula.dataInauguracao ? parseDate(celula.dataInauguracao) : null,
        proximaReuniao: celula.proximaReuniao ? parseDate(celula.proximaReuniao) : null,
      },
      create: {
        id: String(celula.id),
        nome: ensureString(celula.nome, `Célula ${celula.id}`),
        liderId: celula.liderId ?? fallbackLider,
        supervisorId: celula.supervisorId ?? null,
        igrejaId: celula.igrejaId ?? fallbackIgreja,
        redeId: celula.redeId ?? null,
        diaSemana: ensureString(celula.diaSemana, "Quinta-feira"),
        horario: ensureString(celula.horario, "20:00"),
        endereco: celula.endereco ?? null,
        ativa: celula.ativa ?? true,
        metaMembros: ensureNumber(celula.metaMembros, 12),
        dataInauguracao: celula.dataInauguracao ? parseDate(celula.dataInauguracao) : null,
        proximaReuniao: celula.proximaReuniao ? parseDate(celula.proximaReuniao) : null,
      },
    });
  }
}

async function upsertMembrosCelula(data: DomainSeed) {
  if (!data.membros) return;

  for (const membro of data.membros) {
    const celulaId = membro.celulaId ?? data.celulas?.[0]?.id;
    const usuarioId = membro.usuarioId ?? data.usuarios?.[0]?.id;

    if (!celulaId || !usuarioId) {
      console.warn(`⚠️  Membro ${membro.id} ignorado: célula ou usuário ausente`);
      continue;
    }

    await prisma.membroCelula.upsert({
      where: { id: String(membro.id) },
      update: {
        celulaId: String(celulaId),
        usuarioId: String(usuarioId),
        cargo: mapEnum(CargoCelula, membro.cargo, CargoCelula.MEMBRO),
        dataEntrada: membro.dataEntrada ? parseDate(membro.dataEntrada) : DEFAULT_TIMESTAMP,
        dataSaida: membro.dataSaida ? parseDate(membro.dataSaida) : null,
        ativo: membro.ativo ?? true,
      },
      create: {
        id: String(membro.id),
        celulaId: String(celulaId),
        usuarioId: String(usuarioId),
        cargo: mapEnum(CargoCelula, membro.cargo, CargoCelula.MEMBRO),
        dataEntrada: membro.dataEntrada ? parseDate(membro.dataEntrada) : DEFAULT_TIMESTAMP,
        dataSaida: membro.dataSaida ? parseDate(membro.dataSaida) : null,
        ativo: membro.ativo ?? true,
      },
    });
  }
}

async function upsertReunioes(data: DomainSeed) {
  if (!data.reunioes) return;

  for (const reuniao of data.reunioes) {
    const celulaId = reuniao.celulaId ?? data.celulas?.[0]?.id;
    if (!celulaId) continue;

    await prisma.reuniaoCelula.upsert({
      where: { id: String(reuniao.id) },
      update: {
        celulaId: String(celulaId),
        data: parseDate(reuniao.data),
        tema: reuniao.tema ?? null,
        presentes: ensureNumber(reuniao.presentes, 0),
        visitantes: ensureNumber(reuniao.visitantes, 0),
        observacoes: reuniao.observacoes ?? null,
      },
      create: {
        id: String(reuniao.id),
        celulaId: String(celulaId),
        data: parseDate(reuniao.data),
        tema: reuniao.tema ?? null,
        presentes: ensureNumber(reuniao.presentes, 0),
        visitantes: ensureNumber(reuniao.visitantes, 0),
        observacoes: reuniao.observacoes ?? null,
      },
    });
  }
}

async function upsertDevocionais(data: DomainSeed) {
  if (!data.devocionais) return;

  for (const devocional of data.devocionais) {
    await prisma.devocional.upsert({
      where: { id: String(devocional.id) },
      update: {
        titulo: ensureString(devocional.titulo, `Devocional ${devocional.id}`),
        versiculoReferencia: ensureString(devocional.versiculoReferencia, "Salmos 23:1"),
        versiculoTexto: ensureString(
          devocional.versiculoTexto,
          "O Senhor é o meu pastor; nada me faltará."
        ),
        conteudo: ensureString(
          devocional.conteudo,
          "Conteúdo migrado automaticamente – revise após a migração."
        ),
        dataDevocional: parseDate(devocional.dataDevocional),
        ativo: devocional.ativo ?? true,
      },
      create: {
        id: String(devocional.id),
        titulo: ensureString(devocional.titulo, `Devocional ${devocional.id}`),
        versiculoReferencia: ensureString(devocional.versiculoReferencia, "Salmos 23:1"),
        versiculoTexto: ensureString(
          devocional.versiculoTexto,
          "O Senhor é o meu pastor; nada me faltará."
        ),
        conteudo: ensureString(
          devocional.conteudo,
          "Conteúdo migrado automaticamente – revise após a migração."
        ),
        dataDevocional: parseDate(devocional.dataDevocional),
        ativo: devocional.ativo ?? true,
      },
    });
  }
}

async function upsertAvisos(data: DomainSeed) {
  if (!data.avisos) return;

  for (const aviso of data.avisos) {
    await prisma.aviso.upsert({
      where: { id: String(aviso.id) },
      update: {
        titulo: ensureString(aviso.titulo, `Aviso ${aviso.id}`),
        conteudo: ensureString(
          aviso.conteudo,
          "Conteúdo migrado automaticamente – personalize após a verificação."
        ),
        tipo: mapEnum(TipoAviso, aviso.tipo, TipoAviso.GERAL),
        prioridade: mapEnum(PrioridadeAviso, aviso.prioridade, PrioridadeAviso.NORMAL),
        igrejaId: aviso.igrejaId ?? null,
        celulaId: aviso.celulaId ?? null,
        usuarioId: aviso.usuarioId ?? null,
        dataInicio: parseDate(aviso.dataInicio),
        dataFim: aviso.dataFim ? parseDate(aviso.dataFim) : null,
        ativo: aviso.ativo ?? true,
      },
      create: {
        id: String(aviso.id),
        titulo: ensureString(aviso.titulo, `Aviso ${aviso.id}`),
        conteudo: ensureString(
          aviso.conteudo,
          "Conteúdo migrado automaticamente – personalize após a verificação."
        ),
        tipo: mapEnum(TipoAviso, aviso.tipo, TipoAviso.GERAL),
        prioridade: mapEnum(PrioridadeAviso, aviso.prioridade, PrioridadeAviso.NORMAL),
        igrejaId: aviso.igrejaId ?? null,
        celulaId: aviso.celulaId ?? null,
        usuarioId: aviso.usuarioId ?? null,
        dataInicio: parseDate(aviso.dataInicio),
        dataFim: aviso.dataFim ? parseDate(aviso.dataFim) : null,
        ativo: aviso.ativo ?? true,
      },
    });
  }
}

async function upsertConvites(data: DomainSeed) {
  if (!data.convites) return;

  for (const convite of data.convites) {
    await prisma.convite.upsert({
      where: { id: String(convite.id) },
      update: {
        celulaId: convite.celulaId ?? null,
        convidadoPorId: convite.convidadoPorId ?? null,
        emailConvidado: ensureString(
          convite.emailConvidado,
          `${convite.id}@convite.local`
        ),
        nomeConvidado: ensureString(convite.nomeConvidado, "Convidado"),
        cargo: mapEnum(CargoCelula, convite.cargo, CargoCelula.MEMBRO),
        tokenConvite: ensureString(convite.tokenConvite, `TOKEN-${convite.id}`),
        usado: convite.usado ?? false,
        usadoPorId: convite.usadoPorId ?? null,
        dataExpiracao: parseDate(
          convite.dataExpiracao,
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        ),
      },
      create: {
        id: String(convite.id),
        celulaId: convite.celulaId ?? null,
        convidadoPorId: convite.convidadoPorId ?? null,
        emailConvidado: ensureString(
          convite.emailConvidado,
          `${convite.id}@convite.local`
        ),
        nomeConvidado: ensureString(convite.nomeConvidado, "Convidado"),
        cargo: mapEnum(CargoCelula, convite.cargo, CargoCelula.MEMBRO),
        tokenConvite: ensureString(convite.tokenConvite, `TOKEN-${convite.id}`),
        usado: convite.usado ?? false,
        usadoPorId: convite.usadoPorId ?? null,
        dataExpiracao: parseDate(
          convite.dataExpiracao,
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        ),
      },
    });
  }
}

async function upsertTrilhas(data: DomainSeed) {
  if (!data.trilhas) return;

  for (const trilha of data.trilhas) {
    await prisma.trilhaCrescimento.upsert({
      where: { id: String(trilha.id) },
      update: {
        ordem: ensureNumber(trilha.ordem, 1),
        titulo: ensureString(trilha.titulo, `Trilha ${trilha.id}`),
        descricao: trilha.descricao ?? "Conteúdo migrado automaticamente.",
        tipo: mapEnum(TipoTrilha, trilha.tipo, TipoTrilha.CURSO),
        duracaoDias: ensureNumber(trilha.duracaoDias, 0),
        ativa: trilha.ativa ?? true,
        conteudo: trilha.conteudo ?? null,
      },
      create: {
        id: String(trilha.id),
        ordem: ensureNumber(trilha.ordem, 1),
        titulo: ensureString(trilha.titulo, `Trilha ${trilha.id}`),
        descricao: trilha.descricao ?? "Conteúdo migrado automaticamente.",
        tipo: mapEnum(TipoTrilha, trilha.tipo, TipoTrilha.CURSO),
        duracaoDias: ensureNumber(trilha.duracaoDias, 0),
        ativa: trilha.ativa ?? true,
        conteudo: trilha.conteudo ?? null,
      },
    });
  }
}

async function upsertAreasSupervisao(data: DomainSeed) {
  if (!data.areasSupervisao) return;

  const fallbackIgreja = data.igrejas?.[0]?.id ?? "seed-igreja";
  const fallbackSupervisor =
    data.usuarios?.find((user) => user.perfil === "SUPERVISOR")?.id ??
    data.usuarios?.[0]?.id ??
    "seed-user-supervisor";

  for (const area of data.areasSupervisao) {
    await prisma.areaSupervisaoTrilha.upsert({
      where: { id: String(area.id) },
      update: {
        nome: ensureString(area.nome, `Área ${area.id}`),
        descricao: area.descricao ?? null,
        supervisorId: area.supervisorId ?? fallbackSupervisor,
        igrejaId: area.igrejaId ?? fallbackIgreja,
        ativa: area.ativa ?? true,
      },
      create: {
        id: String(area.id),
        nome: ensureString(area.nome, `Área ${area.id}`),
        descricao: area.descricao ?? null,
        supervisorId: area.supervisorId ?? fallbackSupervisor,
        igrejaId: area.igrejaId ?? fallbackIgreja,
        ativa: area.ativa ?? true,
      },
    });
  }
}

async function upsertUsuariosTrilha(data: DomainSeed) {
  if (!data.usuariosTrilha) return;

  for (const registro of data.usuariosTrilha) {
    const usuarioId = registro.usuarioId ?? data.usuarios?.[0]?.id;
    const trilhaId = registro.trilhaId ?? data.trilhas?.[0]?.id;
    if (!usuarioId || !trilhaId) continue;

    await prisma.usuarioTrilha.upsert({
      where: { id: String(registro.id) },
      update: {
        usuarioId: String(usuarioId),
        trilhaId: String(trilhaId),
        etapaAtual: ensureNumber(registro.etapaAtual, 1),
        concluido: registro.concluido ?? false,
        dataInicio: registro.dataInicio ? parseDate(registro.dataInicio) : null,
        dataConclusao: registro.dataConclusao ? parseDate(registro.dataConclusao) : null,
      },
      create: {
        id: String(registro.id),
        usuarioId: String(usuarioId),
        trilhaId: String(trilhaId),
        etapaAtual: ensureNumber(registro.etapaAtual, 1),
        concluido: registro.concluido ?? false,
        dataInicio: registro.dataInicio ? parseDate(registro.dataInicio) : null,
        dataConclusao: registro.dataConclusao ? parseDate(registro.dataConclusao) : null,
      },
    });
  }
}

async function upsertSolicitacoesTrilha(data: DomainSeed) {
  if (!data.solicitacoesTrilha) return;

  for (const solicitacao of data.solicitacoesTrilha) {
    const usuarioId = solicitacao.usuarioId ?? data.usuarios?.[0]?.id;
    const trilhaId = solicitacao.trilhaId ?? data.trilhas?.[0]?.id;
    const areaId = solicitacao.areaSupervisaoId ?? data.areasSupervisao?.[0]?.id;
    const liderSolicitanteId = solicitacao.liderSolicitanteId ?? usuarioId;

    if (!usuarioId || !trilhaId || !areaId || !liderSolicitanteId) continue;

    await prisma.solicitacaoAvancoTrilha.upsert({
      where: { id: String(solicitacao.id) },
      update: {
        usuarioId: String(usuarioId),
        trilhaId: String(trilhaId),
        liderSolicitanteId: String(liderSolicitanteId),
        areaSupervisaoId: String(areaId),
        motivo: solicitacao.motivo ?? null,
        observacoesLider: solicitacao.observacoesLider ?? null,
        status: mapEnum(StatusSolicitacao, solicitacao.status, StatusSolicitacao.PENDENTE),
        dataSolicitacao: parseDate(solicitacao.dataSolicitacao),
        dataResposta: solicitacao.dataResposta ? parseDate(solicitacao.dataResposta) : null,
        supervisorResponsavelId: solicitacao.supervisorResponsavelId ?? null,
        observacoesSupervisor: solicitacao.observacoesSupervisor ?? null,
      },
      create: {
        id: String(solicitacao.id),
        usuarioId: String(usuarioId),
        trilhaId: String(trilhaId),
        liderSolicitanteId: String(liderSolicitanteId),
        areaSupervisaoId: String(areaId),
        motivo: solicitacao.motivo ?? null,
        observacoesLider: solicitacao.observacoesLider ?? null,
        status: mapEnum(StatusSolicitacao, solicitacao.status, StatusSolicitacao.PENDENTE),
        dataSolicitacao: parseDate(solicitacao.dataSolicitacao),
        dataResposta: solicitacao.dataResposta ? parseDate(solicitacao.dataResposta) : null,
        supervisorResponsavelId: solicitacao.supervisorResponsavelId ?? null,
        observacoesSupervisor: solicitacao.observacoesSupervisor ?? null,
      },
    });
  }
}

async function upsertLandingConfigs(data: DomainSeed) {
  if (!data.landingPageConfig) return;

  for (const entry of data.landingPageConfig) {
    await prisma.landingPageConfig.upsert({
      where: { id: String(entry.id) },
      update: {
        secao: ensureString(entry.secao, "hero"),
        chave: ensureString(entry.chave, `key_${entry.id}`),
        valor: ensureString(entry.valor, "Conteúdo migrado automaticamente."),
        tipo: ensureString(entry.tipo, "text"),
      },
      create: {
        id: String(entry.id),
        secao: ensureString(entry.secao, "hero"),
        chave: ensureString(entry.chave, `key_${entry.id}`),
        valor: ensureString(entry.valor, "Conteúdo migrado automaticamente."),
        tipo: ensureString(entry.tipo, "text"),
      },
    });
  }
}

async function upsertConfiguracoesSistema(data: DomainSeed) {
  if (!data.configuracoesSistema) return;

  for (const entry of data.configuracoesSistema) {
    await prisma.configuracaoSistema.upsert({
      where: { chave: ensureString(entry.chave, `config_${entry.id ?? Date.now()}`) },
      update: {
        valor: ensureString(entry.valor, "valor"),
        categoria: ensureString(entry.categoria, "geral"),
        descricao: entry.descricao ?? null,
        tipoCampo: entry.tipoCampo ?? "text",
      },
      create: {
        id: entry.id ? String(entry.id) : undefined,
        chave: ensureString(entry.chave, `config_${entry.id ?? Date.now()}`),
        valor: ensureString(entry.valor, "valor"),
        categoria: ensureString(entry.categoria, "geral"),
        descricao: entry.descricao ?? null,
        tipoCampo: entry.tipoCampo ?? "text",
      },
    });
  }
}

async function upsertLivrosBiblia(data: DomainSeed) {
  if (!data.livrosBiblia) return;

  for (const livro of data.livrosBiblia) {
    await prisma.livroBiblia.upsert({
      where: { id: String(livro.id) },
      update: {
        codigo: ensureString(livro.codigo, String(livro.id).toUpperCase()),
        nome: ensureString(livro.nome, `Livro ${livro.id}`),
        abreviacao: ensureString(livro.abreviacao, String(livro.id).slice(0, 3).toUpperCase()),
        testamento: mapEnum(Testamento, livro.testamento, Testamento.AT),
        ordem: ensureNumber(livro.ordem, 1),
        capitulos: ensureNumber(livro.capitulos, 1),
      },
      create: {
        id: String(livro.id),
        codigo: ensureString(livro.codigo, String(livro.id).toUpperCase()),
        nome: ensureString(livro.nome, `Livro ${livro.id}`),
        abreviacao: ensureString(livro.abreviacao, String(livro.id).slice(0, 3).toUpperCase()),
        testamento: mapEnum(Testamento, livro.testamento, Testamento.AT),
        ordem: ensureNumber(livro.ordem, 1),
        capitulos: ensureNumber(livro.capitulos, 1),
      },
    });
  }
}

async function upsertCapitulosBiblia(data: DomainSeed) {
  if (!data.capitulosBiblia) return;

  for (const capitulo of data.capitulosBiblia) {
    const livroId = capitulo.livroId ?? data.livrosBiblia?.[0]?.id;
    if (!livroId) continue;

    await prisma.capituloBiblia.upsert({
      where: { id: String(capitulo.id) },
      update: {
        livroId: String(livroId),
        numero: ensureNumber(capitulo.numero, 1),
        titulo: capitulo.titulo ?? null,
        texto: ensureString(
          capitulo.texto,
          "Conteúdo do capítulo migrado automaticamente – revisar após importação."
        ),
        versiculos: ensureNumber(capitulo.versiculos, 1),
      },
      create: {
        id: String(capitulo.id),
        livroId: String(livroId),
        numero: ensureNumber(capitulo.numero, 1),
        titulo: capitulo.titulo ?? null,
        texto: ensureString(
          capitulo.texto,
          "Conteúdo do capítulo migrado automaticamente – revisar após importação."
        ),
        versiculos: ensureNumber(capitulo.versiculos, 1),
      },
    });
  }
}

async function upsertVersiculosBiblia(data: DomainSeed) {
  if (!data.versiculosBiblia) return;

  for (const versiculo of data.versiculosBiblia) {
    const capituloId = versiculo.capituloId ?? data.capitulosBiblia?.[0]?.id;
    if (!capituloId) continue;

    await prisma.versiculoBiblia.upsert({
      where: { id: String(versiculo.id) },
      update: {
        capituloId: String(capituloId),
        numero: ensureNumber(versiculo.numero, 1),
        texto: ensureString(
          versiculo.texto,
          "Texto migrado automaticamente – substituir pelo conteúdo oficial."
        ),
      },
      create: {
        id: String(versiculo.id),
        capituloId: String(capituloId),
        numero: ensureNumber(versiculo.numero, 1),
        texto: ensureString(
          versiculo.texto,
          "Texto migrado automaticamente – substituir pelo conteúdo oficial."
        ),
      },
    });
  }
}

async function upsertMetasLeitura(data: DomainSeed) {
  if (!data.metasLeitura) return;

  const fallbackIgreja = data.igrejas?.[0]?.id ?? "seed-igreja";
  const fallbackUsuario =
    data.usuarios?.find((user) => user.perfil === "PASTOR")?.id ?? data.usuarios?.[0]?.id;

  for (const meta of data.metasLeitura) {
    await prisma.metaLeitura.upsert({
      where: { id: String(meta.id) },
      update: {
        titulo: ensureString(meta.titulo, `Meta ${meta.id}`),
        descricao: meta.descricao ?? null,
        criadoPor: ensureString(meta.criadoPor, fallbackUsuario ?? "seed-user"),
        igrejaId: meta.igrejaId ?? fallbackIgreja,
        celulaId: meta.celulaId ?? null,
        tipoMeta: mapEnum(TipoMeta, meta.tipoMeta, TipoMeta.CAPITULOS),
        valorMeta: ensureNumber(meta.valorMeta, 1),
        unidade: mapEnum(UnidadeTempo, meta.unidade, UnidadeTempo.SEMANA),
        periodo: ensureString(meta.periodo, "2025"),
        dataInicio: parseDate(meta.dataInicio),
        dataFim: parseDate(meta.dataFim, new Date("2025-12-31T23:59:59Z")),
        ativa: meta.ativa ?? true,
      },
      create: {
        id: String(meta.id),
        titulo: ensureString(meta.titulo, `Meta ${meta.id}`),
        descricao: meta.descricao ?? null,
        criadoPor: ensureString(meta.criadoPor, fallbackUsuario ?? "seed-user"),
        igrejaId: meta.igrejaId ?? fallbackIgreja,
        celulaId: meta.celulaId ?? null,
        tipoMeta: mapEnum(TipoMeta, meta.tipoMeta, TipoMeta.CAPITULOS),
        valorMeta: ensureNumber(meta.valorMeta, 1),
        unidade: mapEnum(UnidadeTempo, meta.unidade, UnidadeTempo.SEMANA),
        periodo: ensureString(meta.periodo, "2025"),
        dataInicio: parseDate(meta.dataInicio),
        dataFim: parseDate(meta.dataFim, new Date("2025-12-31T23:59:59Z")),
        ativa: meta.ativa ?? true,
      },
    });
  }
}

async function upsertMetaLeituraUsuarios(data: DomainSeed) {
  if (!data.metaLeituraUsuarios) return;

  for (const metaUsuario of data.metaLeituraUsuarios) {
    const metaId = metaUsuario.metaId ?? data.metasLeitura?.[0]?.id;
    const usuarioId = metaUsuario.usuarioId ?? data.usuarios?.[0]?.id;
    if (!metaId || !usuarioId) continue;

    await prisma.metaLeituraUsuario.upsert({
      where: { id: String(metaUsuario.id) },
      update: {
        metaId: String(metaId),
        usuarioId: String(usuarioId),
        atribuidaPor: ensureString(metaUsuario.atribuidaPor, usuarioId),
        ativa: metaUsuario.ativa ?? true,
        progressoAtual: ensureNumber(metaUsuario.progressoAtual, 0),
        ultimaAtualizacao: parseDate(metaUsuario.ultimaAtualizacao),
      },
      create: {
        id: String(metaUsuario.id),
        metaId: String(metaId),
        usuarioId: String(usuarioId),
        atribuidaPor: ensureString(metaUsuario.atribuidaPor, usuarioId),
        ativa: metaUsuario.ativa ?? true,
        progressoAtual: ensureNumber(metaUsuario.progressoAtual, 0),
        ultimaAtualizacao: parseDate(metaUsuario.ultimaAtualizacao),
      },
    });
  }
}

async function upsertProgressoAutomatico(data: DomainSeed) {
  if (!data.progressoAutomaticoMetas) return;

  for (const progresso of data.progressoAutomaticoMetas) {
    const metaUsuarioId = progresso.metaUsuarioId ?? data.metaLeituraUsuarios?.[0]?.id;
    if (!metaUsuarioId) continue;

    await prisma.progressoAutomaticoMeta.upsert({
      where: { id: String(progresso.id) },
      update: {
        metaUsuarioId: String(metaUsuarioId),
        livroCodigo: ensureString(progresso.livroCodigo, "GEN"),
        capitulo: ensureNumber(progresso.capitulo, 1),
        dataLeitura: parseDate(progresso.dataLeitura),
        tempoLeitura: ensureNumber(progresso.tempoLeitura, 10),
        percentualConcluido: progresso.percentualConcluido ?? 100,
        contribuiuMeta: progresso.contribuiuMeta ?? true,
      },
      create: {
        id: String(progresso.id),
        metaUsuarioId: String(metaUsuarioId),
        livroCodigo: ensureString(progresso.livroCodigo, "GEN"),
        capitulo: ensureNumber(progresso.capitulo, 1),
        dataLeitura: parseDate(progresso.dataLeitura),
        tempoLeitura: ensureNumber(progresso.tempoLeitura, 10),
        percentualConcluido: progresso.percentualConcluido ?? 100,
        contribuiuMeta: progresso.contribuiuMeta ?? true,
      },
    });
  }
}

async function upsertLeituras(data: DomainSeed) {
  if (!data.leituras) return;

  for (const leitura of data.leituras) {
    const usuarioId = leitura.usuarioId ?? data.usuarios?.[0]?.id;
    if (!usuarioId) continue;

    await prisma.leituraRegistro.upsert({
      where: { id: String(leitura.id) },
      update: {
        usuarioId: String(usuarioId),
        livroCodigo: ensureString(leitura.livroCodigo, "GEN"),
        capitulo: ensureNumber(leitura.capitulo, 1),
        dataLeitura: parseDate(leitura.dataLeitura),
        tempoLeitura: leitura.tempoLeitura ?? null,
        observacoes: leitura.observacoes ?? null,
        metaId: leitura.metaId ?? null,
      },
      create: {
        id: String(leitura.id),
        usuarioId: String(usuarioId),
        livroCodigo: ensureString(leitura.livroCodigo, "GEN"),
        capitulo: ensureNumber(leitura.capitulo, 1),
        dataLeitura: parseDate(leitura.dataLeitura),
        tempoLeitura: leitura.tempoLeitura ?? null,
        observacoes: leitura.observacoes ?? null,
        metaId: leitura.metaId ?? null,
      },
    });
  }
}

async function migrateFromSeed(dataPath: string) {
  console.info(`📦 Carregando export de domínio: ${dataPath}`);
  const buffer = await readFile(dataPath, "utf-8");
  const seed = JSON.parse(buffer) as DomainSeed;

  console.info("🚀 Iniciando pipeline de migração (dados estruturados)");
  await upsertPlanos(seed);
  await upsertIgrejas(seed);
  await upsertUsuarios(seed);
  await upsertRedes(seed);
  await upsertCelulas(seed);
  await upsertMembrosCelula(seed);
  await upsertReunioes(seed);
  await upsertDevocionais(seed);
  await upsertAvisos(seed);
  await upsertConvites(seed);
  await upsertTrilhas(seed);
  await upsertAreasSupervisao(seed);
  await upsertUsuariosTrilha(seed);
  await upsertSolicitacoesTrilha(seed);
  await upsertLandingConfigs(seed);
  await upsertConfiguracoesSistema(seed);
  await upsertLivrosBiblia(seed);
  await upsertCapitulosBiblia(seed);
  await upsertVersiculosBiblia(seed);
  await upsertMetasLeitura(seed);
  await upsertMetaLeituraUsuarios(seed);
  await upsertProgressoAutomatico(seed);
  await upsertLeituras(seed);
  console.info("✅ Pipeline de migração concluído com sucesso.");
}

async function main() {
  try {
    const sourcePath = DEFAULT_DATA_PATH;
    await migrateFromSeed(sourcePath);
  } catch (error) {
    console.error("🚨 Migração interrompida", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
