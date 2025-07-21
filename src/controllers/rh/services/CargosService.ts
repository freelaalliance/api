import { prisma } from "../../../services/PrismaClientService"

interface CargosData {
  nome: string
  atribuicoes: string
  superior: boolean
  experienciaMinima: string
  escolaridadeMinima: string
  empresasId: string
  treinamentos: Array<{
    id: string
  }>
}

interface AtualizarCargoData {
  nome?: string
  atribuicoes: string
  superior?: boolean
  experienciaMinima?: string
  escolaridadeMinima?: string
  treinamentos?: Array<{
    id: string
  }>
}

export async function criarCargo(data: CargosData) {
  const { treinamentos, ...cargoData } = data

  return await prisma.cargo.create({
    data: {
      ...cargoData,
      treinamentosIntegracaoCargos: {
        create: treinamentos.map(treinamento => ({
          treinamentosId: treinamento.id
        }))
      }
    },
    include: {
      treinamentosIntegracaoCargos: {
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    }
  })
}

export async function listarCargosEmpresa(empresaId: string) {
  return await prisma.cargo.findMany({
    where: {
      empresasId: empresaId,
    },
    include: {
      treinamentosIntegracaoCargos: {
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    }
  })
}

export async function atualizarCargo(cargoId: string, data: AtualizarCargoData) {
  return await prisma.cargo.update({
    where: {
      id: cargoId
    },
    data,
    include: {
      treinamentosIntegracaoCargos: {
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      }
    }
  })
}

export async function excluirCargo(cargoId: string) {
  const contratacoes = await prisma.contratacaoColaborador.findMany({
    where: {
      cargoId: cargoId,
      demitidoEm: null
    }
  })

  if (contratacoes.length > 0) {
    throw new Error("Não é possível excluir um cargo que possui colaboradores ativos")
  }

  return await prisma.cargo.update({
    where: {
      id: cargoId
    },
    data: {
      excluido: true
    }
  })
}

export async function listarTreinamentosCargo(cargoId: string) {
  return await prisma.cargo.findUnique({
    where: {
      id: cargoId,
    },
    include: {
      treinamentosIntegracaoCargos: {
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      },
    }
  })
}

export async function adicionarTreinamentoCargo(cargoId: string, treinamentoId: string) {
  // Verifica se a associação já existe
  const associacaoExistente = await prisma.treinamentosIntegracaoCargos.findUnique({
    where: {
      treinamentosId_cargosId: {
        treinamentosId: treinamentoId,
        cargosId: cargoId
      }
    }
  })

  if (associacaoExistente) {
    throw new Error("Este treinamento já está associado ao cargo")
  }

  return await prisma.treinamentosIntegracaoCargos.create({
    data: {
      cargosId: cargoId,
      treinamentosId: treinamentoId
    },
    include: {
      treinamento: {
        select: {
          id: true,
          nome: true,
          tipo: true
        }
      }
    }
  })
}

export async function removerTreinamentoCargo(cargoId: string, treinamentoId: string) {
  return await prisma.treinamentosIntegracaoCargos.delete({
    where: {
      treinamentosId_cargosId: {
        treinamentosId: treinamentoId,
        cargosId: cargoId
      }
    }
  })
}

export async function listarColaboradoresAtivosCargo(cargoId: string) {
  return await prisma.contratacaoColaborador.findMany({
    where: {
      cargoId: cargoId,
      demitidoEm: null
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            include: {
              TelefonePessoa: true,
              Endereco: true,
              EmailPessoa: true
            },
            select: {
              nome: true,
            }
          }
        }
      },
      treinamentosRealizados: {
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      }
    }
  })
}

export async function buscarCargoPorId(cargoId: string) {
  return await prisma.cargo.findUnique({
    where: {
      id: cargoId,
    },
    include: {
      treinamentosIntegracaoCargos: {
        include: {
          treinamento: {
            select: {
              id: true,
              nome: true,
              tipo: true
            }
          }
        }
      },
      contratacoes: {
        include: {
          colaborador: {
            include: {
              pessoa: {
                include: {
                  TelefonePessoa: true,
                  Endereco: true,
                  EmailPessoa: true
                },
                select: {
                  nome: true,
                }
              }
            }
          },
        }
      }
    }
  })
}