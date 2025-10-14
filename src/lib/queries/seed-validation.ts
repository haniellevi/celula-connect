import { db } from '@/lib/db'
import { PerfilUsuario } from '../../../prisma/generated/client'

export interface SeedStats {
  usuarios: number
  igrejas: number
  celulas: number
  membros: number
  reunioes: number
  redes: number
  convites: number
  devocionais: number
  avisos: number
  trilhas: number
  areas: number
  usuariosTrilha: number
  solicitacoesTrilha: number
  landingConfigs: number
  configuracoes: number
  livros: number
  capitulos: number
  versiculos: number
  metas: number
  metaUsuarios: number
  progressoAutomatico: number
  leituras: number
  usuariosPorPerfil: Partial<Record<PerfilUsuario, number>>
}

export async function getSeedStats(): Promise<SeedStats> {
  const [
    usuarios,
    igrejas,
    celulas,
    membros,
    reunioes,
    redes,
    convites,
    devocionais,
    avisos,
    trilhas,
    areas,
    usuariosTrilha,
    solicitacoesTrilha,
    landingConfigs,
    configuracoes,
    livros,
    capitulos,
    versiculos,
    metas,
    metaUsuarios,
    progressoAutomatico,
    leituras,
    usuariosPorPerfilRaw,
  ] = await db.$transaction([
    db.usuario.count({ where: { id: { startsWith: 'seed-' } } }),
    db.igreja.count({ where: { id: { startsWith: 'seed-' } } }),
    db.celula.count({ where: { id: { startsWith: 'seed-' } } }),
    db.membroCelula.count({ where: { id: { startsWith: 'seed-' } } }),
    db.reuniaoCelula.count({ where: { id: { startsWith: 'seed-' } } }),
    db.rede.count({ where: { id: { startsWith: 'seed-' } } }),
    db.convite.count({ where: { id: { startsWith: 'seed-' } } }),
    db.devocional.count({ where: { id: { startsWith: 'seed-' } } }),
    db.aviso.count({ where: { id: { startsWith: 'seed-' } } }),
    db.trilhaCrescimento.count({ where: { id: { startsWith: 'seed-' } } }),
    db.areaSupervisaoTrilha.count({ where: { id: { startsWith: 'seed-' } } }),
    db.usuarioTrilha.count({ where: { id: { startsWith: 'seed-' } } }),
    db.solicitacaoAvancoTrilha.count({ where: { id: { startsWith: 'seed-' } } }),
    db.landingPageConfig.count({ where: { id: { startsWith: 'seed-' } } }),
    db.configuracaoSistema.count({ where: { id: { startsWith: 'seed-' } } }),
    db.livroBiblia.count({ where: { id: { startsWith: 'seed-' } } }),
    db.capituloBiblia.count({ where: { id: { startsWith: 'seed-' } } }),
    db.versiculoBiblia.count({ where: { id: { startsWith: 'seed-' } } }),
    db.metaLeitura.count({ where: { id: { startsWith: 'seed-' } } }),
    db.metaLeituraUsuario.count({ where: { id: { startsWith: 'seed-' } } }),
    db.progressoAutomaticoMeta.count({ where: { id: { startsWith: 'seed-' } } }),
    db.leituraRegistro.count({ where: { id: { startsWith: 'seed-' } } }),
    db.usuario.groupBy({
      where: { id: { startsWith: 'seed-' } },
      by: ['perfil'],
      _count: { _all: true },
      orderBy: {
        perfil: 'asc',
      },
    }),
  ])

  const usuariosPorPerfil: Partial<Record<PerfilUsuario, number>> = {}
  for (const entry of usuariosPorPerfilRaw) {
    const total =
      typeof entry._count === 'object' && entry._count !== null && '_all' in entry._count
        ? entry._count._all
        : 0
    usuariosPorPerfil[entry.perfil] = total
  }

  return {
    usuarios,
    igrejas,
    celulas,
    membros,
    reunioes,
    redes,
    convites,
    devocionais,
    avisos,
    trilhas,
    areas,
    usuariosTrilha,
    solicitacoesTrilha,
    landingConfigs,
    configuracoes,
    livros,
    capitulos,
    versiculos,
    metas,
    metaUsuarios,
    progressoAutomatico,
    leituras,
    usuariosPorPerfil,
  }
}
