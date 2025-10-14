import { NextResponse } from 'next/server'
import { GET as GETMetas, POST } from '@/app/api/biblia/metas/route'
import { PATCH, DELETE } from '@/app/api/biblia/metas/[id]/route'
import { listMetasLeitura } from '@/lib/queries/biblia'
import { db } from '@/lib/db'
import { PerfilUsuario, TipoMeta, UnidadeTempo } from '../../../prisma/generated/client'

jest.mock('@/lib/domain-auth', () => ({
  requireDomainUser: jest.fn(),
  hasRole: jest.fn(),
}))

jest.mock('@/lib/queries/biblia', () => ({
  listMetasLeitura: jest.fn(),
}))

jest.mock('@/lib/db', () => ({
  db: {
    metaLeitura: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

const { requireDomainUser, hasRole } = require('@/lib/domain-auth') as {
  requireDomainUser: jest.Mock
  hasRole: jest.Mock
}

describe('API /api/biblia/metas CRUD', () => {
  beforeEach(() => {
    requireDomainUser.mockReset()
    hasRole.mockReset().mockImplementation((user: { perfil: PerfilUsuario }, allowed: PerfilUsuario[]) =>
      allowed.includes(user.perfil),
    )
    ;(listMetasLeitura as jest.Mock).mockReset()
    ;(db.metaLeitura.create as jest.Mock).mockReset()
    ;(db.metaLeitura.update as jest.Mock).mockReset()
    ;(db.metaLeitura.delete as jest.Mock).mockReset()
  })

  describe('POST /api/biblia/metas', () => {
    it('bloqueia criação quando usuário não é pastor', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-lider',
          perfil: PerfilUsuario.LIDER_CELULA,
        },
        response: null,
      })
      hasRole.mockReturnValue(false)

      const response = await POST(
        new Request('http://localhost/api/biblia/metas', {
          method: 'POST',
          body: JSON.stringify({}),
        }),
      )

      expect(response.status).toBe(403)
      expect(db.metaLeitura.create).not.toHaveBeenCalled()
    })

    it('cria meta quando pastor envia payload válido', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-pastor',
          perfil: PerfilUsuario.PASTOR,
        },
        response: null,
      })
      hasRole.mockReturnValue(true)

      ;(db.metaLeitura.create as jest.Mock).mockResolvedValue({
        id: 'meta-1',
        titulo: 'Meta Teste',
      })

      const response = await POST(
        new Request('http://localhost/api/biblia/metas', {
          method: 'POST',
          body: JSON.stringify({
            titulo: 'Meta Teste',
            descricao: 'Descrição',
            igrejaId: 'seed-igreja-central',
            celulaId: null,
            tipoMeta: TipoMeta.CAPITULOS,
            valorMeta: 12,
            unidade: UnidadeTempo.SEMANA,
            periodo: '2025',
            dataInicio: '2025-01-01',
            dataFim: '2025-03-01',
          }),
        }),
      )

      expect(db.metaLeitura.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            titulo: 'Meta Teste',
            criadoPor: 'seed-user-pastor',
          }),
        }),
      )
      expect(response.status).toBe(201)
      const payload = await response.json()
      expect(payload).toEqual({ success: true, data: { id: 'meta-1', titulo: 'Meta Teste' } })
    })
  })

  describe('PATCH /api/biblia/metas/[id]', () => {
    it('retorna 403 quando usuário não é pastor', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-supervisor',
          perfil: PerfilUsuario.SUPERVISOR,
        },
        response: null,
      })
      hasRole.mockReturnValue(false)

      const response = await PATCH(
        new Request('http://localhost/api/biblia/metas/meta-1', {
          method: 'PATCH',
          body: JSON.stringify({ titulo: 'Atualizado' }),
        }),
        { params: { id: 'meta-1' } },
      )

      expect(response.status).toBe(403)
      expect(db.metaLeitura.update).not.toHaveBeenCalled()
    })

    it('atualiza meta quando pastor envia dados', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-pastor',
          perfil: PerfilUsuario.PASTOR,
        },
        response: null,
      })
      hasRole.mockReturnValue(true)
      ;(db.metaLeitura.update as jest.Mock).mockResolvedValue({
        id: 'meta-1',
        titulo: 'Atualizado',
      })

      const response = await PATCH(
        new Request('http://localhost/api/biblia/metas/meta-1', {
          method: 'PATCH',
          body: JSON.stringify({ titulo: 'Atualizado' }),
        }),
        { params: { id: 'meta-1' } },
      )

      expect(db.metaLeitura.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'meta-1' },
          data: expect.objectContaining({ titulo: 'Atualizado' }),
        }),
      )
      expect(response.status).toBe(200)
    })
  })

  describe('DELETE /api/biblia/metas/[id]', () => {
    it('remove meta quando pastor autorizado', async () => {
      requireDomainUser.mockResolvedValue({
        user: {
          id: 'seed-user-pastor',
          perfil: PerfilUsuario.PASTOR,
        },
        response: null,
      })
      hasRole.mockReturnValue(true)
      ;(db.metaLeitura.delete as jest.Mock).mockResolvedValue({})

      const response = await DELETE(new Request('http://localhost/api/biblia/metas/meta-1', { method: 'DELETE' }), {
        params: { id: 'meta-1' },
      })

      expect(db.metaLeitura.delete).toHaveBeenCalledWith({ where: { id: 'meta-1' } })
      expect(response.status).toBe(200)
    })
  })
})
