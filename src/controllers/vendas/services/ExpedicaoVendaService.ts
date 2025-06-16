import { prisma } from "../../../services/PrismaClientService"


export async function listarExpedicoesPorEmpresa(empresaId: string) {
  return await prisma.expedicaoVenda.findMany({
    where: {
      venda: {
        cliente: {
          empresaId
        },
      },
      cadastradoEm: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        lte: new Date(),
      }
    },
    include: {
      venda: {
        include: {
          cliente: {
            include: {
              pessoa: true,
            },
          }
        }
      },
      usuario: {
        include: {
          pessoa: true,
        },
      },
      avaliacoes: {
        include: { item: true },
      },
    },
    orderBy: { cadastradoEm: 'desc' },
  })
}

export async function buscarVendasNaoExpedidas(empresaId: string) {
  return prisma.venda.findMany({
    where: {
      cliente: {
        empresaId,
      },
      expedido: false
    },
    include: {
      usuario: {
        include: {
          pessoa: true,
        },
      },
      cliente: {
        include: {
          pessoa: {
            include: {
              Endereco: true,
              TelefonePessoa: true,
              EmailPessoa: true,
            },
          },
        },
      },
      itensVenda: {
        include: {
          produtoServico: true,
        },
      },
    },
    orderBy: {
      cadastradoEm: 'desc',
    },
  })
}

export async function obterMediaAvaliacaoExpedicoes(empresaId: string) {
  const result = await prisma.expedicaoVenda.aggregate({
    _avg: {
      avaliacaoExpedicao: true,
    },
    where: {
      venda: {
        cliente: {
          empresaId,
        },
      },
      cadastradoEm: {
        gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        lte: new Date(),
      }
    },
  })

  return result._avg.avaliacaoExpedicao || 0
}

export async function obterResumoExpedicoes(empresaId: string) {
  const [realizadas, pendentes, total] = await Promise.all([
    prisma.expedicaoVenda.count({
      where: {
        venda: {
          cliente: {
            empresaId,
          },
        },
        cadastradoEm: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          lte: new Date(),
        }
      },
    }),

    prisma.venda.count({
      where: {
        cliente: {
          empresaId,
        },
        expedido: false,
        cadastradoEm: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          lte: new Date(),
        }
      },
    }),

    prisma.venda.count({
      where: {
        cliente: {
          empresaId,
        },
        expedido: false,
        cadastradoEm: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          lte: new Date(),
        }
      },
    }),
  ])

  return { realizadas, pendentes, total }
}
