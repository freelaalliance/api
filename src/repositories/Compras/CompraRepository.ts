import { prisma } from '../../services/PrismaClientService'

interface NovaCompraProps {
  permiteEntregaParcial: boolean
  prazoEntrega: Date
  condicoesEntrega?: string
  codigo: string
  numPedido: number
  fornecedorId: string
  usuarioId: string
  itens: Array<{
    descricao: string
    quantidade: number
  }>
}

interface ConsultaPedidosFornecedorProps {
  idPedido?: string
  codigo?: string
  numPedido?: number
  fornecedorId?: string
  dataInicio?: Date
  dataFim?: Date
  empresaId: string
}

export async function cadastrarPedido({
  permiteEntregaParcial,
  prazoEntrega,
  condicoesEntrega,
  codigo,
  numPedido,
  fornecedorId,
  usuarioId,
  itens,
}: NovaCompraProps) {
  return await prisma.compras.create({
    select: {
      id: true,
      codigo: true,
    },
    data: {
      permiteEntregaParcial,
      prazoEntrega,
      condicoesEntrega,
      codigo,
      numPedido,
      fornecedor: { connect: { id: fornecedorId } },
      usuario: { connect: { id: usuarioId } },
      ItensCompra: { createMany: { data: itens } },
    },
  })
}

export async function listarPedidosFornecedor({
  fornecedorId,
  empresaId,
}: ConsultaPedidosFornecedorProps) {
  return await prisma.compras.findMany({
    select: {
      id: true,
      codigo: true,
      numPedido: true,
      permiteEntregaParcial: true,
      prazoEntrega: true,
      condicoesEntrega: true,
      recebido: true,
      cancelado: true,
      cadastradoEm: true,
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
      ItensCompra: {
        select: {
          id: true,
          descricao: true,
          quantidade: true,
        },
      },
      fornecedor: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
          documento: true,
          empresa: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                  Endereco: {
                    select: {
                      logradouro: true,
                      numero: true,
                      complemento: true,
                      bairro: true,
                      cidade: true,
                      estado: true,
                      cep: true,
                    },
                  },
                },
              },
              cnpj: true,
            },
          },
        },
      },
      RecebimentoCompras: {
        select: {
          id: true,
          recebidoEm: true,
          avaliacaoEntrega: true,
          numeroNota: true,
          numeroCertificado: true,
          usuario: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      fornecedor: {
        id: fornecedorId,
        empresaId,
      },
      excluido: false,
    },
    orderBy: {
      cadastradoEm: 'asc',
    },
  })
}

export async function listarPedidosEmpresa({
  empresaId,
  fornecedorId,
  numPedido,
  dataInicio,
  dataFim,
}: ConsultaPedidosFornecedorProps) {
  return await prisma.compras.findMany({
    select: {
      id: true,
      codigo: true,
      numPedido: true,
      permiteEntregaParcial: true,
      prazoEntrega: true,
      condicoesEntrega: true,
      recebido: true,
      cancelado: true,
      cadastradoEm: true,
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
      ItensCompra: {
        select: {
          id: true,
          descricao: true,
          quantidade: true,
        },
      },
      fornecedor: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
          documento: true,
        },
      },
    },
    where: {
      fornecedor: {
        empresaId,
      },
      excluido: false,
      cadastradoEm: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
    orderBy: {
      cadastradoEm: 'asc',
    },
  })
}

export async function listarPedidosPendentesEmpresa({
  empresaId,
}: ConsultaPedidosFornecedorProps) {
  return await prisma.compras.findMany({
    select: {
      id: true,
      codigo: true,
      numPedido: true,
      permiteEntregaParcial: true,
      prazoEntrega: true,
      condicoesEntrega: true,
      recebido: true,
      cancelado: true,
      cadastradoEm: true,
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
      ItensCompra: {
        select: {
          id: true,
          descricao: true,
          quantidade: true,
        },
      },
      fornecedor: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
          documento: true,
          empresa: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                  Endereco: {
                    select: {
                      logradouro: true,
                      numero: true,
                      complemento: true,
                      bairro: true,
                      cidade: true,
                      estado: true,
                      cep: true,
                    },
                  },
                },
              },
              cnpj: true,
            },
          },
        },
      },
      RecebimentoCompras: {
        select: {
          id: true,
          recebidoEm: true,
          avaliacaoEntrega: true,
          numeroCertificado: true,
          numeroNota: true,
          usuario: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      },
    },
    where: {

      fornecedor: {
        empresaId,
      },
      excluido: false,
      cancelado: false,
      recebido: false
    },
    orderBy: {
      prazoEntrega: 'asc',
    },
  })
}

