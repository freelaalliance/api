export interface EnderecoFornecedorProps {
  id?: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  complemento?: string | null
}

export interface TelefoneFornecedorProps {
  codigoArea: string
  numero: string
}

export interface EmailFornecedorProps {
  email: string
}

export interface AnexoFornecedorProps {
  nome: string
  arquivo: string
  observacao?: string | null
}

export interface NovoFornecedorProps {
  nome: string
  documento: string
  critico: boolean
  desempenho?: number
  empresaId: string
  aprovado: boolean
  enderecoFornecedor: EnderecoFornecedorProps
  telefoneFornecedor: Array<TelefoneFornecedorProps>
  emailFornecedor: Array<EmailFornecedorProps>
  anexos: Array<AnexoFornecedorProps>
}

export interface NovaAvaliacaoFornecedorProps {
  fornecedorId: string
  nota: number
  validade: Date
  aprovado: boolean
  critico: boolean
  usuarioId: string
}

export interface ConsultaFornecedorProps {
  id?: string
  empresaId: string
}
