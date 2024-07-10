import { differenceInMinutes } from "date-fns";
import { prisma } from "../../services/PrismaClientService";
import { Prisma } from "@prisma/client";

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
  finalizadoEm: Date,
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

export async function consultaDuracaoManutencoesEquipamento({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw<Array<{
    duracao: number,
    inicioManutencao: string,
  }>>(
    Prisma.sql`
      SELECT SUM(duracao) AS 'duracao', DATE_FORMAT(manutencoes.iniciadoEm, '%Y-%m') AS 'inicioManutencao' 
      FROM manutencoes 
      JOIN equipamentos ON manutencoes.equipamentoId = equipamentos.id 
      WHERE equipamentos.id = ${equipamentoId} 
      AND equipamentos.empresaId = ${empresaId}
      AND manutencoes.iniciadoEm IS NOT NULL
      AND manutencoes.finalizadoEm IS NOT NULL
      AND manutencoes.canceladoEm IS NULL
      AND DATE_FORMAT(manutencoes.iniciadoEm, '%Y') = DATE_FORMAT(curdate(), '%Y')
      GROUP BY DATE_FORMAT(manutencoes.iniciadoEm, '%Y-%m')
      ORDER BY DATE_FORMAT(manutencoes.iniciadoEm, '%Y-%m') ASC
    `
  )
}

export async function buscarManutencoesEquipamento({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.manutencao.findMany({
    select: {
      id: true,
      criadoEm: true,
      canceladoEm: true,
      finalizadoEm: true,
      iniciadoEm: true,
      observacoes: true,
      equipamentoId: true,
      duracao: true,
      equipamentoParado: true,
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

export async function buscarManutencoesFinalizadasEquipamento({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.manutencao.findMany({
    select: {
      id: true,
      criadoEm: true,
      canceladoEm: true,
      finalizadoEm: true,
      iniciadoEm: true,
      observacoes: true,
      duracao: true,
      equipamentoParado: true,
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
      },
      canceladoEm: null,
      finalizadoEm: {
        not: null
      }
    },
    orderBy: {
      iniciadoEm: 'desc'
    }
  })
}

export async function salvarNovaManutencao({ equipamentoId, usuarioId, observacao: observacoes }: NovaManutencaoProps) {
  return await prisma.manutencao.create({
    select: {
      id: true,
      criadoEm: true,
      canceladoEm: true,
      finalizadoEm: true,
      iniciadoEm: true,
      observacoes: true,
      equipamentoId: true,
      duracao: true,
      equipamentoParado: true,
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
    data: {
      equipamentoId,
      usuarioId,
      observacoes,
    }
  })
}

export async function cancelarManutencaoEquipamento({ equipamentoId, manutencaoId, canceladoEm }: CancelarManutencaoEquipamentoProps) {
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

export async function iniciarManutencaoEquipamento({ equipamentoId, manutencaoId, iniciadoEm }: IniciarManutencaoEquipamentoProps) {
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

export async function finalizarManutencaoEquipamento({ equipamentoId, manutencaoId, finalizadoEm }: FinalizarManutencaoEquipamentoProps) {
  const dadosManutencao = await prisma.manutencao.findFirstOrThrow({
    where: {
      id: manutencaoId,
      equipamentoId,
    }
  })

  if (dadosManutencao && dadosManutencao.iniciadoEm) {
    const duracaoManutencaoEmMinutos = differenceInMinutes(new Date(finalizadoEm), new Date(dadosManutencao.iniciadoEm))
    const duracaoEquipamentoParadoEmMinutos = differenceInMinutes(new Date(finalizadoEm), new Date(dadosManutencao.criadoEm))

    return await prisma.manutencao.update({
      data: {
        finalizadoEm,
        duracao: duracaoManutencaoEmMinutos,
        equipamentoParado: duracaoEquipamentoParadoEmMinutos
      },
      where: {
        id: manutencaoId,
        equipamentoId,
      }
    })
  }
}
