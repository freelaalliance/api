import { differenceInMinutes } from "date-fns";
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
  finalizadoEm: Date,
}

interface CancelarManutencaoEquipamentoProps {
  equipamentoId: string,
  manutencaoId: string,
  canceladoEm: Date
}

interface ConsultaManutencoesEquipamentoProps {
  equipamentoId: string|null,
  empresaId: string,
}

export async function consultaDuracaoManutencoesEquipamento({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`SELECT SUM(duracao) AS 'duracao', DATE_FORMAT(manutencoes.iniciadoEm, '%Y-%m') AS 'inicioManutencao' 
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
      equipamentoId: equipamentoId ?? '',
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
      equipamentoId: equipamentoId ?? '',
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
  await prisma.equipamento.update({
    where: { id: equipamentoId },
    data: {
      status: 'parado'
    }
  })

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
      equipamento: {
        update: {
          status: 'operando'
        },
      }
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
        equipamentoParado: duracaoEquipamentoParadoEmMinutos,
        equipamento: {
          update: {
            concertadoEm: finalizadoEm,
            status: 'operando'
          },
        }
      },
      where: {
        id: manutencaoId,
        equipamentoId,
      }
    })
  }
}

export async function consultaQuantidadeEquipamentosParado({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`SELECT COUNT(equipamentos.id) AS 'qtd_equipamentos_parados' 
    FROM equipamentos 
    WHERE equipamentos.empresaId = ${empresaId}
    AND equipamentos.status = "parado"
  `
}

export async function consultaQuantidadeEquipamentosFuncionando({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`
    SELECT COUNT(equipamentos.id) AS 'qtd_equipamentos_funcionando'
    FROM equipamentos
    WHERE equipamentos.empresaId = ${empresaId}
    AND equipamentos.status = "operando"
  `
}

export async function consultaQuantidadeManutencoesEmAndamento({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`
    SELECT
      COUNT(equipamentos.id) AS 'qtd_equipamentos_em_manutencao'
    FROM manutencoes 
    JOIN equipamentos ON manutencoes.equipamentoId = equipamentos.id
    WHERE
      equipamentos.empresaId = ${empresaId}
      AND manutencoes.criadoEm IS NOT NULL
      AND manutencoes.iniciadoEm IS NOT NULL
      AND manutencoes.finalizadoEm IS NULL
      AND manutencoes.canceladoEm IS NULL
    GROUP BY equipamentos.id
  `
}

export async function consultaQuantidadeManutencoesEmDia({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw<Array<{
    id: string,
    cadastradoEm: Date,
    inspecionadoEm: Date | null,
    frequencia: number
  }>>`SELECT
      equipamentos.id,
      equipamentos.cadastradoEm,
      equipamentos.inspecionadoEm,
      equipamentos.frequencia
    FROM equipamentos
    WHERE
      equipamentos.empresaId = ${empresaId}
    GROUP BY equipamentos.id
  `
}

export async function buscaEstatisticasManutencoes({ equipamentoId, empresaId }: ConsultaManutencoesEquipamentoProps) {
  if(equipamentoId){
    return await prisma.$queryRaw`
      SELECT 
        SUM(manutencoes.equipamentoParado) AS total_tempo_parado, 
        COUNT(manutencoes.id) AS qtd_manutencoes
      FROM manutencoes 
      LEFT JOIN equipamentos ON equipamentos.id = manutencoes.equipamentoId
      WHERE equipamentos.empresaId = ${empresaId}
      AND equipamentos.id = ${equipamentoId}
      AND manutencoes.equipamentoParado IS NOT NULL
    `
  }
  
  return await prisma.$queryRaw`
    SELECT 
      SUM(manutencoes.equipamentoParado) AS total_tempo_parado, 
      COUNT(manutencoes.id) AS qtd_manutencoes
    FROM manutencoes 
    LEFT JOIN equipamentos ON equipamentos.id = manutencoes.equipamentoId
    WHERE equipamentos.empresaId = ${empresaId}
    AND manutencoes.equipamentoParado IS NOT NULL
  `
}