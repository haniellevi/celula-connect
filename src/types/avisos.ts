export const TIPO_AVISO_VALUES = ['GERAL', 'URGENTE', 'INFORMATIVO', 'SISTEMA'] as const
export type TipoAviso = (typeof TIPO_AVISO_VALUES)[number]

export const PRIORIDADE_AVISO_VALUES = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'] as const
export type PrioridadeAviso = (typeof PRIORIDADE_AVISO_VALUES)[number]

export interface AvisoRelationSummary {
  id: string
  nome: string | null
}

export interface AvisoWithRelations {
  id: string
  titulo: string
  conteudo: string
  tipo: TipoAviso
  prioridade: PrioridadeAviso
  dataInicio: string
  dataFim: string | null
  igrejaId: string | null
  celulaId: string | null
  usuarioId: string | null
  ativo: boolean
  igreja?: AvisoRelationSummary | null
  celula?: AvisoRelationSummary | null
  usuario?: AvisoRelationSummary | null
}
