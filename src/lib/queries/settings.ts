import { db } from '@/lib/db'

export async function listLandingPageConfig(section?: string) {
  return db.landingPageConfig.findMany({
    where: section ? { secao: section } : undefined,
    orderBy: [{ secao: 'asc' }, { chave: 'asc' }],
  })
}

export async function getLandingValue(section: string, key: string) {
  return db.landingPageConfig.findUnique({
    where: {
      secao_chave: {
        secao: section,
        chave: key,
      },
    },
  })
}

export async function listConfiguracoesSistema(categoria?: string) {
  return db.configuracaoSistema.findMany({
    where: categoria ? { categoria } : undefined,
    orderBy: [{ categoria: 'asc' }, { chave: 'asc' }],
  })
}

export async function getConfiguracaoSistema(chave: string) {
  return db.configuracaoSistema.findUnique({
    where: { chave },
  })
}
