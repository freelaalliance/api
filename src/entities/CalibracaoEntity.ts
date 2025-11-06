import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { differenceInDays } from 'date-fns'

import type {
  AgendaInstrumentoInterface,
  CalibracaoInterface,
  FiltrosRelatorioPropsInterface,
} from '../interfaces/ModuloCalibracaoInterface'
import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import AgendaRepository, {
  type AgendaCalibracaoInstrumentoEmpresaType,
} from '../repositories/AgendaRepository'
import CalibracaoInstrumentoRepository, {
  type DataCalibracaoIntrumentoType,
  type HistoricoCalibracaoInstrumentoType,
} from '../repositories/CalibracaoRepository'

import InstrumentoEntity from './InstrumentoEntity'

export type EstatisticaCalibracaoInstrumentoEmpresaType = {
  quantidadeCalibracoesAprovadas: number
  quantidadeCalibracoesReprovadas: number
}

export type EstatisticaAgendaCalibracaoEmpresaType = {
  calibracoesVencido: number
  calibracoesVencendo: number
  calibracoesDentroPrazo: number
}

export type ListaCalibracoesVencidasType = {
  id: string
  codigo: string
  nome: string
  agendadoPara: Date
}

class CalibracaoEntity extends InstrumentoEntity {
  private idCalibracao: string
  private numeroCertificado: string
  private erroEncontrado: string
  private incertezaTendencia: string
  private tolerancia: string
  private observacao: string | null
  private certificado: string
  private status: string
  private realizadoEm: Date
  private calibracaoCriadoEm: Date
  private calibracaoAtualizacao: Date
  private calibracaoExcluido: boolean
  private usuarioId: string

  private calibracaoRepository: CalibracaoInstrumentoRepository

  constructor(
    idCalibracao?: string,
    numeroCertificado?: string,
    erroEncontrado?: string,
    incertezaTendencia?: string,
    tolerancia?: string,
    observacao?: string | null,
    certificado?: string,
    status?: string,
    realizadoEm?: Date,
    usuarioId?: string,
    calibracaoCriadoEm?: Date,
    calibracaoAtualizacao?: Date,
    calibracaoExcluido?: boolean,
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
    super(
      id,
      codigo,
      nome,
      localizacao,
      marca,
      resolucao,
      frequencia,
      repeticao,
      empresaId,
      criadoEm,
      atualizacao,
      excluido
    )
    this.idCalibracao = idCalibracao || ''
    this.numeroCertificado = numeroCertificado || ''
    this.erroEncontrado = erroEncontrado || ''
    this.incertezaTendencia = incertezaTendencia || ''
    this.tolerancia = tolerancia || ''
    this.observacao = observacao || null
    this.certificado = certificado || ''
    this.status = status || 'reprovado'
    this.realizadoEm = realizadoEm || new Date()
    this.usuarioId = usuarioId || ''
    this.calibracaoCriadoEm = calibracaoCriadoEm || new Date()
    this.calibracaoAtualizacao = calibracaoAtualizacao || new Date()
    this.calibracaoExcluido = calibracaoExcluido || true

    this.calibracaoRepository = new CalibracaoInstrumentoRepository(this)
  }

  getIdCalibracao(): string {
    return this.idCalibracao
  }

  setIdCalibracao(idCalibracao: string): void {
    this.idCalibracao = idCalibracao
  }

  getNumeroCertificado(): string {
    return this.numeroCertificado
  }

  setNumeroCertificado(numeroCertificado: string): void {
    this.numeroCertificado = numeroCertificado
  }

  getErroEncontrado(): string {
    return this.erroEncontrado
  }

  setErroEncontrado(erroEncontrado: string): void {
    this.erroEncontrado = erroEncontrado
  }

  getIncertezaTendencia(): string {
    return this.incertezaTendencia
  }

  setIncertezaTendencia(incertezaTendencia: string): void {
    this.incertezaTendencia = incertezaTendencia
  }

  getTolerancia(): string {
    return this.tolerancia
  }

  setTolerancia(tolerancia: string): void {
    this.tolerancia = tolerancia
  }

  getObservacao(): string | null {
    return this.observacao
  }

  setObservacao(observacao: string | null): void {
    this.observacao = observacao
  }

  getCertificado(): string {
    return this.certificado
  }

  setCertificado(certificado: string): void {
    this.certificado = certificado
  }

  getStatus(): string {
    return this.status
  }

  setStatus(status: string): void {
    this.status = status
  }

  getCriadoEm(): Date {
    return this.calibracaoCriadoEm
  }

  setCriadoEm(criadoEm: Date): void {
    this.calibracaoCriadoEm = criadoEm
  }

  getAtualizacao(): Date {
    return this.calibracaoAtualizacao
  }

