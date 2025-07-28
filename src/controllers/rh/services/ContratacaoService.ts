import { prisma } from "../../../services/PrismaClientService"

interface DadosPessoa {
  nome: string
  Endereco?: {
    logradouro: string
    bairro: string
    cidade: string
    estado: string
    numero: string
    complemento?: string
    cep: string
  }
  TelefonePessoa?: Array<{
    codigoArea: string
    numero: string
  }>
  EmailPessoa?: Array<{
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
    chaveArquivo: string
    documento: string
  }>
}

interface AtualizarContratacaoData {
  admitidoEm?: Date
  demitidoEm?: Date
  cargoId?: string
}

export async function criarContratacao(data: ContratacaoData) {
  return await prisma.$transaction(async (tx) => {
    const colaboradorExistente = await tx.colaborador.findUnique({
      where: { documento: data.colaborador.documento },
      select: { id: true, pessoasId: true }
    })

    if (colaboradorExistente) {
      const contratacao = await tx.contratacaoColaborador.create({
        data: {
          admitidoEm: data.admitidoEm,
          empresaId: data.empresaId,
          cargoId: data.cargoId,
          colaboradoresId: colaboradorExistente.id,
          usuariosId: data.usuariosId
        },
      })

      return contratacao.id

    }
    const contratacao = await tx.pessoa.create({
      data: {
        nome: data.colaborador.pessoa.nome,
        Endereco: data.colaborador.pessoa.Endereco ? {
          create: {
            logradouro: data.colaborador.pessoa.Endereco.logradouro,
            bairro: data.colaborador.pessoa.Endereco.bairro,
            cidade: data.colaborador.pessoa.Endereco.cidade,
            estado: data.colaborador.pessoa.Endereco.estado,
            numero: data.colaborador.pessoa.Endereco.numero,
            complemento: data.colaborador.pessoa.Endereco.complemento,
            cep: data.colaborador.pessoa.Endereco.cep,
          }
        } : undefined,
        TelefonePessoa: {
          connectOrCreate: data.colaborador.pessoa.TelefonePessoa?.map(telefone => ({
            where: {
              numero: `${telefone.codigoArea}${telefone.numero}`
            },
            create: {
              numero: `${telefone.codigoArea}${telefone.numero}`
            },
          }))
        },
        EmailPessoa: {
          connectOrCreate: data.colaborador.pessoa.EmailPessoa?.map(email => ({
            where: {
              email: email.email
            },
            create: {
              email: email.email
            },
          })),
        },
        Colaborador: {
          create: {
            documento: data.colaborador.documento,
            contratacoes: {
              create: {
                admitidoEm: data.admitidoEm,
                empresaId: data.empresaId,
                cargoId: data.cargoId,
                usuariosId: data.usuariosId,
                documentosContrato: data.documentosContrato?.length ? {
                  createMany: {
                    data: data.documentosContrato
                  }
                } : undefined
              }
            }
          }
        }
      },
      include: {
        Colaborador: {
          include: {
            contratacoes: true
          }
        }
      }
    })

    return contratacao.Colaborador[0].contratacoes[0].id
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
            },
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
  await prisma.$transaction(async (tx) => {
    const { ...contratacaoData } = data
    await tx.contratacaoColaborador.update({
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

export async function adicionarDocumentoContrato(contratacaoId: string, documento: string, chaveArquivo: string) {
  return await prisma.documentosContrato.create({
    data: {
      chaveArquivo,
      documento,
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

export async function atualizarChaveArquivoDocumento(documentoId: number, chaveArquivo: string) {
  return await prisma.documentosContrato.update({
    where: {
      id: documentoId
    },
    data: {
      chaveArquivo
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

interface DadosColaborador {
  nome: string
  documento: string
  endereco?: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  telefones?: { numero: string }[]
  emails?: { email: string }[]
}

export async function atualizarDadosColaborador(contratacaoId: string, dados: DadosColaborador) {
  // Buscar a contratação para obter o colaborador
  const contratacao = await prisma.contratacaoColaborador.findUnique({
    where: { id: contratacaoId },
    include: {
      colaborador: {
        include: {
          pessoa: {
            include: {
              TelefonePessoa: true,
              EmailPessoa: true,
              Endereco: true,
            }
          }
        }
      }
    }
  })

  if (!contratacao) {
    throw new Error('Contratação não encontrada')
  }

  const colaboradorId = contratacao.colaborador.id
  const pessoaId = contratacao.colaborador.pessoa.id

  // Atualizar dados básicos
  await prisma.colaborador.update({
    where: { id: colaboradorId },
    data: {
      documento: dados.documento,
      pessoa: {
        update: {
          nome: dados.nome
        }
      }
    }
  })

  // Atualizar endereço
  if (dados.endereco) {
    if (contratacao.colaborador.pessoa.Endereco) {
      // Atualizar endereço existente
      await prisma.endereco.update({
        where: { pessoaId },
        data: {
          logradouro: dados.endereco.logradouro,
          numero: dados.endereco.numero,
          complemento: dados.endereco.complemento,
          bairro: dados.endereco.bairro,
          cidade: dados.endereco.cidade,
          estado: dados.endereco.estado,
          cep: dados.endereco.cep,
        }
      })
    } else {
      // Criar novo endereço
      await prisma.endereco.create({
        data: {
          pessoaId,
          logradouro: dados.endereco.logradouro,
          numero: dados.endereco.numero,
          complemento: dados.endereco.complemento,
          bairro: dados.endereco.bairro,
          cidade: dados.endereco.cidade,
          estado: dados.endereco.estado,
          cep: dados.endereco.cep,
        }
      })
    }
  }

  // Atualizar telefones
  if (dados.telefones) {
    // Remover telefones existentes
    await prisma.telefonePessoa.deleteMany({
      where: { pessoaId }
    })

    // Adicionar novos telefones
    if (dados.telefones.length > 0) {
      await prisma.telefonePessoa.createMany({
        data: dados.telefones.map((tel) => ({
          pessoaId,
          numero: tel.numero,
        }))
      })
    }
  }

  // Atualizar emails
  if (dados.emails) {
    // Remover emails existentes
    await prisma.emailPessoa.deleteMany({
      where: { pessoaId }
    })

    // Adicionar novos emails
    if (dados.emails.length > 0) {
      await prisma.emailPessoa.createMany({
        data: dados.emails.map((email) => ({
          pessoaId,
          email: email.email,
        }))
      })
    }
  }

  return true
}