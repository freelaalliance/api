import {
  AgendaInstrumentoInterface,
  InstrumentoInterface,
} from '../interfaces/ModuloCalibracaoInterface'
import { prisma } from '../services/PrismaClientService'

interface CriarAgendamentoCalibracaoInstrumento {
  dataAgenda: Date
  instrumentoId: string
}

export type AgendaCalibracaoInstrumentoEmpresaType =
  AgendaInstrumentoInterface & {
    instrumento: InstrumentoInterface
  }

class AgendaRepository {
  async criarAgendamentosInstrumento({
    dataAgenda,
    instrumentoId,
  }: CriarAgendamentoCalibracaoInstrumento): Promise<AgendaInstrumentoInterface | null> {
    const verificaExisteAgendamento: AgendaInstrumentoInterface[] =
      await prisma.agenda.findMany({
        where: {
          instrumentoId,
          agendadoPara: dataAgenda,
        },
      })

    if (verificaExisteAgendamento.length > 0) {
      return null
    }

    return await prisma.agenda.create({
      data: {
        agendadoPara: dataAgenda,
        instrumentoId,
      },
    })
  }

  async removerAgendamentoInstrumento(id: string): Promise<void> {
    await prisma.agenda.delete({
      where: {
        id,
      },
    })
  }

  async removerTodosAgendamentosInstrumento(
    instrumentoId: string,
  ): Promise<void> {
    await prisma.agenda.deleteMany({
      where: {
        instrumentoId,
      },
    })
  }

  async consultarAgendaCalibracaoInstrumentosEmpresa(
    empresaId: string,
  ): Promise<AgendaCalibracaoInstrumentoEmpresaType[]> {
    return await prisma.agenda.findMany({
      include: {
        instrumento: true,
      },
      where: {
        instrumento: {
          empresaId,
          excluido: false,
        },
      },
      orderBy: {
        agendadoPara: 'desc',
      },
    })
  }

  async buscarAgendamentoCalibracoesInstrumento(
    instrumentoId: string,
  ): Promise<AgendaInstrumentoInterface[]> {
    return await prisma.agenda.findMany({
      where: {
        instrumentoId,
      },
    })
  }

  async consultarAgendaCalibracaoMesEmpresa(
    empresaId: string,
    mes: number,
    ano: number,
  ): Promise<AgendaCalibracaoInstrumentoEmpresaType[]> {
    return await prisma.agenda.findMany({
      include: {
        instrumento: true,
      },
      where: {
        AND: [
          { agendadoPara: { gte: new Date(ano, mes - 1, 1) } },
          { agendadoPara: { lt: new Date(ano, mes, 1) } },
        ],
        instrumento: {
          empresaId,
          excluido: false,
        },
      },
    })
  }
}

export default AgendaRepository
