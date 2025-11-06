import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import type { InstrumentoInterface } from '../interfaces/ModuloCalibracaoInterface'
import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import AgendaRepository from '../repositories/AgendaRepository'
import InstrumentoRepository from '../repositories/InstrumentoRepository'

export type EstatisticaInstrumentoEmpresaType = {
  quantidadeInstrumentosEmpresa: number
  quantidadeInstrumentosCadastradoAtual: number
}

class InstrumentoEntity {
  protected id: string
  protected codigo: string
  protected nome: string
  protected localizacao: string
  protected marca: string
  protected resolucao: string
  protected frequencia: number
  protected repeticao: number
  protected empresaId: string
  protected criadoEm: Date
  protected atualizacao: Date
  protected excluido: boolean

  constructor(
    id?: string,
    codigo?: string,
    nome?: string,
    localizacao?: string,
    marca?: string,
    resolucao?: string,
    frequencia?: number,
    repeticao?: number,
    empresaId?: string,
    criadoEm?: Date,
    atualizacao?: Date,
    excluido?: boolean
  ) {
    this.id = id || ''
    this.codigo = codigo || ''
    this.nome = nome || ''
    this.localizacao = localizacao || ''
    this.marca = marca || ''
    this.resolucao = resolucao || ''
    this.frequencia = frequencia || 0
    this.repeticao = repeticao || 0
    this.empresaId = empresaId || ''
    this.criadoEm = criadoEm || new Date()
    this.atualizacao = atualizacao || new Date()
    this.excluido = excluido || true
  }

  getId(): string {
    return this.id
  }

  setId(id: string): void {
    this.id = id
  }

  getCodigo(): string {
    return this.codigo
  }

  setCodigo(codigo: string): void {
    this.codigo = codigo
  }

  getNome(): string {
    return this.nome
  }

  setNome(nome: string): void {
    this.nome = nome
  }

  getLocalizacao(): string {
    return this.localizacao
  }

  setLocalizacao(localizacao: string): void {
    this.localizacao = localizacao
  }

  getMarca(): string {
    return this.marca
  }

  setMarca(marca: string): void {
    this.marca = marca
  }

  getResolucao(): string {
    return this.resolucao
  }

  setResolucao(resolucao: string): void {
    this.resolucao = resolucao
  }

  getFrequencia(): number {
    return this.frequencia
  }

  setFrequencia(frequencia: number): void {
    this.frequencia = frequencia
  }

  getRepeticao(): number {
    return this.repeticao
  }

  setRepeticao(repeticao: number): void {
    this.repeticao = repeticao
  }

  getEmpresaId(): string {
    return this.empresaId
  }

  setEmpresaId(empresaId: string): void {
    this.empresaId = empresaId
  }

  getCriadoEm(): Date {
    return this.criadoEm
  }

  setCriadoEm(criadoEm: Date): void {
    this.criadoEm = criadoEm
  }

  getAtualizacao(): Date {
    return this.atualizacao
  }

  setAtualizacao(atualizacao: Date): void {
    this.atualizacao = atualizacao
  }

  getExcluido(): boolean {
    return this.excluido
  }

  setExcluido(excluido: boolean): void {
    this.excluido = excluido
  }

  protected async salvarInstrumento(): Promise<InstrumentoInterface> {
    const instrumentoRepository = new InstrumentoRepository(this)

    return instrumentoRepository.inserirInstrumento()
  }

  async atualizarDadosInstrumento(
    id: string
  ): Promise<RespostaRequisicaoInterface> {
    const instrumentoRepository = new InstrumentoRepository(this)

    const verificaExisteInstrumento =
      await instrumentoRepository.consultarInstrumentoPorId(id)

    if (!verificaExisteInstrumento)
      return {
        status: false,
        msg: 'Instrumento não encontrado',
      }

    try {
      await instrumentoRepository.atualizarInstrumento(id)

      return {
        status: true,
        msg: 'Instrumento atualizado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          status: false,
          msg: error.message,
        }
      }

      return {
        status: false,
        msg: 'Houve um problema ao atualizar o instrumento, tente novamente!',
      }
    }
  }

  async excluirInstrumento(id: string): Promise<RespostaRequisicaoInterface> {
    const instrumentoRepository = new InstrumentoRepository(this)

    const verificaExisteInstrumento =
      await instrumentoRepository.consultarInstrumentoPorId(id)

    if (!verificaExisteInstrumento)
      return {
        status: false,
        msg: 'Instrumento não encontrado',
      }

    try {
      await instrumentoRepository.deletarInstrumento(id)

      const agendaRepository = new AgendaRepository()
      await agendaRepository.removerTodosAgendamentosInstrumento(id)

      return {
        status: true,
        msg: 'Instrumento excluído com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          status: false,
          msg: error.message,
        }
      }

      return {
        status: false,
        msg: 'Houve um problema ao excluir o instrumento, tente novamente!',
      }
    }
  }

  async buscarDadosInstrumentoEmpresaPorCodigo(
    codigoInstrumento: string
  ): Promise<InstrumentoEntity> {
    const instrumentoRepository = new InstrumentoRepository(this)

    return instrumentoRepository.consultarIntrumentoPorCodigo(codigoInstrumento)
  }

  async consultarDadosInstrumentoPorId(id: string): Promise<InstrumentoEntity> {
    const instrumentoRepository = new InstrumentoRepository(this)

    return await instrumentoRepository.consultarInstrumentoPorId(id)
  }

  async recuperarEstatisticasInstrumentoEmpresa(
    empresaId: string
  ): Promise<EstatisticaInstrumentoEmpresaType> {
    const instrumentoRepository = new InstrumentoRepository(this)

    const listaInstrumentosEmpresa =
      await instrumentoRepository.consultarTodosInstrumentosEmpresa(empresaId)

    const listaInstrumentosEmpresaCadastradoMesAtual =
      await instrumentoRepository.consultarInstrumentosCadastradosEmpresaMesAtual(
        empresaId
      )

    return {
      quantidadeInstrumentosEmpresa: listaInstrumentosEmpresa.length,
      quantidadeInstrumentosCadastradoAtual:
        listaInstrumentosEmpresaCadastradoMesAtual.length,
    }
  }
}

export default InstrumentoEntity
