import { prisma } from "../../../services/PrismaClientService"

interface IniciarTreinamentoData {
  iniciadoEm: Date
  treinamentosId: string
  contratacaoColaboradorId: string
}

interface FinalizarTreinamentoData {
  finalizadoEm: Date
  certificado?: string
}

interface AtualizarTreinamentoData {
  iniciadoEm?: Date
  finalizadoEm?: Date
  certificado?: string
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
          tipo: true
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
      certificado: data.certificado
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true
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
          tipo: true
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
          tipo: true
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
          tipo: true
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
          tipo: true
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
          tipo: true
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
          tipo: true
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

export async function iniciarTreinamentosObrigatoriosCargo(contratacaoColaboradorId: string) {
  // Buscar os treinamentos obrigatórios do cargo
  const contratacao = await prisma.contratacaoColaborador.findUnique({
    where: { id: contratacaoColaboradorId },
    include: {
      cargo: {
        include: {
          treinamentosIntegracaoCargos: {
            where: {
              treinamento: {
                tipo: 'integracao'
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
        in: treinamentosObrigatorios.map(t => t.treinamento.id)
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