import { differenceInMinutes } from 'date-fns'

import { prisma } from '../../services/PrismaClientService'

interface NovaManutencaoProps {
  equipamentoId: string
  usuarioId: string
  observacao: string
}

interface IniciarManutencaoEquipamentoProps {
  equipamentoId: string
  manutencaoId: string
  iniciadoEm: Date
}

interface FinalizarManutencaoEquipamentoProps {
  equipamentoId: string
  manutencaoId: string
  finalizadoEm: Date
}

interface CancelarManutencaoEquipamentoProps {
  equipamentoId: string
  manutencaoId: string
  canceladoEm: Date
}

interface ConsultaManutencoesEquipamentoProps {
  equipamentoId?: string | null
  empresaId: string
}

export async function consultaDuracaoManutencoesEquipamento({
  equipamentoId,
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
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

export async function buscarManutencoesEquipamento({
  equipamentoId,
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
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
      tempoMaquinaOperacao: true,
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
      equipamentoId: equipamentoId ?? '',
      equipamento: {
        empresaId,
      },
    },
    orderBy: {
      criadoEm: 'desc',
    },
  })
}

export async function buscarManutencoesFinalizadasEquipamento({
  equipamentoId,
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  return await prisma.manutencao.findMany({
    select: {
      id: true,
      criadoEm: true,
      canceladoEm: true,
      finalizadoEm: true,
      iniciadoEm: true,
      observacoes: true,
      tempoMaquinaOperacao: true,
      duracao: true,
      equipamentoParado: true,
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
      equipamentoId: equipamentoId ?? '',
      equipamento: {
        empresaId,
      },
      canceladoEm: null,
      finalizadoEm: {
        not: null,
      },
    },
    orderBy: {
      iniciadoEm: 'desc',
    },
  })
}

export async function salvarNovaManutencao({
  equipamentoId,
  usuarioId,
  observacao: observacoes,
}: NovaManutencaoProps) {
  let tempoMaquinaOperacao = 0

  const verificaManutencoesEquipamento = await prisma.manutencao.findFirst({
    where: {
      equipamentoId,
      finalizadoEm: {
        not: null,
      },
    },
  })

  if (
    verificaManutencoesEquipamento &&
    verificaManutencoesEquipamento.finalizadoEm
  ) {
    tempoMaquinaOperacao = differenceInMinutes(
      new Date(),
      new Date(verificaManutencoesEquipamento.finalizadoEm),
    )
  } else {
    const dadosEquipamento = await prisma.equipamento.findUniqueOrThrow({
      where: {
        id: equipamentoId,
      },
    })

    if (dadosEquipamento) {
      tempoMaquinaOperacao = differenceInMinutes(
        new Date(),
        new Date(dadosEquipamento.cadastradoEm),
      )
    }
  }

  await prisma.equipamento.update({
    where: { id: equipamentoId },
    data: {
      status: 'parado',
    },
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
              nome: true,
            },
          },
        },
      },
    },
    data: {
      equipamentoId,
      usuarioId,
      observacoes,
      tempoMaquinaOperacao,
    },
  })
}

export async function cancelarManutencaoEquipamento({
  equipamentoId,
  manutencaoId,
  canceladoEm,
}: CancelarManutencaoEquipamentoProps) {
  return await prisma.manutencao.update({
    data: {
      canceladoEm,
      equipamento: {
        update: {
          status: 'operando',
        },
      },
    },
    where: {
      id: manutencaoId,
      equipamentoId,
    },
  })
}

export async function iniciarManutencaoEquipamento({
  equipamentoId,
  manutencaoId,
  iniciadoEm,
}: IniciarManutencaoEquipamentoProps) {
  return await prisma.manutencao.update({
    data: {
      iniciadoEm,
    },
    where: {
      id: manutencaoId,
      equipamentoId,
    },
  })
}

