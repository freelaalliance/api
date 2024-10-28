import { prisma } from '../../services/PrismaClientService'

interface InserirRecebimentoPedidoProps {
  compraId: string
  usuarioId: string
  recebidoEm: Date
  avaliacaoEntrega: number
  numeroNota?: string
  numeroCertificado?: string
  avaria: boolean
  quantidadeIncorreta: boolean
  entregaCompleta: boolean
  empresaId: string
}

interface ConsultaRecebimentosFornecedorProps {
  idPedido?: string
  numPedido?: number
  fornecedorId?: string
  dataInicio?: Date
  dataFim?: Date
  empresaId: string
}

export async function registrarRecebimentoPedido({
  compraId,
  usuarioId,
  recebidoEm,
  avaliacaoEntrega,
  numeroNota,
  numeroCertificado,
  avaria,
  quantidadeIncorreta,
  entregaCompleta,
  empresaId,
}: InserirRecebimentoPedidoProps) {
  const consultaPedido = await prisma.compras.findUnique({
    where: {
      id: compraId,
      fornecedor: {
        empresaId,
      },
    },
    select: {
      fornecedorId: true,
    },
  })

  if (consultaPedido) {
    const recebimento = await prisma.recebimentoCompras.create({
      data: {
        compraId,
        usuarioId,
        recebidoEm,
        avaliacaoEntrega: Number(avaliacaoEntrega.toFixed(1)),
        AvaliacaoRecebimento: {
          create: {
            numeroNota,
            numeroCertificado,
            avaria,
            quantidadeIncorreta,
          },
        },
      },
    })

    await prisma.desempenhoFornecedor.create({
      data: {
        fornecedorId: consultaPedido.fornecedorId,
        nota: avaliacaoEntrega,
      },
    })

    const totalMediaNotasDesempenho =
      await prisma.desempenhoFornecedor.aggregate({
        _avg: {
          nota: true,
        },
        where: {
          fornecedorId: consultaPedido.fornecedorId,
        },
      })

    await prisma.fornecedor.update({
      where: {
        id: consultaPedido.fornecedorId,
      },
      data: {
        desempenho: totalMediaNotasDesempenho._avg.nota ?? 0,
      },
    })

    await prisma.compras.update({
      where: {
        id: compraId,
      },
      data: {
        recebido: entregaCompleta,
      },
    })

    return recebimento
  }
  return null
}

export async function listarRecebimentosFornecedorEmpresa({
  empresaId,
  fornecedorId,
  numPedido,
  dataFim,
  dataInicio,
}: ConsultaRecebimentosFornecedorProps) {
  return await prisma.recebimentoCompras.findMany({
    select: {
      id: true,
      recebidoEm: true,
      avaliacaoEntrega: true,
      AvaliacaoRecebimento: {
        select: {
          numeroNota: true,
          numeroCertificado: true,
          avaria: true,
          quantidadeIncorreta: true,
        },
      },
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
    where: {
      compra: {
        AND: {
          numPedido,
        },
        fornecedor: {
          id: fornecedorId,
          empresaId,
        },
      },
      recebidoEm: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
    orderBy: {
      recebidoEm: 'desc',
    },
  })
}

export async function resumoRecebimentoPedidosEmpresa({
  empresaId,
  fornecedorId,
  numPedido,
  dataFim,
  dataInicio,
}: ConsultaRecebimentosFornecedorProps) {
  const dadosRecebimento = await prisma.recebimentoCompras.aggregate({
    _avg: {
      avaliacaoEntrega: true,
    },
    _count: {
      _all: true,
    },
    where: {
      compra: {
        numPedido,
        fornecedor: {
          empresaId,
          id: fornecedorId,
        },
      },
      recebidoEm: {
        gte: dataInicio,
        lte: dataFim,
      },
    },
  })

  const dadosAvaliacaoRecebimento = await prisma.avaliacaoRecebimento.aggregate(
    {
      _count: {
        avaria: true,
        quantidadeIncorreta: true,
      },
      where: {
        recebimentoCompras: {
          compra: {
            numPedido,
            fornecedor: {
              empresaId,
              id: fornecedorId,
            },
          },
          recebidoEm: {
            gte: dataInicio,
            lte: dataFim,
          },
        },
      },
    },
  )

  return {
    recebimento: dadosRecebimento._avg.avaliacaoEntrega,
    avaria: dadosAvaliacaoRecebimento._count.avaria,
    quantidadeIncorreta: dadosAvaliacaoRecebimento._count.quantidadeIncorreta,
    totalRecebimentos: dadosRecebimento._count._all,
  }
}
