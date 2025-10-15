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

export async function upsertLandingPageConfigEntry({
  secao,
  chave,
  valor,
  tipo,
}: {
  secao: string
  chave: string
  valor: string
  tipo?: string
}) {
  return db.landingPageConfig.upsert({
    where: {
      secao_chave: {
        secao,
        chave,
      },
    },
    update: {
      valor,
      tipo: tipo ?? undefined,
    },
    create: {
      secao,
      chave,
      valor,
      tipo: tipo ?? undefined,
    },
  })
}

export async function deleteLandingPageConfigEntry(secao: string, chave: string) {
  return db.landingPageConfig.delete({
    where: {
      secao_chave: {
        secao,
        chave,
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

export async function upsertConfiguracaoSistemaEntry({
  chave,
  valor,
  categoria,
  descricao,
  tipoCampo,
}: {
  chave: string
  valor: string
  categoria: string
  descricao?: string | null
  tipoCampo?: string
}) {
  return db.configuracaoSistema.upsert({
    where: { chave },
    update: {
      valor,
      categoria,
      descricao: descricao ?? undefined,
      tipoCampo: tipoCampo ?? undefined,
    },
    create: {
      chave,
      valor,
      categoria,
      descricao: descricao ?? undefined,
      tipoCampo: tipoCampo ?? undefined,
    },
  })
}

export async function deleteConfiguracaoSistemaEntry(chave: string) {
  return db.configuracaoSistema.delete({
    where: { chave },
  })
}
