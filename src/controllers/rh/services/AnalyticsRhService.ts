import { prisma } from "../../../services/PrismaClientService"

interface PeriodoFiltro {
  inicio: Date
  fim: Date
}

interface AnalyticsColaboradores {
  colaboradoresAtivos: number
  colaboradoresInativos: number
  colaboradoresContratacosMesAtual: number
  colaboradoresContratacosMesAnterior: number
  percentualVariacao: number
}

interface AnalyticsRotatividade {
  admissoes: number
  demissoes: number
  totalColaboradores: number
  indiceRotatividade: number
}

interface AnalyticsTreinamentos {
  treinamentosIntegracao: {
    emAndamento: number
    finalizados: number
    total: number
  }
  treinamentosCapacitacao: {
    emAndamento: number
    finalizados: number
    total: number
  }
}

interface AnalyticsCargoColaboradores {
  cargoId: string
  nomeCargo: string
  totalColaboradores: number
}

export async function getAnalyticsColaboradores(empresaId: string): Promise<AnalyticsColaboradores> {
  const agora = new Date()
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0)

  // Colaboradores ativos (não demitidos)
  const colaboradoresAtivos = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      demitidoEm: null,
      excluido: false
    }
  })

  // Colaboradores inativos (demitidos)
  const colaboradoresInativos = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      demitidoEm: {
        not: null
      },
      excluido: false
    }
  })

  // Colaboradores contratados no mês atual
  const colaboradoresContratacosMesAtual = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      excluido: false,
      admitidoEm: {
        gte: inicioMesAtual
      }
    }
  })

  // Colaboradores contratados no mês anterior
  const colaboradoresContratacosMesAnterior = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      excluido: false,
      admitidoEm: {
        gte: inicioMesAnterior,
        lte: fimMesAnterior
      }
    }
  })

  // Calcular percentual de variação
  let percentualVariacao = 0
  if (colaboradoresContratacosMesAnterior > 0) {
    percentualVariacao = ((colaboradoresContratacosMesAtual - colaboradoresContratacosMesAnterior) / colaboradoresContratacosMesAnterior) * 100
  } else if (colaboradoresContratacosMesAtual > 0) {
    percentualVariacao = 100
  }

  return {
    colaboradoresAtivos,
    colaboradoresInativos,
    colaboradoresContratacosMesAtual,
    colaboradoresContratacosMesAnterior,
    percentualVariacao
  }
}

export async function getAnalyticsRotatividade(
  empresaId: string,
  periodo: PeriodoFiltro
): Promise<AnalyticsRotatividade> {
  // Admissões no período
  const admissoes = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      excluido: false,
      admitidoEm: {
        gte: periodo.inicio,
        lte: periodo.fim
      }
    }
  })

  // Demissões no período
  const demissoes = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      excluido: false,
      demitidoEm: {
        gte: periodo.inicio,
        lte: periodo.fim
      }
    }
  })

  // Total de colaboradores ativos no final do período
  const totalColaboradores = await prisma.contratacaoColaborador.count({
    where: {
      empresaId: empresaId,
      demitidoEm: null,
      excluido: false
    }
  })

  // Calcular índice de rotatividade
  let indiceRotatividade = 0
  if (totalColaboradores > 0) {
    indiceRotatividade = ((admissoes + demissoes) / totalColaboradores) * 100
  }

  return {
    admissoes,
    demissoes,
    totalColaboradores,
    indiceRotatividade
  }
}

export async function getAnalyticsTreinamentos(empresaId: string): Promise<AnalyticsTreinamentos> {
  // Usar raw query para evitar problemas de tipagem
  const treinamentosIntegracao = await prisma.$queryRaw<{ emAndamento: bigint, finalizados: bigint }[]>`
    SELECT 
      SUM(CASE WHEN tr.finalizadoEm IS NULL THEN 1 ELSE 0 END) as emAndamento,
      SUM(CASE WHEN tr.finalizadoEm IS NOT NULL THEN 1 ELSE 0 END) as finalizados
    FROM treinamentos_realizados tr
    INNER JOIN contratacao_colaborador cc ON cc.id = tr.contratacaoColaboradorId
    INNER JOIN treinamentos t ON t.id = tr.treinamentosId
    WHERE cc.empresaId = ${empresaId} AND t.tipo = 'integracao'
  `

  const treinamentosCapacitacao = await prisma.$queryRaw<{ emAndamento: bigint, finalizados: bigint }[]>`
    SELECT 
      SUM(CASE WHEN tr.finalizadoEm IS NULL THEN 1 ELSE 0 END) as emAndamento,
      SUM(CASE WHEN tr.finalizadoEm IS NOT NULL THEN 1 ELSE 0 END) as finalizados
    FROM treinamentos_realizados tr
    INNER JOIN contratacao_colaborador cc ON cc.id = tr.contratacaoColaboradorId
    INNER JOIN treinamentos t ON t.id = tr.treinamentosId
    WHERE cc.empresaId = ${empresaId} AND t.tipo = 'capacitacao'
  `

  const integracaoResult = treinamentosIntegracao[0] || { emAndamento: BigInt(0), finalizados: BigInt(0) }
  const capacitacaoResult = treinamentosCapacitacao[0] || { emAndamento: BigInt(0), finalizados: BigInt(0) }

  return {
    treinamentosIntegracao: {
      emAndamento: Number(integracaoResult.emAndamento),
      finalizados: Number(integracaoResult.finalizados),
      total: Number(integracaoResult.emAndamento) + Number(integracaoResult.finalizados)
    },
    treinamentosCapacitacao: {
      emAndamento: Number(capacitacaoResult.emAndamento),
      finalizados: Number(capacitacaoResult.finalizados),
      total: Number(capacitacaoResult.emAndamento) + Number(capacitacaoResult.finalizados)
    }
  }
}

