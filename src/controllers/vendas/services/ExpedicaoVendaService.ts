import { prisma } from "../../../services/PrismaClientService"

export async function criarExpedicaoVenda(dados: {
  recebidoEm: Date
  vendasId: string
  usuarioId: string // Optional, assuming vendasId is the user ID
}) {
  return prisma.expedicaoVenda.create({
    data: {
      recebidoEm: dados.recebidoEm,
      vendasId: dados.vendasId,
      usuariosId: dados.usuarioId, // Assuming vendasId is the user ID
    },
  })
}

export async function listarExpedicoesPorEmpresa(empresaId: string) {
  return await prisma.expedicaoVenda.findMany({
    where: {
      venda: {
        cliente: {
          empresaId
        },
      },
    },
    include: {
      venda: true,
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
      expedicoes: {
        none: {},
      },
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
    },
  })

  return result._avg.avaliacaoExpedicao || 0
}

export async function obterResumoExpedicoes(empresaId: string) {
  const [realizadas, pendentes] = await Promise.all([
    prisma.expedicaoVenda.count({
      where: {
        venda: {
          cliente: {
            empresaId,
          },
        },
      },
    }),

    prisma.venda.count({
      where: {
        cliente: {
          empresaId,
        },
        expedicoes: {
          none: {},
        },
      },
    }),
  ])

  return { realizadas, pendentes }
}
