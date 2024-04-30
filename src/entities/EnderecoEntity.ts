import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import EnderecoRepository from '../repositories/EnderecoRepository'

class EnderecoEntity {
  private id: string
  private logradouro: string
  private bairro: string
  private cidade: string
  private estado: string
  private numero: string
  private complemento: string
  private cep: string
  private excluido: boolean
  private criadoEm: Date
  private atualizadoEm: Date
  private pessoaId: string

  private enderecoRepository: EnderecoRepository

  constructor(
    id?: string,
    logradouro?: string,
    bairro?: string,
    cidade?: string,
    estado?: string,
    numero?: string,
    complemento?: string | null,
    cep?: string,
    excluido?: boolean,
    criadoEm?: Date,
    atualizadoEm?: Date,
    pessoaId?: string,
  ) {
    this.id = id || ''
    this.logradouro = logradouro || ''
    this.bairro = bairro || ''
    this.cidade = cidade || ''
    this.estado = estado || ''
    this.numero = numero || ''
    this.complemento = complemento || ''
    this.cep = cep || ''
    this.pessoaId = pessoaId || ''
    this.excluido = excluido || false
    this.criadoEm = criadoEm || new Date()
    this.atualizadoEm = atualizadoEm || new Date()

    this.enderecoRepository = new EnderecoRepository(this)
  }

  getId(): string {
    return this.id
  }

  getLogradouro(): string {
    return this.logradouro
  }

  getBairro(): string {
    return this.bairro
  }

  getCidade(): string {
    return this.cidade
  }

  getEstado(): string {
    return this.estado
  }

  getNumero(): string {
    return this.numero
  }

  getComplemento(): string {
    return this.complemento
  }

  getCep(): string {
    return this.cep
  }

  getExcluido(): boolean {
    return this.excluido
  }

  getCriadoEm(): Date {
    return this.criadoEm
  }

  getAtualizadoEm(): Date {
    return this.atualizadoEm
  }

  getPessoaId(): string {
    return this.pessoaId
  }

  async cadastrarEndereco(): Promise<RespostaRequisicaoInterface> {
    return await this.enderecoRepository.criarEndereco()
  }

  async alterarEndereco(): Promise<RespostaRequisicaoInterface> {
    return await this.enderecoRepository.editarEndereco()
  }

  async buscarEndereco(id: string): Promise<EnderecoEntity> {
    return await this.enderecoRepository.buscarEndereco(id)
  }

  async buscarEnderecoPessoa(pessoaId: string): Promise<EnderecoEntity> {
    return await this.enderecoRepository.buscarEnderecoPessoa(pessoaId)
  }
}

export default EnderecoEntity
