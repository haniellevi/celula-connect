import { listUsuarios } from '@/lib/queries/usuarios'
import { PerfilUsuario } from '../../../prisma/generated/client'

jest.mock('@/lib/db', () => ({
  db: {
    usuario: {
      findMany: jest.fn(),
    },
  },
}))

const { db } = jest.requireMock('@/lib/db') as {
  db: {
    usuario: {
      findMany: jest.Mock
    }
  }
}

describe('listUsuarios', () => {
  beforeEach(() => {
    db.usuario.findMany.mockResolvedValue([])
  })

  it('filtra por perfil simples e mantém usuários ativos por padrão', async () => {
    await listUsuarios({ perfil: PerfilUsuario.PASTOR })

    expect(db.usuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          perfil: PerfilUsuario.PASTOR,
          ativo: true,
        },
      }),
    )
  })

  it('aceita múltiplos perfis utilizando operador in', async () => {
    await listUsuarios({
      perfil: [PerfilUsuario.SUPERVISOR, PerfilUsuario.LIDER_CELULA],
      includeInactive: true,
    })

    expect(db.usuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          perfil: { in: [PerfilUsuario.SUPERVISOR, PerfilUsuario.LIDER_CELULA] },
        },
      }),
    )
  })

  it('aplica filtro por igreja e parâmetros de busca', async () => {
    await listUsuarios({
      igrejaId: 'seed-igreja-central',
      search: 'Seed',
    })

    expect(db.usuario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          igrejaId: 'seed-igreja-central',
          OR: expect.arrayContaining([
            expect.objectContaining({
              nome: { contains: 'Seed', mode: 'insensitive' },
            }),
          ]),
          ativo: true,
        }),
        orderBy: [{ igrejaId: 'asc' }, { nome: 'asc' }],
      }),
    )
  })
})
