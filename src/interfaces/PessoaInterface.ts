import { EnderecoRepositoryInterface } from './EnderecoInterface'

export interface PessoaInterface {
  id: string
  nome: string
}

export interface PessoaEmpresaInterface {
  id: string
  cnpj: string
  imagemLogo: string | null
  criadoEm: Date
  atualizadoEm: Date
  excluido: boolean
  pessoaId: string
}

export interface PessoaUsuarioInterface {
  id: string
  email: string
  senha: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
  pessoaId: string
  perfilId: string
  empresaId: string
}

export interface EmpresaInterface {
  empresa: PessoaEmpresaInterface
  pessoa: PessoaInterface
  endereco: EnderecoRepositoryInterface
}
