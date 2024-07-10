import { addDays } from "date-fns"
import { prisma } from "../../services/PrismaClientService"

interface salvarInspecaoProps {
  iniciadoEm: Date,
  equipamentoId: string,
  status: 'aprovado'|'reprovado'
  usuarioId: string,
  finalizadoEm?: Date,
  inspecaoPeca: Array<{
    pecaEquipamentoId: string,
    aprovado: boolean,
    inspecionadoEm?: Date|null,
    inspecionado: boolean
  }>
}

interface finalizarInspecaoProps {
  inspecaoId: string,
  equipamentoId: string,
  status: 'aprovado'|'reprovado'
  finalizadoEm: Date,
  inspecaoPeca: Array<{
    pecaEquipamentoId: string,
    aprovado: boolean,
    inspecionadoEm: Date,
    inspecionado: boolean
  }>
}

interface EquipamentoProps{
  equipamentoId: string,
  empresaId: string
} 

export async function consultarInspecoesAgendadas({ empresaId, equipamentoId }: EquipamentoProps) {
  return await prisma.agendaInspecaoEquipamento.findMany({
    select: {
      equipamento: {
        select: {
          id: true,
          codigo: true,
          nome: true,
        }
      }
    },
    where: {
      equipamentoId,
      inspecaoRealizada: false,
      equipamento: {
        empresaId
      },
    },
    orderBy: {
      agendadoPara: 'asc'
    }
  })
}

export async function listaInspecoesEquipamentoEmpresa({ empresaId, equipamentoId }: EquipamentoProps) {
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
        }
      },
      usuario: {
        select: {
          pessoa: {
            select: {
              nome: true,
            }
          }
        }
      }
    },
    where: {
      equipamentoId,
      equipamento: {
        empresaId
      }
    },
    orderBy: {
      iniciadoEm: 'desc'
    }
  })
}

export async function listaPontosInspecionadoEquipamento(idInspecao: string, empresaId: string) {
  return await prisma.pontosInspecaoEquipamento.findMany({
    select: {
      pecasEquipamento: {
        select: {
          id: true,
          nome: true,
          descricao: true
        }
      },
      inspecionadoEm: true,
      aprovado: true
    },
    where: {
      inspecaoId: idInspecao,
      equipamento: {
        empresaId
      }
    },
    orderBy: {
      pecasEquipamento: {
        nome: 'asc'
      },
    }
  })
}

export async function salvarInspecao({ iniciadoEm, status, equipamentoId, usuarioId, finalizadoEm, inspecaoPeca }: salvarInspecaoProps) {
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
        }
      },
      usuario: {
        select: {
          pessoa: {
            select: {
              nome: true,
            }
          }
        }
      }
    },
    data: {
      iniciadoEm,
      finalizadoEm,
      equipamentoId,
      usuarioId,
      statusInspecao: status,
      PontosInspecaoEquipamento: {
        createMany: {
          data: inspecaoPeca.map((peca) => {
            return {
              equipamentoId,
              pecaEquipamentoId: peca.pecaEquipamentoId,
              aprovado: peca.aprovado,
              inspecionadoEm: peca.inspecionadoEm,
            }
          })
        }
      }
    },
  })
}

export async function finalizarInspecao({ inspecaoId, equipamentoId, status, finalizadoEm, inspecaoPeca }: finalizarInspecaoProps){
  
  const removePontosInspecionado = prisma.pontosInspecaoEquipamento.deleteMany({
    where: {
      inspecaoId,
    },
  })
  
  const atualizaInspecao = prisma.inspecaoEquipamento.updateMany({
    where: {
      id: inspecaoId,
      equipamentoId,
    },
    data: {
      finalizadoEm,
      statusInspecao: status,
    },    
  })

  const atualizaPontosInspecao = prisma.pontosInspecaoEquipamento.createMany({
    data: inspecaoPeca.map((peca) => {
      return {
        inspecaoId,
        equipamentoId,
        pecaEquipamentoId: peca.pecaEquipamentoId,
        aprovado: peca.aprovado,
        inspecionadoEm: peca.inspecionadoEm,
      }
    })
  })

  await prisma.$transaction([removePontosInspecionado, atualizaInspecao, atualizaPontosInspecao])
}

export async function atualizarAgendaEquipamento({ empresaId, equipamentoId }: EquipamentoProps){
  await prisma.agendaInspecaoEquipamento.updateMany({
    where: {
      equipamento: {
        empresaId,
        id: equipamentoId
      },
      inspecaoRealizada: false
    },
    data: {
      inspecaoRealizada: true
    }
  })
}

export async function agendarInspecaoEquipamento({ empresaId, equipamentoId }: EquipamentoProps){
  const dadosEquipamento = await prisma.equipamento.findUnique({
    where: {
      id: equipamentoId,
      empresaId
    }
  })

  if(dadosEquipamento){
    await prisma.agendaInspecaoEquipamento.create({
      data: {
        agendadoPara: addDays(new Date(), dadosEquipamento?.frequencia ?? 0),
        equipamentoId,
        inspecaoRealizada: false
      }
    })
  }
}
