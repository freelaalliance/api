import type { TipoTreinamento } from '@prisma/client'
import { prisma } from "../../../services/PrismaClientService"

interface IniciarTreinamentoData {
  iniciadoEm: Date
  treinamentosId: string
  contratacaoColaboradorId: string
}

interface FinalizarTreinamentoData {
  finalizadoEm: Date
  certificado?: string
  iniciadoEmConfirmado?: Date
}

interface AtualizarTreinamentoData {
  iniciadoEm?: Date
  finalizadoEm?: Date
  certificado?: string
}

interface DadosNovoTreinamento {
  nome: string
  tipo: 'integracao' | 'capacitacao' | 'reciclagem'
  grupo: 'interno' | 'externo'
}

interface RealizadoData {
  contratacaoColaboradorId: string
  iniciadoEm: Date
  finalizadoEm?: Date
  certificado?: string
}

interface CadastrarTreinamentoRealizadoData {
  treinamentosId?: string
  treinamento?: DadosNovoTreinamento
  cargoId: string
  empresaId: string
  realizados: RealizadoData[]
}

export interface TreinamentoRealizadoComDetalhes {
  id: string
  iniciadoEm: Date
  finalizadoEm: Date | null
  certificado: string | null
  treinamento: {
    id: string
    nome: string
    tipo: TipoTreinamento
    grupo: string
  }
  contratacaoColaborador: {
    id: string
    colaborador: {
      pessoa: {
        nome: string
      }
    }
    cargo: {
      nome: string
    }
  }
}

export async function iniciarTreinamento(data: IniciarTreinamentoData) {
  // Verificar se o treinamento já foi iniciado para este colaborador
  const treinamentoExistente = await prisma.treinamentoRealizado.findFirst({
    where: {
      treinamentosId: data.treinamentosId,
      contratacaoColaboradorId: data.contratacaoColaboradorId
    }
  })

  if (treinamentoExistente) {
    throw new Error("Este treinamento já foi iniciado para este colaborador")
  }

  return await prisma.treinamentoRealizado.create({
    data: {
      iniciadoEm: data.iniciadoEm,
      treinamentosId: data.treinamentosId,
      contratacaoColaboradorId: data.contratacaoColaboradorId
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          id: true,
          colaborador: {
            select: {
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
      }
    }
  })
}

export async function finalizarTreinamento(treinamentoRealizadoId: string, data: FinalizarTreinamentoData) {
  // Verificar se o treinamento existe e não foi finalizado
  const treinamento = await prisma.treinamentoRealizado.findUnique({
    where: { id: treinamentoRealizadoId },
    select: { finalizadoEm: true }
  })

  if (!treinamento) {
    throw new Error("Treinamento não encontrado")
  }

  if (treinamento.finalizadoEm) {
    throw new Error("Este treinamento já foi finalizado")
  }

  return await prisma.treinamentoRealizado.update({
    where: {
      id: treinamentoRealizadoId
    },
    data: {
      finalizadoEm: data.finalizadoEm,
      certificado: data.certificado,
      iniciadoEm: data.iniciadoEmConfirmado
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          id: true,
          colaborador: {
            select: {
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
      }
    }
  })
}

export async function listarTreinamentosColaborador(contratacaoColaboradorId: string) {
  return await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaboradorId: contratacaoColaboradorId
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      }
    },
    orderBy: {
      iniciadoEm: 'desc'
    }
  })
}

export async function listarTreinamentosEmpresa(empresaId: string) {
  return await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaborador: {
        empresaId: empresaId
      }
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          id: true,
          colaborador: {
            select: {
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
      }
    },
    orderBy: {
      iniciadoEm: 'desc'
    }
  })
}

export async function buscarTreinamentoRealizadoPorId(treinamentoRealizadoId: string) {
  return await prisma.treinamentoRealizado.findUnique({
    where: {
      id: treinamentoRealizadoId
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          id: true,
          admitidoEm: true,
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
          },
          empresa: {
            select: {
              pessoa: {
                select: {
                  nome: true
                }
              }
            }
          }
        }
      }
    }
  })
}

