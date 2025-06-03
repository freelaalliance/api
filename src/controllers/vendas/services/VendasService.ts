import { prisma } from "../../../services/PrismaClientService"

interface ItemVenda {
  produtosServicosId: string
  quantidade: number
}

interface NovaVendaParams {
  permiteEntregaParcial: boolean
  prazoEntrega: Date
  condicoes?: string | null
  codigo: string
  numPedido: number
  clienteId: string
  usuarioId: string
  empresaId: string
  itens: ItemVenda[]
}

export async function criarVenda({
  permiteEntregaParcial,
  prazoEntrega,
  condicoes,
  codigo,
  numPedido,
  clienteId,
  usuarioId,
  empresaId,
  itens,
}: NovaVendaParams) {
  const vendaCriada = await prisma.venda.create({
    data: {
      permiteEntregaParcial,
      prazoEntrega,
      condicoes,
      codigo,
      numPedido,
      clientesId: clienteId,
      usuariosId: usuarioId,
      empresasId: empresaId,
      itensVenda: {
        createMany: {
          data: itens.map((item) => ({
            produtosServicosId: item.produtosServicosId,
            quantidade: item.quantidade,
          })),
        },
      },
    },
  })

  return vendaCriada
}

export async function cancelarVenda(vendaId: string, empresaId: string) {
  const venda = await prisma.venda.updateMany({
    where: {
      id: vendaId,
      empresasId: empresaId,
      cancelado: false,
    },
    data: {
      cancelado: true,
    },
  })

  return venda
}

export async function buscarVendaPorClienteId(clienteId: string, empresaId: string) {
  const venda = await prisma.venda.findMany({
    where: {
      clientesId: clienteId,
      empresasId: empresaId,
    },
    include: {
      usuario: {
        include: {
          pessoa: true,
        },
      },
      cliente: {
        include: {
          pessoa: true,
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
    }
  })

  return venda
}

export async function buscarVendaPorId(vendaId: string, empresaId: string) {
  const venda = await prisma.venda.findUniqueOrThrow({
    where: { id: vendaId, cancelado: false },
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
              EmailPessoa: true,
              Endereco: true,
              TelefonePessoa: true,
            }
          },
        },
      },
      itensVenda: {
        include: {
          produtoServico: true,
        },
      },
    },
  })

  if (!venda) {
    throw new Error('Venda não encontrada')
  }

  const email =
    venda.cliente.pessoa.EmailPessoa.length > 0
      ? venda.cliente.pessoa.EmailPessoa[0].email
      : 'N/A'

  const itens = venda.itensVenda.map((item) => ({
    descricao: item.produtoServico.nome,
    quantidade: item.quantidade,
    precoUnitario: item.produtoServico.preco,
    totalItem: (Number(item.produtoServico.preco) * Number(item.quantidade)),
  }))

  const total = itens.reduce(
    (acc, item) => acc + item.totalItem,
    0
  )

  return {
    codigoVenda: venda.codigo,
    cliente: {
      nome: venda.cliente.pessoa.nome,
      documento: venda.cliente.documento,
      email,
    },
    itens,
    total,
  }
}