export async function getAnalyticsColaboradoresPorCargo(empresaId: string): Promise<AnalyticsCargoColaboradores[]> {
  const result = await prisma.contratacaoColaborador.groupBy({
    by: ['cargoId'],
    where: {
      empresaId: empresaId,
      demitidoEm: null // Apenas colaboradores ativos
    },
    _count: {
      cargoId: true
    },
    orderBy: {
      _count: {
        cargoId: 'desc'
      }
    }
  })

  // Buscar os nomes dos cargos
  const cargosIds = result.map(item => item.cargoId)
  const cargos = await prisma.cargo.findMany({
    where: {
      id: {
        in: cargosIds
      }
    },
    select: {
      id: true,
      nome: true
    }
  })

  const cargosMap = new Map(cargos.map(cargo => [cargo.id, cargo.nome]))

  return result.map(item => ({
    cargoId: item.cargoId,
    nomeCargo: cargosMap.get(item.cargoId) || 'Cargo não encontrado',
    totalColaboradores: item._count.cargoId
  }))
}

export async function listarColaboradoresAtivos(empresaId: string) {
  return await prisma.contratacaoColaborador.findMany({
    where: {
      empresaId: empresaId,
      demitidoEm: null,
      excluido: false
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            select: {
              nome: true,
              EmailPessoa: {
                take: 1,
                select: {
                  email: true
                }
              },
              TelefonePessoa: {
                take: 1,
                select: {
                  numero: true
                }
              }
            }
          }
        }
      },
      cargo: {
        select: {
          nome: true
        }
      }
    },
    orderBy: {
      admitidoEm: 'desc'
    }
  })
}

export async function listarColaboradoresDemitidos(empresaId: string) {
  return await prisma.contratacaoColaborador.findMany({
    where: {
      empresaId: empresaId,
      excluido: false,
      demitidoEm: {
        not: null
      }
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            select: {
              nome: true,
              EmailPessoa: {
                take: 1,
                select: {
                  email: true
                }
              },
              TelefonePessoa: {
                take: 1,
                select: {
                  numero: true
                }
              }
            }
          }
        }
      },
      cargo: {
        select: {
          nome: true
        }
      }
    },
    orderBy: {
      demitidoEm: 'desc'
    }
  })
}

export async function listarColaboradoresEmTreinamento(empresaId: string) {
  return await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaborador: {
        empresaId: empresaId,
        demitidoEm: null // Apenas colaboradores ativos
      },
      finalizadoEm: null // Apenas treinamentos em andamento
    },
    include: {
      contratacaoColaborador: {
        include: {
          colaborador: {
            select: {
              documento: true,
              pessoa: {
                select: {
                  nome: true
                }
              }
            }
          },
          cargo: {
            select: {
              nome: true
            }
          }
        }
      },
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true
        }
      }
    },
    orderBy: {
      iniciadoEm: 'desc'
    }
  })
}

export function calcularPeriodoPorTipo(tipo: 'mes' | 'trimestre' | 'semestre' | 'anual'): PeriodoFiltro {
  const agora = new Date()
  let inicio: Date
  let fim: Date = new Date(agora.getFullYear(), agora.getMonth() + 1, 0) // Último dia do mês atual

  switch (tipo) {
    case 'mes':
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
      break
    case 'trimestre': {
      const mesTrimestre = Math.floor(agora.getMonth() / 3) * 3
      inicio = new Date(agora.getFullYear(), mesTrimestre, 1)
      fim = new Date(agora.getFullYear(), mesTrimestre + 3, 0)
      break
    }
    case 'semestre': {
      const mesSemestre = Math.floor(agora.getMonth() / 6) * 6
      inicio = new Date(agora.getFullYear(), mesSemestre, 1)
      fim = new Date(agora.getFullYear(), mesSemestre + 6, 0)
      break
    }
    case 'anual':
      inicio = new Date(agora.getFullYear(), 0, 1)
      fim = new Date(agora.getFullYear(), 11, 31)
      break
    default:
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
  }

  return { inicio, fim }
}
