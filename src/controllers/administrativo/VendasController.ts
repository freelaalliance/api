import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'

export class AdministradorVendasController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.estatisticasClientesTop, {
      prefix: '/api/admin/vendas',
    })

    fastifyInstance.register(this.estatisticasProdutoTop, {
      prefix: '/api/admin/vendas',
    })

    fastifyInstance.register(this.estatisticasTotaisClientes, {
      prefix: '/api/admin/vendas',
    })

    fastifyInstance.register(this.estatisticasTotaisProdutos, {
      prefix: '/api/admin/vendas',
    })
  }

  async estatisticasClientesTop(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/cliente-top', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const topCliente = await prisma.venda.groupBy({
        by: ['clientesId'],
        where: {
          empresasId: empresaId,
          cancelado: false,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _count: {
            cadastradoEm: 'desc',
          },
        },
        take: 1,
      })

      if (topCliente.length === 0) {
        return res.send({
          status: true,
          msg: 'Nenhuma venda encontrada',
          dados: null,
        })
      }

      const clienteDetalhes = await prisma.cliente.findUnique({
        where: { id: topCliente[0].clientesId },
        include: {
          pessoa: true,
        },
      })

      return res.send({
        status: true,
        msg: 'Cliente com mais vendas',
        dados: {
          totalVendas: topCliente[0]._count._all,
          cliente: clienteDetalhes?.pessoa.nome,
        },
      })
    })
  }

  async estatisticasProdutoTop(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/produto-top', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const topProduto = await prisma.itensVenda.groupBy({
        by: ['produtosServicosId'],
        where: {
          venda: {
            empresasId: empresaId,
            cancelado: false,
          },
        },
        _sum: {
          quantidade: true,
        },
        orderBy: {
          _sum: {
            quantidade: 'desc',
          },
        },
        take: 1,
      })

      if (topProduto.length === 0) {
        return res.send({
          status: true,
          msg: 'Nenhuma venda encontrada',
          dados: null,
        })
      }

      const produto = await prisma.produtoServico.findUnique({
        where: { id: topProduto[0].produtosServicosId },
      })

      return res.send({
        status: true,
        msg: 'Produto ou serviço mais vendido',
        dados: {
          totalVendido: topProduto[0]._sum.quantidade,
          nome: produto?.nome,
        },
      })
    })
  }

  async estatisticasTotaisClientes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/clientes/total', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const totalClientes = await prisma.cliente.count({ where: { empresaId, excluido: false } })
      return res.send({ status: true, dados: { totalClientes } })
    })
  }

  async estatisticasTotaisProdutos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/produtos/total', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const totalProdutos = await prisma.produtoServico.count({ where: { empresaId } })
      return res.send({ status: true, dados: { totalProdutos } })
    })
  }
}
