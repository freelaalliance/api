export interface EnderecoRepositoryInterface {
  id: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  complemento: string | null
  pessoaId: string
  criadoEm: Date
  atualizadoEm: Date
  excluido: boolean
}
