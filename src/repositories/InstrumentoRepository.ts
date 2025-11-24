import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import InstrumentoEntity from '../entities/InstrumentoEntity'
import type { InstrumentoInterface } from '../interfaces/ModuloCalibracaoInterface'
import { prisma } from '../services/PrismaClientService'

import type { RespostaRequisicaoInterface } from './../interfaces/ResponseInterface'

class InstrumentoRepository {
  private instrumentoEntity: InstrumentoEntity

  constructor(instrumentoEntity: InstrumentoEntity) {
    this.instrumentoEntity = instrumentoEntity
  }

  async consultarInstrumentoPorId(id: string): Promise<InstrumentoEntity> {
    const dadosInstrumento: InstrumentoInterface | null =
      await prisma.instrumento.findUnique({
        where: {
          id,
        },
      })

    if (!dadosInstrumento) return new InstrumentoEntity()

    return new InstrumentoEntity(
      dadosInstrumento.id,
      dadosInstrumento.codigo,
      dadosInstrumento.nome,
      dadosInstrumento.localizacao,
      dadosInstrumento.marca,
      dadosInstrumento.resolucao,
      dadosInstrumento.frequencia,
      dadosInstrumento.repeticao,
      dadosInstrumento.empresaId,
      dadosInstrumento.criadoEm,
      dadosInstrumento.atualizacao,
      dadosInstrumento.excluido
    )
  }

  async consultarIntrumentoPorCodigo(
    codigo: string
  ): Promise<InstrumentoEntity> {
    const dadosInstrumento: InstrumentoInterface | null =
      await prisma.instrumento.findUnique({
        where: {
          codigo,
          empresaId: this.instrumentoEntity.getEmpresaId(),
          excluido: false,
        },
      })

    if (!dadosInstrumento) return new InstrumentoEntity()

    return new InstrumentoEntity(
      dadosInstrumento.id,
      dadosInstrumento.codigo,
      dadosInstrumento.nome,
      dadosInstrumento.localizacao,
      dadosInstrumento.marca,
      dadosInstrumento.resolucao,
      dadosInstrumento.frequencia,
      dadosInstrumento.repeticao,
      dadosInstrumento.empresaId,
      dadosInstrumento.criadoEm,
      dadosInstrumento.atualizacao,
      dadosInstrumento.excluido
    )
  }

  async inserirInstrumento(): Promise<InstrumentoInterface> {
    const verificaExisteInstrumento: InstrumentoInterface | null =
      await prisma.instrumento.findUnique({
        where: {
          codigo: this.instrumentoEntity.getCodigo(),
        },
      })

    if (verificaExisteInstrumento) return verificaExisteInstrumento

    return await prisma.instrumento.create({
      data: {
        codigo: this.instrumentoEntity.getCodigo(),
        nome: this.instrumentoEntity.getNome(),
        localizacao: this.instrumentoEntity.getLocalizacao(),
        marca: this.instrumentoEntity.getMarca(),
        resolucao: this.instrumentoEntity.getResolucao(),
        frequencia: this.instrumentoEntity.getFrequencia(),
        repeticao: this.instrumentoEntity.getRepeticao(),
        empresaId: this.instrumentoEntity.getEmpresaId(),
      },
    })
  }

  async atualizarInstrumento(id: string): Promise<InstrumentoInterface> {
    return await prisma.instrumento.update({
      where: {
        id,
      },
      data: {
        codigo: this.instrumentoEntity.getCodigo(),
        nome: this.instrumentoEntity.getNome(),
        localizacao: this.instrumentoEntity.getLocalizacao(),
        marca: this.instrumentoEntity.getMarca(),
        resolucao: this.instrumentoEntity.getResolucao(),
        frequencia: this.instrumentoEntity.getFrequencia(),
        repeticao: this.instrumentoEntity.getRepeticao(),
        empresaId: this.instrumentoEntity.getEmpresaId(),
      },
    })
  }

  async deletarInstrumento(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.instrumento.update({
        where: {
          id,
        },
        data: {
          excluido: true,
        },
      })

      await prisma.calibracao.updateMany({
        where: {
          instrumentoId: id,
        },
        data: {
          excluido: true,
        },
      })

      return {
        status: true,
        msg: 'Instrumento excluido com sucesso',
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
        msg: 'Falha ao excluir o instrumento, tente novamente!',
      }
    }
  }

  async consultarTodosInstrumentosEmpresa(empresaId: string) {
    return await prisma.instrumento.count({
      where: {
        Calibracao: {
          every: {
            excluido: false,
          },
        },
        excluido: false,
        empresaId,
      },
    })
  }

  async consultarInstrumentosCadastradosEmpresaMesAtual(
    empresaId: string
  ) {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return await prisma.instrumento.count({
      where: {
        empresaId,
        excluido: false,
        Calibracao: {
          every: {
            excluido: false
          }
        },
        criadoEm: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    })
  }
}

export default InstrumentoRepository
