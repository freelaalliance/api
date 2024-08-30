import { addDays } from "date-fns";
import { 
  AtualizaEquipamentoProps, AtualizaPecaEquipamentoProps, EquipamentoProps, NovaPecaEquipamentoProps, NovoEquipamentoProps, PecaEquipamentoProps } from "../../interfaces/Manutencao/EquipamentoInterface";
import { prisma } from "../../services/PrismaClientService";

interface EquipamentosEmpresaProps {
  empresaId: string
}

interface EquipamentoCodigoEmpresaProps {
  codigo: string
  empresaId: string
}

export async function consultaCodigoEquipamento({codigo, empresaId}: EquipamentoCodigoEmpresaProps){
  return await prisma.equipamento.findFirstOrThrow({
    where: {
      codigo,
      empresaId
    }
  })
}

export async function inserirNovoEquipamento({
  codigo,
  nome,
  especificacao,
  frequencia,
  empresaId,
  tempoOperacao,
  pecas
}: NovoEquipamentoProps) {
  return await prisma.equipamento.create({
    data: {
      codigo,
      nome,
      especificacao,
      frequencia,
      empresaId,
      tempoOperacao,
      PecasEquipamento: {
        createMany: {
          data: pecas
        }
      },
      AgendaInspecaoEquipamento: {
        create: {
          agendadoPara: addDays(new Date(), frequencia),
        }
      }
    },
  })
}

export async function listarEquipamentosEmpresa({
  empresaId
}: EquipamentosEmpresaProps) {
  return await prisma.equipamento.findMany({
    where: {
      empresaId
    },
    orderBy: {
      nome: 'asc'
    }
  })
}

export async function listarPecasEquipamento({
  id,
  empresaId
}: PecaEquipamentoProps) {
  return await prisma.pecasEquipamento.findMany({
    where: {
      equipamentoId: id,
      equipamento: {
        empresaId
      }
    },
    orderBy: {
      nome: 'asc'
    }
  })
}

export async function modificarDadosEquipamento({
  id,
  codigo,
  nome,
  especificacao,
  frequencia,
  tempoOperacao,
  empresaId
}: AtualizaEquipamentoProps) {
  const atualizaEquipamento = await prisma.equipamento.update({
    data: {
      nome,
      codigo,
      especificacao,
      frequencia,
      tempoOperacao
    },
    where: {
      id,
      empresaId
    }
  })

  if(frequencia && atualizaEquipamento){
    const removeAgendamentosNaoRealizados = prisma.agendaInspecaoEquipamento.deleteMany({
      where: {
        equipamentoId: id,
        inspecaoRealizada: false
      }
    })

    const adicionaAgendamentoEquipamento = prisma.agendaInspecaoEquipamento.create({
      data: {
        agendadoPara: addDays(new Date(), frequencia),
        equipamentoId: id
      }
    })

    await prisma.$transaction([removeAgendamentosNaoRealizados, adicionaAgendamentoEquipamento])
  }

  return atualizaEquipamento
}

export async function modificarPecaEquipamento({
  id,
  descricao,
  nome,
  equipamentoId
}: AtualizaPecaEquipamentoProps) {
  return await prisma.pecasEquipamento.update({
    data: {
      descricao,
      nome
    },
    where: {
      id,
      equipamentoId
    }
  })
}

export async function inserirPecaEquipamento(pecas: Array<NovaPecaEquipamentoProps>) {
  return await prisma.pecasEquipamento.createMany({
    data: pecas
  })
}

export async function removerPecaEquipamento({
  id,
  empresaId
}: PecaEquipamentoProps) {
  return await prisma.pecasEquipamento.delete({
    where: {
      id,
      equipamento: {
        empresaId
      }
    }
  })
}

export async function removerEquipamento({
  id,
  empresaId
}: EquipamentoProps) {
  const removePecasEquipamento = prisma.pecasEquipamento.deleteMany({
    where: {
      equipamentoId: id,
      equipamento: {
        empresaId
      }
    }
  })
  const removeAgendaEquipamento = prisma.agendaInspecaoEquipamento.deleteMany({
    where: {
      equipamentoId: id,
      equipamento: {
        empresaId
      }
    }
  })
  const removeEquipamento = prisma.equipamento.delete({
    where: {
      id,
      empresaId
    }
  })

  await prisma.$transaction([
    removePecasEquipamento,
    removeAgendaEquipamento,
    removeEquipamento
  ])
}

export async function consultarAgendaEquipamento({id, empresaId}: EquipamentoProps) {
  return await prisma.agendaInspecaoEquipamento.findMany({
    select: {
      id: true,
      agendadoPara: true,
      inspecaoRealizada: true
    },
    where: {
      equipamentoId: id,
      equipamento: {
        empresaId
      }
    },
    orderBy: {
      agendadoPara: 'asc'
    }
  })
}

export async function consultarDadosEquipamento({id, empresaId}: EquipamentoProps){
  return await prisma.equipamento.findUnique({
    where: {
      id,
      empresaId
    }
  })
}