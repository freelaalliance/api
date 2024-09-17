export interface EquipamentoProps {
  id: string
  empresaId: string
}

export interface PecaEquipamentoProps {
  id: string
  empresaId: string
}

export interface AtualizaEquipamentoProps {
  id: string
  codigo?: string
  nome?: string
  especificacao?: string
  frequencia?: number
  tempoOperacao?: number
  empresaId: string
}

export interface AtualizaPecaEquipamentoProps {
  id: string
  nome?: string
  descricao?: string
  equipamentoId: string
}

export interface NovoEquipamentoProps {
  codigo: string
  nome: string
  especificacao?: string
  frequencia: number
  tempoOperacao: number
  empresaId: string
  pecas: Array<{
    nome: string
    descricao?: string
  }>
}

export interface NovaPecaEquipamentoProps {
  nome: string
  descricao?: string
  equipamentoId: string
}

export type DadosEquipamentoType = {
  id: string
  codigo: string
  nome: string
  especificacao?: string | null
  frequencia: number
  empresaId: string
}