export async function atualizarTreinamentoRealizado(treinamentoRealizadoId: string, data: AtualizarTreinamentoData) {
  return await prisma.treinamentoRealizado.update({
    where: {
      id: treinamentoRealizadoId
    },
    data: data,
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          colaborador: {
            select: {
              pessoa: {
                select: {
                  nome: true
                }
              }
            }
          }
        }
      }
    }
  })
}

export async function cancelarTreinamento(treinamentoRealizadoId: string) {
  return await prisma.treinamentoRealizado.delete({
    where: {
      id: treinamentoRealizadoId
    }
  })
}

export async function listarTreinamentosPendentes(empresaId: string) {
  return await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaborador: {
        empresaId: empresaId
      },
      finalizadoEm: null
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          id: true,
          colaborador: {
            select: {
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
      }
    },
    orderBy: {
      iniciadoEm: 'asc'
    }
  })
}

export async function listarTreinamentosFinalizados(empresaId: string) {
  return await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaborador: {
        empresaId: empresaId
      },
      finalizadoEm: {
        not: null
      }
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true
        }
      },
      contratacaoColaborador: {
        select: {
          id: true,
          colaborador: {
            select: {
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
      }
    },
    orderBy: {
      finalizadoEm: 'desc'
    }
  })
}

export async function listarTreinamentosNaoRealizados(contratacaoColaboradorId: string, tipo?: 'integracao' | 'capacitacao') {
  // Buscar todos os treinamentos já realizados ou em andamento
  const treinamentosRealizados = await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaboradorId: contratacaoColaboradorId
    },
    select: {
      treinamentosId: true
    }
  })

  const idsRealizados = treinamentosRealizados.map(t => t.treinamentosId)

  // Buscar a contratação para verificar o cargo
  const contratacao = await prisma.contratacaoColaborador.findUnique({
    where: {
      id: contratacaoColaboradorId,
      excluido: false
    },
    select: {
      cargoId: true,
      empresaId: true
    }
  })

  if (!contratacao) {
    throw new Error("Contratação não encontrada")
  }

  // Construir filtros baseados no tipo
  interface WhereClause {
    excluido: boolean
    id: {
      notIn: string[]
    }
    tipo?: 'integracao' | 'capacitacao'
    empresasId: string
  }

  const whereClause: WhereClause = {
    excluido: false,
    id: {
      notIn: idsRealizados
    },
    empresasId: contratacao.empresaId
  }

  if (tipo) {
    whereClause.tipo = tipo
  }

  // Buscar treinamentos disponíveis
  let treinamentosDisponiveis = await prisma.treinamento.findMany({
    where: whereClause,
    select: {
      id: true,
      nome: true,
      tipo: true,
      grupo: true
    },
    orderBy: {
      nome: 'asc'
    }
  })

  // Se for tipo integração, filtrar apenas os obrigatórios do cargo
  if (tipo === 'integracao') {
    const treinamentosObrigatoriosCargo = await prisma.treinamentosIntegracaoCargos.findMany({
      where: {
        cargosId: contratacao.cargoId,
        treinamento: {
          tipo: 'integracao',
          excluido: false
        }
      },
      select: {
        treinamentosId: true
      }
    })

    const idsObrigatorios = treinamentosObrigatoriosCargo.map(t => t.treinamentosId)
    treinamentosDisponiveis = treinamentosDisponiveis.filter((t: { id: string }) => idsObrigatorios.includes(t.id))
  }

  return treinamentosDisponiveis
}