export async function finalizarManutencaoEquipamento({
  equipamentoId,
  manutencaoId,
  finalizadoEm,
}: FinalizarManutencaoEquipamentoProps) {
  const dadosManutencao = await prisma.manutencao.findFirstOrThrow({
    where: {
      id: manutencaoId,
      equipamentoId,
    },
  })

  if (dadosManutencao && dadosManutencao.iniciadoEm) {
    const duracaoManutencaoEmMinutos = differenceInMinutes(
      new Date(finalizadoEm),
      new Date(dadosManutencao.iniciadoEm),
    )
    const duracaoEquipamentoParadoEmMinutos = differenceInMinutes(
      new Date(finalizadoEm),
      new Date(dadosManutencao.criadoEm),
    )

    return await prisma.manutencao.update({
      data: {
        finalizadoEm,
        duracao: duracaoManutencaoEmMinutos,
        equipamentoParado: duracaoEquipamentoParadoEmMinutos,
        equipamento: {
          update: {
            concertadoEm: finalizadoEm,
            status: 'operando',
          },
        },
      },
      where: {
        id: manutencaoId,
        equipamentoId,
      },
    })
  }
}

export async function consultaQuantidadeEquipamentosParado({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`SELECT COUNT(equipamentos.id) AS 'qtd_equipamentos_parados' 
    FROM equipamentos 
    WHERE equipamentos.empresaId = ${empresaId}
    AND equipamentos.status = "parado"
  `
}

export async function consultaQuantidadeEquipamentosFuncionando({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`
    SELECT COUNT(equipamentos.id) AS 'qtd_equipamentos_funcionando'
    FROM equipamentos
    WHERE equipamentos.empresaId = ${empresaId}
    AND equipamentos.status = "operando"
  `
}

export async function consultaQuantidadeManutencoesEmAndamento({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  const estatisticasManutencoesEmpresa: {
    media_duracao: number
    total_duracao_manutencoes: number
    qtd_manutencoes_realizadas: number
  }[] = await prisma.$queryRaw`SELECT 
        COUNT(
          manutencoes.id
        ) AS 'qtd_manutencoes_realizadas',
        AVG(manutencoes.duracao) AS 'media_duracao',
        SUM(manutencoes.duracao) AS 'total_duracao_manutencoes'
        FROM manutencoes
        JOIN equipamentos ON manutencoes.equipamentoId = equipamentos.id
        WHERE equipamentos.empresaId = ${empresaId}
        AND manutencoes.finalizadoEm IS NOT NULL
  `

  return {
    media_duracao: Number(estatisticasManutencoesEmpresa[0].media_duracao),
    qtd_manutencoes_realizadas: Number(
      estatisticasManutencoesEmpresa[0].qtd_manutencoes_realizadas,
    ),
    total_duracao_manutencoes: Number(
      estatisticasManutencoesEmpresa[0].total_duracao_manutencoes,
    ),
  }
}

export async function consultaQuantidadeManutencoesEmDia({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw<
    Array<{
      id: string
      cadastradoEm: Date
      inspecionadoEm: Date | null
      frequencia: number
    }>
  >`SELECT
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

export async function buscaEstatisticasManutencoes({
  equipamentoId,
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  if (equipamentoId) {
    return await prisma.$queryRaw`
      SELECT 
        SUM(manutencoes.equipamentoParado) AS total_tempo_parado, 
        COUNT(manutencoes.id) AS qtd_manutencoes,
        equipamentos.tempoOperacao AS total_tempo_operacao
      FROM manutencoes 
      LEFT JOIN equipamentos ON equipamentos.id = manutencoes.equipamentoId
      WHERE equipamentos.empresaId = ${empresaId}
      AND equipamentos.id = ${equipamentoId}
      AND manutencoes.equipamentoParado IS NOT NULL
    `
  }
}

export async function buscaEstatisticasManutencoesEquipamentosEmpresa({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  return await prisma.$queryRaw`
    SELECT 
      SUM(manutencoes.equipamentoParado) AS total_tempo_parado, 
      COUNT(manutencoes.id) AS qtd_manutencoes,
      equipamentos.tempoOperacao AS total_tempo_operacao,
      equipamentos.nome
    FROM manutencoes 
    LEFT JOIN equipamentos ON equipamentos.id = manutencoes.equipamentoId
    WHERE equipamentos.empresaId = ${empresaId}
    AND manutencoes.equipamentoParado IS NOT NULL
    GROUP BY equipamentos.id
  `
}
