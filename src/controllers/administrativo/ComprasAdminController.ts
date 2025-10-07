import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  listarPedidosEmpresa,
  resumoPedidosEmpresa,
} from '../../repositories/Compras/CompraRepository'
import { buscaResumoFornecedorEmpresa } from '../../repositories/Compras/FornecedorRepository'

export class AdministradorComprasAdminController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.resumoEstatisticasFornecedor, {
      prefix: '/api/admin/compras',
    })

    fastifyInstance.register(this.resumoEstatisticasComprasFornecedor, {
      prefix: '/api/admin/compras',
    })

    fastifyInstance.register(this.consultaPedidosEmpresa, {
      prefix: '/api/admin/compras',
    })
  }

  async resumoEstatisticasFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/fornecedor/resumo', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const estatisticas = await buscaResumoFornecedorEmpresa({
        empresaId,
      })

      res.status(200).send(estatisticas)
    })
  }

  async resumoEstatisticasComprasFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/resumo', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const estatisticas = await resumoPedidosEmpresa({
        empresaId,
      })

      res.status(200).send(estatisticas)
    })
  }

  async consultaPedidosEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    const schemaQuery = z.object({
      dataInicial: z.coerce.date().optional(),
      dataFinal: z.coerce.date().optional(),
    })

    app.get('/empresas/:empresaId/pedidos', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const { dataInicial, dataFinal } = await schemaQuery.parseAsync(req.query)

      const pedidos = await listarPedidosEmpresa({
        empresaId,
        dataInicio: dataInicial,
        dataFim: dataFinal,
      })

      res.status(200).send(
        pedidos.map(pedido => {
          return {
            id: pedido.id,
            numPedido: String(pedido.numPedido),
            codigo: pedido.codigo,
            permiteEntregaParcial: pedido.permiteEntregaParcial,
            prazoEntrega: pedido.prazoEntrega,
            condicoesEntrega: pedido.condicoesEntrega,
            recebido: pedido.recebido,
            cancelado: pedido.cancelado,
            cadastro: {
              usuario: pedido.usuario.pessoa.nome,
              dataCadastro: pedido.cadastradoEm,
            },
            fornecedor: {
              id: pedido.fornecedor.id,
              nome: pedido.fornecedor.pessoa.nome,
              documento: pedido.fornecedor.documento,
            },
          }
        })
      )
    })
  }
}
