import { addDays } from 'date-fns'

import type { EquipamentoProps } from '../../interfaces/Manutencao/EquipamentoInterface'
import { prisma } from '../../services/PrismaClientService'

interface salvarInspecaoProps {
  iniciadoEm: Date
  equipamentoId: string
  status: 'aprovado' | 'reprovado'
  usuarioId: string
  finalizadoEm?: Date
  inspecaoPeca: Array<{
    pecaEquipamentoId: string
    aprovado: boolean
    inspecionadoEm?: Date | null
    inspecionado: boolean
    observacao?: string | null
  }>
}

interface finalizarInspecaoProps {
  inspecaoId: string
  equipamentoId: string
  status: 'aprovado' | 'reprovado'
  finalizadoEm: Date
  observacao?: string | null
  inspecaoPeca: Array<{
    pecaEquipamentoId: string
    aprovado: boolean
    inspecionadoEm: Date
    inspecionado: boolean
    observacao?: string | null
  }>
}

export async function consultarInspecoesAgendadas({
  empresaId,
  id: equipamentoId,
}: EquipamentoProps) {
  return await prisma.agendaInspecaoEquipamento.findMany({
    select: {
      equipamento: {
        select: {
          id: true,
          codigo: true,
          nome: true,
        },
      },
    },
    where: {
      equipamentoId,
      inspecaoRealizada: false,
      equipamento: {
        empresaId,
      },
    },
    orderBy: {
      agendadoPara: 'asc',
    },
  })
}

export async function listaInspecoesEquipamentoEmpresa({
  empresaId,
  id: equipamentoId,
}: EquipamentoProps) {
  return await prisma.inspecaoEquipamento.findMany({
    select: {
      id: true,
      iniciadoEm: true,
      finalizadoEm: true,
      statusInspecao: true,
      equipamentoId: true,
      PontosInspecaoEquipamento: {
        select: {
          pecaEquipamentoId: true,
          inspecionadoEm: true,
          observacao: true,
        },
      },
      usuario: {
        select: {
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
    },
    where: {
      equipamentoId,
      equipamento: {
        empresaId,
      },
    },
    orderBy: {
      iniciadoEm: 'desc',
    },
  })
}

export async function listaPontosInspecionadoEquipamento(
  idInspecao: string,
  empresaId: string
) {
  return await prisma.pontosInspecaoEquipamento.findMany({
    select: {
      pecasEquipamento: {
        select: {
          id: true,
          nome: true,
          descricao: true,
        },
      },
      inspecionadoEm: true,
      aprovado: true,
    },
    where: {
      inspecaoId: idInspecao,
      equipamento: {
        empresaId,
      },
    },
    orderBy: {
      pecasEquipamento: {
        nome: 'asc',
      },
    },
  })
}

export async function salvarInspecao({
  iniciadoEm,
  status,
  equipamentoId,
  usuarioId,
  finalizadoEm,
  inspecaoPeca,
}: salvarInspecaoProps) {
  if (finalizadoEm) {
    await prisma.equipamento.update({
      where: { id: equipamentoId },
      data: {
        inspecionadoEm: finalizadoEm,
      },
    })
  }

  return await prisma.inspecaoEquipamento.create({
    select: {
      id: true,
      iniciadoEm: true,
      finalizadoEm: true,
      statusInspecao: true,
      PontosInspecaoEquipamento: {
        select: {
          pecaEquipamentoId: true,
          inspecionadoEm: true,
          observacao: true,
        },
      },
      usuario: {
        select: {
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
    },
    data: {
      iniciadoEm,
      finalizadoEm,
      equipamentoId,
      usuarioId,
      statusInspecao: status,
      PontosInspecaoEquipamento: {
        createMany: {
          data: inspecaoPeca.map(peca => {
            return {
              equipamentoId,
              pecaEquipamentoId: peca.pecaEquipamentoId,
              aprovado: peca.aprovado,
              inspecionadoEm: peca.inspecionadoEm,
              observacao: peca.observacao,
            }
          }),
        },
      },
    },
  })
}

export async function finalizarInspecao({
  inspecaoId,
  equipamentoId,
  status,
  finalizadoEm,
  inspecaoPeca,
}: finalizarInspecaoProps) {
  const removePontosInspecionado = prisma.pontosInspecaoEquipamento.deleteMany({
    where: {
      inspecaoId,
    },
  })

  const atualizaInspecao = prisma.inspecaoEquipamento.update({
    where: {
      id: inspecaoId,
      equipamentoId,
    },
    data: {
      finalizadoEm,
      statusInspecao: status,
      equipamento: {
        update: {
          inspecionadoEm: finalizadoEm,
        },
      },
    },
  })

  const atualizaPontosInspecao = prisma.pontosInspecaoEquipamento.createMany({
    data: inspecaoPeca.map(peca => {
      return {
        inspecaoId,
        equipamentoId,
        pecaEquipamentoId: peca.pecaEquipamentoId,
        aprovado: peca.aprovado,
        inspecionadoEm: peca.inspecionadoEm,
        observacao: peca.observacao,
      }
    }),
  })

  await prisma.$transaction([
    removePontosInspecionado,
    atualizaInspecao,
    atualizaPontosInspecao,
  ])
}

export async function atualizarAgendaEquipamento({
  empresaId,
  id: equipamentoId,
}: EquipamentoProps) {
  await prisma.agendaInspecaoEquipamento.updateMany({
    where: {
      equipamento: {
        empresaId,
        id: equipamentoId,
      },
      inspecaoRealizada: false,
    },
    data: {
      inspecaoRealizada: true,
    },
  })
}

export async function agendarInspecaoEquipamento({
  empresaId,
  id: equipamentoId,
}: EquipamentoProps) {
  const dadosEquipamento = await prisma.equipamento.findUnique({
    where: {
      id: equipamentoId,
      empresaId,
    },
  })

  if (dadosEquipamento) {
    await prisma.agendaInspecaoEquipamento.create({
      data: {
        agendadoPara: addDays(new Date(), dadosEquipamento?.frequencia ?? 0),
        equipamentoId,
        inspecaoRealizada: false,
      },
    })
  }
}

export async function consultarAgendaInspecaoEmpresa({
  empresaId,
}: EquipamentoProps) {
  const dataAtual = new Date()

  return await prisma.agendaInspecaoEquipamento.findMany({
    select: {
      id: true,
      equipamento: {
        select: {
          id: true,
          codigo: true,
          nome: true,
          frequencia: true,
        },
      },
      agendadoPara: true,
      inspecaoRealizada: true,
    },
    where: {
      equipamento: {
        empresaId,
      },
      agendadoPara: {
        gte: new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1, 1),
        lte: new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 30),
      },
    },
    orderBy: {
      agendadoPara: 'asc',
    },
  })
}
