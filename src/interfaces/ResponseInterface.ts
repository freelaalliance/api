import type { AutenticacaoUsuarioType } from '../entities/Autenticacao'

export interface RespostaRequisicaoInterface {
  status: boolean
  msg: string
}

export interface RespostaAutenticacaoInterface {
  status: boolean
  msg: string
  payload?: AutenticacaoUsuarioType
}
