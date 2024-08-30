import { AutenticacaoUsuarioType } from '../auth/Autenticacao'

export interface RespostaRequisicaoInterface {
  status: boolean
  msg: string
}

export interface RespostaAutenticacaoInterface {
  status: boolean
  msg: string
  payload?: AutenticacaoUsuarioType
}
