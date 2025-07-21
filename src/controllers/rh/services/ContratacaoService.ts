import { prisma } from "../../../services/PrismaClientService"

interface DadosPessoa {
  nome: string
  endereco?: {
    logradouro: string
    bairro: string
    cidade: string
    estado: string
    numero: string
    complemento?: string
    cep: string
  }
  telefones?: Array<{
    numero: string
  }>
  emails?: Array<{
    email: string
  }>
}

interface ContratacaoData {
  admitidoEm: Date
  empresaId: string
  cargoId: string
  usuariosId: string
  colaborador: {
    documento: string
    pessoa: DadosPessoa
  }
  documentosContrato?: Array<{
    documento: string
  }>
}

interface AtualizarContratacaoData {
  admitidoEm?: Date
  demitidoEm?: Date
  cargoId?: string
  documentosContrato?: Array<{
    documento: string
  }>
}

export async function criarContratacao(data: ContratacaoData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Verificar se o colaborador já existe pelo documento
    const colaboradorExistente = await tx.colaborador.findUnique({
      where: { documento: data.colaborador.documento },
      select: { id: true, pessoasId: true }
    })

    let colaboradorId: string

    if (colaboradorExistente) {
      // Se colaborador já existe, apenas usar o ID existente
      colaboradorId = colaboradorExistente.id
    } else {
      // 2. Criar pessoa e colaborador em uma única operação
      const novoColaborador = await tx.colaborador.create({
        data: {
          documento: data.colaborador.documento,
          pessoa: {
            create: {
              nome: data.colaborador.pessoa.nome,
              Endereco: data.colaborador.pessoa.endereco ? {
                create: data.colaborador.pessoa.endereco
              } : undefined,
              TelefonePessoa: data.colaborador.pessoa.telefones ? {
                createMany: {
                  data: data.colaborador.pessoa.telefones
                }
              } : undefined,
              EmailPessoa: data.colaborador.pessoa.emails ? {
                createMany: {
                  data: data.colaborador.pessoa.emails
                }
              } : undefined
            }
          }
        },
        select: { id: true }
      })
      colaboradorId = novoColaborador.id
    }

    // 3. Criar a contratação com dados relacionados
    await tx.contratacaoColaborador.create({
      data: {
        admitidoEm: data.admitidoEm,
        empresaId: data.empresaId,
        cargoId: data.cargoId,
        colaboradoresId: colaboradorId,
        usuariosId: data.usuariosId,
        documentosContrato: data.documentosContrato?.length ? {
          createMany: {
            data: data.documentosContrato
          }
        } : undefined
      },
    })
  })
}

export async function listarContratacoes(empresaId: string) {
  return await prisma.contratacaoColaborador.findMany({
    where: {
      empresaId: empresaId
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      },
      cargo: {
        select: {
          id: true,
          nome: true
        }
      },
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      }
    },
    orderBy: {
      admitidoEm: 'desc'
    }
  })
}

export async function listarContratacaoAtivas(empresaId: string) {
  return await prisma.contratacaoColaborador.findMany({
    where: {
      empresaId: empresaId,
      demitidoEm: null
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      },
      cargo: {
        select: {
          id: true,
          nome: true
        }
      },
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      }
    },
    orderBy: {
      admitidoEm: 'desc'
    }
  })
}

export async function buscarContratacaoPorId(contratacaoId: string) {
  return await prisma.contratacaoColaborador.findUnique({
    where: {
      id: contratacaoId
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            include: {
              Endereco: true,
              TelefonePessoa: true,
              EmailPessoa: true
            }
          }
        }
      },
      cargo: {
        select: {
          id: true,
          nome: true,
          atribuicoes: true,
          superior: true,
          experienciaMinima: true,
          escolaridadeMinima: true
        }
      },
      empresa: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      },
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      },
      documentosContrato: true,
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

export async function atualizarContratacao(contratacaoId: string, data: AtualizarContratacaoData) {
  return await prisma.$transaction(async (tx) => {
    // Atualizar documentos se fornecidos
    if (data.documentosContrato) {
      // Remove documentos existentes
      await tx.documentosContrato.deleteMany({
        where: {
          contratacaoColaboradorId: contratacaoId
        }
      })

      // Adiciona novos documentos
      await tx.documentosContrato.createMany({
        data: data.documentosContrato.map(doc => ({
          documento: doc.documento,
          contratacaoColaboradorId: contratacaoId
        }))
      })
    }

    // Atualizar contratação
    const { documentosContrato, ...contratacaoData } = data
    return await tx.contratacaoColaborador.update({
      where: {
        id: contratacaoId
      },
      data: contratacaoData,
      include: {
        colaborador: {
          include: {
            pessoa: {
              include: {
                Endereco: true,
                TelefonePessoa: true,
                EmailPessoa: true
              }
            }
          }
        },
        cargo: {
          select: {
            id: true,
            nome: true
          }
        },
        documentosContrato: true
      }
    })
  })
}

export async function demitirColaborador(contratacaoId: string, dataDemissao: Date) {
  return await prisma.contratacaoColaborador.update({
    where: {
      id: contratacaoId
    },
    data: {
      demitidoEm: dataDemissao
    },
    include: {
      colaborador: {
        include: {
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
  })
}

export async function transferirColaborador(contratacaoId: string, novoCargoId: string) {
  return await prisma.contratacaoColaborador.update({
    where: {
      id: contratacaoId
    },
    data: {
      cargoId: novoCargoId
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      },
      cargo: {
        select: {
          id: true,
          nome: true
        }
      }
    }
  })
}

export async function buscarColaboradorPorDocumento(documento: string) {
  return await prisma.colaborador.findUnique({
    where: {
      documento: documento
    },
    include: {
      pessoa: {
        include: {
          Endereco: true,
          TelefonePessoa: true,
          EmailPessoa: true
        }
      },
      contratacoes: {
        include: {
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

export async function listarColaboradoresPorCargo(cargoId: string) {
  return await prisma.contratacaoColaborador.findMany({
    where: {
      cargoId: cargoId,
      demitidoEm: null
    },
    include: {
      colaborador: {
        include: {
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      },
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true
            }
          }
        }
      }
    }
  })
}

export async function adicionarDocumentoContrato(contratacaoId: string, documento: string) {
  return await prisma.documentosContrato.create({
    data: {
      documento: documento,
      contratacaoColaboradorId: contratacaoId
    }
  })
}

export async function removerDocumentoContrato(documentoId: number) {
  return await prisma.documentosContrato.delete({
    where: {
      id: documentoId
    }
  })
}

export async function listarDocumentosContrato(contratacaoId: string) {
  return await prisma.documentosContrato.findMany({
    where: {
      contratacaoColaboradorId: contratacaoId
    },
    orderBy: {
      id: 'desc'
    }
  })
}