export async function listarPedidosRecebidosEmpresa({
  empresaId,
}: ConsultaPedidosFornecedorProps) {
  return await prisma.compras.findMany({
    select: {
      id: true,
      codigo: true,
      numPedido: true,
      permiteEntregaParcial: true,
      prazoEntrega: true,
      condicoesEntrega: true,
      recebido: true,
      cancelado: true,
      cadastradoEm: true,
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
      ItensCompra: {
        select: {
          id: true,
          descricao: true,
          quantidade: true,
        },
      },
      fornecedor: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
          documento: true,
          empresa: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                  Endereco: {
                    select: {
                      logradouro: true,
                      numero: true,
                      complemento: true,
                      bairro: true,
                      cidade: true,
                      estado: true,
                      cep: true,
                    },
                  },
                },
              },
              cnpj: true,
            },
          },
        },
      },
      RecebimentoCompras: {
        select: {
          id: true,
          recebidoEm: true,
          avaliacaoEntrega: true,
          numeroCertificado: true,
          numeroNota: true,
          usuario: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      fornecedor: {
        empresaId,
      },
      excluido: false,
      cancelado: false,
      recebido: true
    },
    orderBy: {
      prazoEntrega: 'asc',
    },
  })
}

export async function buscarDadosPedido({
  idPedido,
  codigo,
  empresaId,
}: ConsultaPedidosFornecedorProps) {
  return await prisma.compras.findUniqueOrThrow({
    select: {
      id: true,
      codigo: true,
      numPedido: true,
      permiteEntregaParcial: true,
      prazoEntrega: true,
      condicoesEntrega: true,
      recebido: true,
      excluido: true,
      cadastradoEm: true,
      usuario: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
      ItensCompra: {
        select: {
          id: true,
          descricao: true,
          quantidade: true,
        },
      },
      fornecedor: {
        select: {
          id: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
          documento: true,
          empresa: {
            select: {
              id: true,
              pessoa: {
                select: {
                  nome: true,
                  Endereco: {
                    select: {
                      logradouro: true,
                      numero: true,
                      complemento: true,
                      bairro: true,
                      cidade: true,
                      estado: true,
                      cep: true,
                    },
                  },
                },
              },
              cnpj: true,
            },
          },
        },
      },
    },
    where: {
      id: idPedido,
      codigo,
      fornecedor: {
        empresaId,
      },
      excluido: false,
    },
  })
}

export async function excluirPedido({
  idPedido,
  empresaId,
}: ConsultaPedidosFornecedorProps) {
  return await prisma.compras.update({
    select: {
      id: true,
    },
    where: {
      id: idPedido,
      fornecedor: {
        empresaId,
      },
    },
    data: {
      excluido: true,
    },
  })
}

export async function cancelarPedido({
  idPedido,
  empresaId,
}: Pick<ConsultaPedidosFornecedorProps, 'idPedido' | 'empresaId'>) {
  return await prisma.compras.update({
    select: {
      id: true,
    },
    where: {
      id: idPedido,
      fornecedor: {
        empresaId,
      },
    },
    data: {
      cancelado: true,
    },
  })
}

export async function resumoPedidosEmpresa({
  empresaId,
}: ConsultaPedidosFornecedorProps) {
  const totalCompras = await prisma.compras.aggregate({
    _count: {
      _all: true,
    },
    where: {
      fornecedor: {
        empresaId,
      },
      excluido: false,
    },
  })

  const totalComprasCanceladas = await prisma.compras.aggregate({
    _count: {
      _all: true,
    },
    where: {
      fornecedor: {
        empresaId,
      },
      cancelado: true,
      excluido: false,
    },
  })

  const totalComprasRecebidas = await prisma.compras.aggregate({
    _count: {
      _all: true,
    },
    where: {
      fornecedor: {
        empresaId,
      },
      cancelado: false,
      recebido: true,
      excluido: false,
    },
  })

  const totalComprasPendentes = await prisma.compras.aggregate({
    _count: {
      _all: true,
    },
    where: {
      fornecedor: {
        empresaId,
      },
      cancelado: false,
      recebido: false,
      excluido: false,
    },
  })

  return {
    totalPedidos: totalCompras._count._all,
    totalCancelados: totalComprasCanceladas._count._all,
    totalRecebidos: totalComprasRecebidas._count._all,
    totalNaoRecebidos: totalComprasPendentes._count._all,
  }
}
