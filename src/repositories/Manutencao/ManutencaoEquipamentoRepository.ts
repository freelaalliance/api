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
  return await prisma.$transaction(async (tx) => {
    // Busca última manutenção finalizada OU dados do equipamento em uma única query otimizada
    const ultimaManutencao = await tx.manutencao.findFirst({
      select: {
        finalizadoEm: true,
      },
      where: {
        equipamentoId,
        finalizadoEm: {
          not: null,
        },
      },
      orderBy: {
        finalizadoEm: 'desc',
      },
      take: 1,
    })

    let tempoMaquinaOperacao = 0

    if (ultimaManutencao?.finalizadoEm) {
      tempoMaquinaOperacao = differenceInMinutes(
        new Date(),
        new Date(ultimaManutencao.finalizadoEm),
      )
    } else {
      // Só busca o equipamento se não houver manutenção anterior
      const equipamento = await tx.equipamento.findUniqueOrThrow({
        select: {
          cadastradoEm: true,
        },
        where: {
          id: equipamentoId,
        },
      })

      tempoMaquinaOperacao = differenceInMinutes(
        new Date(),
        new Date(equipamento.cadastradoEm),
      )
    }

    // Atualiza status do equipamento e cria manutenção atomicamente
    const [, novaManutencao] = await Promise.all([
      tx.equipamento.update({
        where: { id: equipamentoId },
        data: {
          status: 'parado',
        },
      }),
      tx.manutencao.create({
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
      }),
    ])

    return novaManutencao
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
  return await prisma.$transaction(async (tx) => {
    const dadosManutencao = await tx.manutencao.findFirstOrThrow({
      select: {
        iniciadoEm: true,
        criadoEm: true,
      },
      where: {
        id: manutencaoId,
        equipamentoId,
      },
    })

    if (!dadosManutencao.iniciadoEm) {
      throw new Error('Manutenção não foi iniciada')
    }

    const duracaoManutencaoEmMinutos = differenceInMinutes(
      new Date(finalizadoEm),
      new Date(dadosManutencao.iniciadoEm)
    )
    const duracaoEquipamentoParadoEmMinutos = differenceInMinutes(
      new Date(finalizadoEm),
      new Date(dadosManutencao.criadoEm)
    )

    return await tx.manutencao.update({
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
  })
}

export async function consultaQuantidadeEquipamentosParado({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  const count = await prisma.equipamento.count({
    where: {
      empresaId,
      status: 'parado',
    },
  })

  return { qtd_equipamentos_parados: count }
}

export async function consultaQuantidadeEquipamentosFuncionando({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  const count = await prisma.equipamento.count({
    where: {
      empresaId,
      status: 'operando',
    },
  })

  return { qtd_equipamentos_funcionando: count }
}

export async function consultaQuantidadeManutencoesEmAndamento({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  const estatisticas = await prisma.manutencao.aggregate({
    _count: {
      id: true,
    },
    _avg: {
      duracao: true,
    },
    _sum: {
      duracao: true,
    },
    where: {
      equipamento: {
        empresaId,
      },
      finalizadoEm: {
        not: null,
      },
    },
  })

  return {
    media_duracao: estatisticas._avg.duracao ?? 0,
    qtd_manutencoes_realizadas: estatisticas._count.id,
    total_duracao_manutencoes: estatisticas._sum.duracao ?? 0,
  }
}

export async function consultaQuantidadeManutencoesEmDia({
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  return await prisma.equipamento.findMany({
    select: {
      id: true,
      cadastradoEm: true,
      inspecionadoEm: true,
      frequencia: true,
    },
    where: {
      empresaId,
    },
  })
}

export async function buscaEstatisticasManutencoes({
  equipamentoId,
  empresaId,
}: ConsultaManutencoesEquipamentoProps) {
  if (!equipamentoId) {
    return null
  }

  const [estatisticas, equipamento] = await Promise.all([
    prisma.manutencao.aggregate({
      _sum: {
        equipamentoParado: true,
      },
      _count: {
        id: true,
      },
      where: {
        equipamentoId,
        equipamento: {
          empresaId,
        },
        equipamentoParado: {
          not: null,
        },
      },
    }),
    prisma.equipamento.findUnique({
      select: {
        tempoOperacao: true,
      },
      where: {
        id: equipamentoId,
        empresaId,
      },
    }),
  ])

  if (!equipamento) {
    return null
  }

  return {
    total_tempo_parado: estatisticas._sum.equipamentoParado ?? 0,
    qtd_manutencoes: estatisticas._count.id,
    total_tempo_operacao: equipamento.tempoOperacao,
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