export async function iniciarTreinamentosObrigatoriosCargo(contratacaoColaboradorId: string) {
  // Buscar os treinamentos obrigatórios do cargo
  const contratacao = await prisma.contratacaoColaborador.findUnique({
    where: {
      id: contratacaoColaboradorId,
      excluido: false
    },
    include: {
      cargo: {
        include: {
          treinamentosIntegracaoCargos: {
            where: {
              treinamento: {
                tipo: 'integracao',
                excluido: false
              }
            },
            include: {
              treinamento: true
            }
          }
        }
      }
    }
  })

  if (!contratacao) {
    throw new Error("Contratação não encontrada")
  }

  const treinamentosObrigatorios = contratacao.cargo.treinamentosIntegracaoCargos

  // Verificar quais treinamentos já foram iniciados
  const treinamentosJaIniciados = await prisma.treinamentoRealizado.findMany({
    where: {
      contratacaoColaboradorId: contratacaoColaboradorId,
      treinamentosId: {
        in: treinamentosObrigatorios.map(t => t.treinamento.id),
      }
    },
    select: {
      treinamentosId: true
    }
  })

  const idsJaIniciados = treinamentosJaIniciados.map(t => t.treinamentosId)

  // Criar registros para treinamentos não iniciados
  const treinamentosParaIniciar = treinamentosObrigatorios
    .filter(t => !idsJaIniciados.includes(t.treinamento.id))
    .map(t => ({
      iniciadoEm: new Date(),
      treinamentosId: t.treinamento.id,
      contratacaoColaboradorId: contratacaoColaboradorId
    }))

  if (treinamentosParaIniciar.length > 0) {
    await prisma.treinamentoRealizado.createMany({
      data: treinamentosParaIniciar
    })
  }

  return {
    treinamentosIniciados: treinamentosParaIniciar.length,
    treinamentosJaExistentes: idsJaIniciados.length
  }
}

export async function listarTreinamentosPorCargo(cargoId: string, empresaId: string) {
  return await prisma.treinamentosIntegracaoCargos.findMany({
    where: {
      cargosId: cargoId,
      treinamento: {
        empresasId: empresaId,
        excluido: false,
      },
    },
    select: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true,
          grupo: true,
        },
      },
    },
  })
}

export async function cadastrarTreinamentoComRealizados(data: CadastrarTreinamentoRealizadoData) {
  return await prisma.$transaction(async (tx) => {
    let treinamentoId: string

    if (data.treinamentosId) {
      const treinamentoExistente = await tx.treinamento.findUnique({
        where: { id: data.treinamentosId, excluido: false },
      })

      if (!treinamentoExistente) {
        throw new Error('Treinamento não encontrado')
      }

      treinamentoId = treinamentoExistente.id
    } else if (data.treinamento) {
      const novoTreinamento = await tx.treinamento.create({
        data: {
          nome: data.treinamento.nome,
          tipo: data.treinamento.tipo,
          grupo: data.treinamento.grupo,
          empresasId: data.empresaId,
        },
      })

      treinamentoId = novoTreinamento.id
    } else {
      throw new Error(
        'Informe o ID do treinamento existente ou os dados de um novo treinamento'
      )
    }

    const vinculoExistente = await tx.treinamentosIntegracaoCargos.findUnique({
      where: {
        treinamentosId_cargosId: {
          treinamentosId: treinamentoId,
          cargosId: data.cargoId,
        },
      },
    })

    if (!vinculoExistente) {
      await tx.treinamentosIntegracaoCargos.create({
        data: {
          treinamentosId: treinamentoId,
          cargosId: data.cargoId,
        },
      })
    }

    const realizadosCriados: TreinamentoRealizadoComDetalhes[] = []

    for (const realizado of data.realizados) {
      const existente = await tx.treinamentoRealizado.findFirst({
        where: {
          treinamentosId: treinamentoId,
          contratacaoColaboradorId: realizado.contratacaoColaboradorId,
        },
      })

      if (existente) {
        throw new Error(
          `Treinamento já registrado para o colaborador com contratação ${realizado.contratacaoColaboradorId}`
        )
      }

      const treinamentoRealizado = await tx.treinamentoRealizado.create({
        data: {
          treinamentosId: treinamentoId,
          contratacaoColaboradorId: realizado.contratacaoColaboradorId,
          iniciadoEm: realizado.iniciadoEm,
          finalizadoEm: realizado.finalizadoEm,
          certificado: realizado.certificado,
        },
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true,
              tipo: true,
              grupo: true,
            },
          },
          contratacaoColaborador: {
            select: {
              id: true,
              colaborador: {
                select: {
                  pessoa: {
                    select: {
                      nome: true,
                    },
                  },
                },
              },
              cargo: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      })

      realizadosCriados.push(treinamentoRealizado)
    }

    return realizadosCriados
  })
}