import type CalibracaoEntity from '../entities/CalibracaoEntity'
import type { CalibracaoInterface } from '../interfaces/ModuloCalibracaoInterface'
import type {
  PessoaInterface,
  PessoaUsuarioInterface,
} from '../interfaces/PessoaInterface'
import { prisma } from '../services/PrismaClientService'

import type {
  FiltrosRelatorioPropsInterface,
  InstrumentoInterface,
} from './../interfaces/ModuloCalibracaoInterface'

export type DataCalibracaoIntrumentoType = CalibracaoInterface & {
  instrumento: InstrumentoInterface
  usuario: PessoaUsuarioInterface & { pessoa: PessoaInterface }
}

export type HistoricoCalibracaoInstrumentoType = CalibracaoInterface & {
  usuario: PessoaUsuarioInterface & { pessoa: PessoaInterface }
}

class CalibracaoInstrumentoRepository {
  private calibracaoInstrumentoEntity: CalibracaoEntity

  constructor(calibracaoInstrumentoEntity: CalibracaoEntity) {
    this.calibracaoInstrumentoEntity = calibracaoInstrumentoEntity
  }

  async inserirCalibracao(instrumentoId: string): Promise<CalibracaoInterface> {
    return await prisma.calibracao.create({
      data: {
        numeroCertificado:
          this.calibracaoInstrumentoEntity.getNumeroCertificado(),
        erroEncontrado: this.calibracaoInstrumentoEntity.getErroEncontrado(),
        incertezaTendenciaEncontrado:
          this.calibracaoInstrumentoEntity.getIncertezaTendencia(),
        toleranciaEstabelicida:
          this.calibracaoInstrumentoEntity.getTolerancia(),
        observacao: this.calibracaoInstrumentoEntity.getObservacao(),
        certificado: this.calibracaoInstrumentoEntity.getCertificado(),
        status: this.calibracaoInstrumentoEntity.getStatus() as
          | 'aprovado'
          | 'reprovado',
        realizadoEm: this.calibracaoInstrumentoEntity.getRealizadoEm(),
        usuarioId: this.calibracaoInstrumentoEntity.getUsuarioId(),
        instrumentoId,
      },
    })
  }

  async atualizarCalibracao(id: string): Promise<CalibracaoInterface> {
    return await prisma.calibracao.update({
      where: {
        id,
      },
      data: {
        numeroCertificado:
          this.calibracaoInstrumentoEntity.getNumeroCertificado(),
        erroEncontrado: this.calibracaoInstrumentoEntity.getErroEncontrado(),
        incertezaTendenciaEncontrado:
          this.calibracaoInstrumentoEntity.getIncertezaTendencia(),
        toleranciaEstabelicida:
          this.calibracaoInstrumentoEntity.getTolerancia(),
        observacao: this.calibracaoInstrumentoEntity.getObservacao(),
        certificado: this.calibracaoInstrumentoEntity.getCertificado(),
        status: this.calibracaoInstrumentoEntity.getStatus() as
          | 'aprovado'
          | 'reprovado',
        realizadoEm: this.calibracaoInstrumentoEntity.getRealizadoEm(),
        usuarioId: this.calibracaoInstrumentoEntity.getUsuarioId(),
      },
    })
  }

  async buscarCalibracoesIntrumento(
    instrumentoId: string
  ): Promise<HistoricoCalibracaoInstrumentoType[]> {
    return await prisma.calibracao.findMany({
      include: {
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        instrumentoId,
        excluido: false,
      },
    })
  }

  async removerCalibracaoInstrumento(id: string): Promise<void> {
    await prisma.calibracao.update({
      where: {
        id,
      },
      data: {
        excluido: true,
      },
    })
  }

  async buscarCalibracaoInstrumentoPorDataRealizacao(
    realizadoEm: Date,
    instrumentoId: string
  ): Promise<DataCalibracaoIntrumentoType[]> {
    return await prisma.calibracao.findMany({
      include: {
        instrumento: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        excluido: false,
        realizadoEm,
        instrumentoId,
      },
    })
  }

  async verificarRealizacaoCalibracaoInstrumentoEmpresa(
    dataAgendamento: Date,
    instrumentoId: string
  ): Promise<CalibracaoInterface | null> {
    const dataMesAgendamento: Date = new Date(
      dataAgendamento.getFullYear(),
      dataAgendamento.getMonth(),
      0
    )

    return await prisma.calibracao.findFirst({
      where: {
        excluido: false,
        realizadoEm: {
          gte: dataMesAgendamento,
        },
        instrumentoId,
      },
    })
  }

  async buscarCalibracaoInstrumentoPorCertificado(
    numeroCertificados: string,
    instrumentoId: string,
    empresaId: string
  ): Promise<DataCalibracaoIntrumentoType[]> {
    return await prisma.calibracao.findMany({
      include: {
        instrumento: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        excluido: false,
        numeroCertificado: numeroCertificados,
        instrumentoId,
        instrumento: {
          empresaId,
        },
      },
    })
  }

  async buscarCalibracaoInstrumentoPorId(
    id: string
  ): Promise<CalibracaoInterface | null> {
    return await prisma.calibracao.findUnique({
      where: {
        id,
      },
    })
  }

  async buscarCalibracoesIntrumentosEmpresa(
    empresaId: string
  ): Promise<DataCalibracaoIntrumentoType[]> {
    return await prisma.calibracao.findMany({
      include: {
        instrumento: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        instrumento: {
          empresaId,
        },
        excluido: false,
      },
      orderBy: {
        realizadoEm: 'desc',
      },
    })
  }

  async consultarCalibracoesAprovadosEmpresa(
    empresaId: string
  ): Promise<DataCalibracaoIntrumentoType[]> {
    return await prisma.calibracao.findMany({
      include: {
        instrumento: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        instrumento: {
          empresaId,
        },
        excluido: false,
        status: 'aprovado',
      },
    })
  }

  async consultarCalibracoesReprovadosEmpresa(
    empresaId: string
  ): Promise<DataCalibracaoIntrumentoType[]> {
    return await prisma.calibracao.findMany({
      include: {
        instrumento: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        instrumento: {
          empresaId,
        },
        excluido: false,
        status: 'reprovado',
      },
    })
  }

  async buscarCalibracoesEmpresaPorFiltro({
    status,
    calibradoDe,
    calibradoAte,
    codigoInstrumento,
    localizacaoInstrumento,
  }: FiltrosRelatorioPropsInterface) {
    return await prisma.calibracao.findMany({
      include: {
        instrumento: true,
        usuario: {
          include: {
            pessoa: true,
          },
        },
      },
      where: {
        excluido: false,
        status,
        instrumento: {
          codigo: codigoInstrumento,
          localizacao: localizacaoInstrumento,
          empresaId: this.calibracaoInstrumentoEntity.getEmpresaId(),
        },
        realizadoEm: {
          gte: calibradoDe,
          lte: calibradoAte,
        },
      },
    })
  }
}

export default CalibracaoInstrumentoRepository
