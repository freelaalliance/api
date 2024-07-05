import { prisma } from "../../services/PrismaClientService";

interface NovaManutencaoProps {
  equipamentoId: string,
  usuarioId: string,
  observacao: string,
}

interface IniciarManutencaoEquipamentoProps {
  equipamentoId: string,
  manutencaoId: string,
  iniciadoEm: Date
}

interface FinalizarManutencaoEquipamentoProps {
  equipamentoId: string,
  manutencaoId: string,
  finalizadoEm: Date
}

interface CancelarManutencaoEquipamentoProps {
  equipamentoId: string,
  manutencaoId: string,
  canceladoEm: Date
}

interface ConsultaManutencoesEquipamentoProps {
  equipamentoId: string,
  empresaId: string,
}

export async function buscarManutencoesEquipamento({equipamentoId, empresaId}:ConsultaManutencoesEquipamentoProps){
  return await prisma.manutencao.findMany({
    select: {
      id: true,
      criadoEm: true,
      canceladoEm: true,
      finalizadoEm: true,
      iniciadoEm: true,
      observacoes: true,
      usuario: {
        select: {
          pessoa: {
            select: {
              nome: true
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
      criadoEm: 'desc'
    }
  })
}

export async function salvarNovaManutencao({equipamentoId, usuarioId, observacao: observacoes}:NovaManutencaoProps){
  return await prisma.manutencao.create({
    data: {
      equipamentoId,
      usuarioId,
      observacoes,
    }
  })
}

export async function cancelarManutencaoEquipamento({equipamentoId, manutencaoId, canceladoEm}:CancelarManutencaoEquipamentoProps){
  return await prisma.manutencao.update({
    data: {
      canceladoEm,
    },
    where: {
      id: manutencaoId,
      equipamentoId,
    }
  })
}

export async function iniciarManutencaoEquipamento({equipamentoId, manutencaoId, iniciadoEm}:IniciarManutencaoEquipamentoProps){
  return await prisma.manutencao.update({
    data: {
      iniciadoEm,
    },
    where: {
      id: manutencaoId,
      equipamentoId,
    }
  })
}

export async function finalizarManutencaoEquipamento({equipamentoId, manutencaoId, finalizadoEm}:FinalizarManutencaoEquipamentoProps){
  return await prisma.manutencao.update({
    data: {
      finalizadoEm,
    },
    where: {
      id: manutencaoId,
      equipamentoId,
    }
  })
}