  setAtualizacao(atualizacao: Date): void {
    this.calibracaoAtualizacao = atualizacao
  }

  getExcluido(): boolean {
    return this.calibracaoExcluido
  }

  setExcluido(excluido: boolean): void {
    this.calibracaoExcluido = excluido
  }

  getRealizadoEm(): Date {
    return this.realizadoEm
  }

  setRealizadoEm(realizadoEm: Date): void {
    this.realizadoEm = realizadoEm
  }

  getUsuarioId(): string {
    return this.usuarioId
  }

  setUsuarioId(usuarioId: string): void {
    this.usuarioId = usuarioId
  }

  private calcularDataCalibracaoAgenda(dataUltimaCalibracao: Date): Date {
    const novaDataCalibracao = new Date(dataUltimaCalibracao)

    novaDataCalibracao.setDate(
      dataUltimaCalibracao.getDate() + this.getFrequencia() * 30
    )

    return novaDataCalibracao
  }

  private validarCalibracao(): 'aprovado' | 'reprovado' {
    const erroEncontrado = Number(this.getErroEncontrado())
    const incertezaTendenciaEncontrado = Number(this.getIncertezaTendencia())

    const somaErroIncerteza: number =
      erroEncontrado + incertezaTendenciaEncontrado

    if (somaErroIncerteza <= Number(this.getTolerancia())) {
      return 'aprovado'
    }

    return 'reprovado'
  }

  async salvarCalibracao(): Promise<RespostaRequisicaoInterface> {
    try {
      const instrumento = await this.salvarInstrumento()

      const verificaExisteCalibracaoInstrumento =
        await this.calibracaoRepository.buscarCalibracaoInstrumentoPorCertificado(
          this.getNumeroCertificado(),
          instrumento.id,
          this.getEmpresaId()
        )

      if (verificaExisteCalibracaoInstrumento.length > 0) {
        return {
          status: false,
          msg: 'Já existe uma calibração com esse certificado',
        }
      }

      const calibracoesInstrumento: HistoricoCalibracaoInstrumentoType[] =
        await this.calibracaoRepository.buscarCalibracoesIntrumento(
          instrumento.id
        )

      if (calibracoesInstrumento.length >= instrumento.repeticao + 1) {
        return {
          status: false,
          msg: 'A quantidade de calibrações desse instrumento já foi atingida',
        }
      }

      this.setStatus(this.validarCalibracao())

      await this.calibracaoRepository.inserirCalibracao(instrumento.id)

      if (calibracoesInstrumento.length + 1 <= instrumento.repeticao) {
        const agendaRepository = new AgendaRepository()
        let ultimaCalibracao: Date = this.getRealizadoEm()

        ultimaCalibracao = this.calcularDataCalibracaoAgenda(ultimaCalibracao)

        agendaRepository.criarAgendamentosInstrumento({
          instrumentoId: instrumento.id,
          dataAgenda: ultimaCalibracao,
        })
      }

      return {
        status: true,
        msg: 'Calibração salva com sucesso',
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
        msg: 'Erro ao inserir nova calibração',
      }
    }
  }

  async atualizarDadosCalibracao(
    idCalibracao: string
  ): Promise<RespostaRequisicaoInterface> {
    const verificaExisteCalibracao: CalibracaoInterface | null =
      await this.calibracaoRepository.buscarCalibracaoInstrumentoPorId(
        idCalibracao
      )

    if (!verificaExisteCalibracao) {
      return {
        status: false,
        msg: 'Calibração não encontrada',
      }
    }

    try {
      this.setStatus(this.validarCalibracao())

      await this.calibracaoRepository.atualizarCalibracao(idCalibracao)

      return {
        status: true,
        msg: 'Calibração atualizada com sucesso',
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
        msg: 'Erro ao atualizar calibração',
      }
    }
  }

  async excluirCalibracao(
    idCalibracao: string
  ): Promise<RespostaRequisicaoInterface> {
    const verificaExisteCalibracao: CalibracaoInterface | null =
      await this.calibracaoRepository.buscarCalibracaoInstrumentoPorId(
        idCalibracao
      )

    if (!verificaExisteCalibracao) {
      return {
        status: false,
        msg: 'Calibração não encontrada',
      }
    }

    try {
      await this.calibracaoRepository.removerCalibracaoInstrumento(idCalibracao)

      return {
        status: true,
        msg: 'Calibração excluída com sucesso',
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
        msg: 'Erro ao excluir calibração',
      }
    }
  }

  async recuperarListaCalibracaoEmpresa(
    idEmpresa: string
  ): Promise<DataCalibracaoIntrumentoType[]> {
    return await this.calibracaoRepository.buscarCalibracoesIntrumentosEmpresa(
      idEmpresa
    )
  }

