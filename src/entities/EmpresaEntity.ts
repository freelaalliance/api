import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import EmpresaRepository from '../repositories/EmpresaRepository'

import PessoaEntity from './PessoaEntity'

class EmpresaEntity extends PessoaEntity {
  private idEmpresa: string
  private cnpj: string
  private imagemLogo: string | null
  private criadoEm: Date
  private atualizadoEm: Date
  private excluido: boolean
  private empresaRepository: EmpresaRepository

  constructor(
    idEmpresa?: string,
    cnpj?: string,
    imagemLogo?: string | null,
    criadoEm?: Date,
    atualizadoEm?: Date,
    excluido?: boolean,
    pessoaId?: string,
    nomePessoa?: string
  ) {
    super(pessoaId, nomePessoa)

    this.idEmpresa = idEmpresa || ''
    this.cnpj = cnpj || ''
    this.imagemLogo = imagemLogo || null
    this.criadoEm = criadoEm || new Date()
    this.atualizadoEm = atualizadoEm || new Date()
    this.excluido = excluido || false

    this.empresaRepository = new EmpresaRepository(this)
  }

  getIdEmpresa(): string {
    return this.idEmpresa
  }

  getCnpj(): string {
    return this.removerCaracteresEspecialDocumento(this.cnpj)
  }

  getImagemLogo(): string | null {
    return this.imagemLogo
  }

  getCriadoEm(): Date {
    return this.criadoEm
  }

  getAtualizadoEm(): Date {
    return this.atualizadoEm
  }

  estaExcluido(): boolean {
    return this.excluido
  }

  async cadastrarEmpresa(): Promise<RespostaRequisicaoInterface> {
    const verificaExisteEmpresa: EmpresaEntity =
      await this.empresaRepository.buscarEmpresaPorCnpj(this.cnpj)

    if (verificaExisteEmpresa.getIdEmpresa() !== '')
      return {
        status: false,
        msg: 'Empresa já cadastrada',
      }

    const cadastraPessoa: RespostaRequisicaoInterface =
      await this.cadastrarPessoa()

    this.setIdPessoa(cadastraPessoa.msg)

    if (!cadastraPessoa.status) return cadastraPessoa

    return await this.empresaRepository.criarEmpresa()
  }

  async modificaEmpresa(): Promise<RespostaRequisicaoInterface> {
    const modificaPessoa: RespostaRequisicaoInterface =
      await this.modificarPessoa()

    if (!modificaPessoa.status) return modificaPessoa

    return await this.empresaRepository.editarEmpresa()
  }

  async excluirEmpresa(): Promise<RespostaRequisicaoInterface> {
    return await this.empresaRepository.deletarEmpresa(this.getIdEmpresa())
  }

  async recuperarDadosEmpresaPorId(id: string): Promise<EmpresaEntity> {
    return await this.empresaRepository.buscarEmpresa(id)
  }

  async recuperarDadosEmpresaPorCnpj(): Promise<EmpresaEntity> {
    if (this.getCnpj() === '') return new EmpresaEntity()

    return await this.empresaRepository.buscarEmpresaPorCnpj(this.getCnpj())
  }

  async listarEmpresas(){
    return await this.empresaRepository.recuperarListaEmpresa()
  }

  async vincularModuloEmpresa(
    idEmpresa: string,
    idModulo: string
  ): Promise<RespostaRequisicaoInterface> {
    return await this.empresaRepository.vincularModulosEmpresa(
      idEmpresa,
      idModulo
    )
  }

  async desvincularModuloEmpresa(
    idEmpresa: string,
    idModulo: string
  ): Promise<RespostaRequisicaoInterface> {
    return await this.empresaRepository.desvincularModulosEmpresa(
      idEmpresa,
      idModulo
    )
  }
}

export default EmpresaEntity