  async recuperarAgendamentosCalibracaoInstrumentosEmpresa(
    idEmpresa: string
  ): Promise<Array<ListaCalibracoesVencidasType>> {
    const agendaRepository = new AgendaRepository()

    const agendaCalibracoesEmpresa =
      await agendaRepository.consultarAgendaCalibracaoInstrumentosEmpresa(
        idEmpresa
      )

    const listaCalibracoesVencendo: AgendaCalibracaoInstrumentoEmpresaType[] =
      []

    for (const agenda of agendaCalibracoesEmpresa) {
      const verificaExisteCalibracaoAgendado: CalibracaoInterface | null =
        await this.calibracaoRepository.verificarRealizacaoCalibracaoInstrumentoEmpresa(
          agenda.agendadoPara,
          agenda.instrumentoId
        )

      if (!verificaExisteCalibracaoAgendado) {
        listaCalibracoesVencendo.push(agenda)
      }
    }

    return listaCalibracoesVencendo.map(agenda => {
      return {
        id: agenda.id,
        instrumento: agenda.instrumento.id,
        codigo: agenda.instrumento.codigo,
        nome: agenda.instrumento.nome,
        agendadoPara: agenda.agendadoPara,
      }
    })
  }

  async recuperarEstatisticasAgendaCalibracaoEmpresa(
    empresaId: string
  ): Promise<EstatisticaAgendaCalibracaoEmpresaType> {
    const agendaRepository = new AgendaRepository()

    const agendaCalibracoesEmpresa: AgendaCalibracaoInstrumentoEmpresaType[] =
      await agendaRepository.consultarAgendaCalibracaoInstrumentosEmpresa(
        empresaId
      )

    const estatisticasAgenda: EstatisticaAgendaCalibracaoEmpresaType = {
      calibracoesVencendo: 0,
      calibracoesVencido: 0,
      calibracoesDentroPrazo: 0,
    }

    for (const itemAgenda of agendaCalibracoesEmpresa) {
      const verificaExisteCalibracaoAgendado: CalibracaoInterface | null =
        await this.calibracaoRepository.verificarRealizacaoCalibracaoInstrumentoEmpresa(
          itemAgenda.agendadoPara,
          itemAgenda.instrumentoId
        )

      if (itemAgenda.agendadoPara < new Date()) {
        if (!verificaExisteCalibracaoAgendado)
          estatisticasAgenda.calibracoesVencido = +1
      } else if (
        differenceInDays(itemAgenda.agendadoPara, new Date()) > 0 &&
        differenceInDays(itemAgenda.agendadoPara, new Date()) <= 30
      ) {
        if (!verificaExisteCalibracaoAgendado) {
          estatisticasAgenda.calibracoesVencendo = +1
        }
      } else {
        if (!verificaExisteCalibracaoAgendado) {
          estatisticasAgenda.calibracoesDentroPrazo = +1
        }
      }
    }

    return estatisticasAgenda
  }

  async recuperarEstatisticasCalibracoesEmpresa(
    empresaId: string
  ): Promise<EstatisticaCalibracaoInstrumentoEmpresaType> {
    const listaCalibracoesAprovados =
      await this.calibracaoRepository.consultarCalibracoesAprovadosEmpresa(
        empresaId
      )

    const listaCalibracoesReprovados =
      await this.calibracaoRepository.consultarCalibracoesReprovadosEmpresa(
        empresaId
      )

    return {
      quantidadeCalibracoesAprovadas: listaCalibracoesAprovados.length,
      quantidadeCalibracoesReprovadas: listaCalibracoesReprovados.length,
    }
  }

  async recuperarHistoricoCalibracoesInstrumento(
    idInstrumento: string
  ): Promise<HistoricoCalibracaoInstrumentoType[]> {
    return await this.calibracaoRepository.buscarCalibracoesIntrumento(
      idInstrumento
    )
  }

  async recuperarAgendaCalibracoesInstrumento(
    instrumentoId: string
  ): Promise<AgendaInstrumentoInterface[]> {
    const agendaRepository = new AgendaRepository()

    return await agendaRepository.buscarAgendamentoCalibracoesInstrumento(
      instrumentoId
    )
  }

  async buscarCalibracoesEmpresaPorFiltro({
    status,
    calibradoDe,
    calibradoAte,
    codigoInstrumento,
    localizacaoInstrumento,
  }: FiltrosRelatorioPropsInterface) {
    return await this.calibracaoRepository.buscarCalibracoesEmpresaPorFiltro({
      status,
      calibradoDe,
      calibradoAte,
      codigoInstrumento,
      localizacaoInstrumento,
    })
  }
}

export default CalibracaoEntity
