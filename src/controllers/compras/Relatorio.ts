import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  listarPedidosEmpresa,
  resumoPedidosEmpresa,
} from '../../repositories/Compras/CompraRepository'
import { buscaResumoFornecedorEmpresa } from '../../repositories/Compras/FornecedorRepository'
import {
  listarRecebimentosFornecedorEmpresa,
  resumoRecebimentoPedidosEmpresa,
} from '../../repositories/Compras/RecebimentoRepository'

class RelatorioComprasController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.resumoEstatisticasFornecedor, {
      prefix: 'relatorio',
    })

    fastifyInstance.register(this.resumoEstatisticasComprasFornecedor, {
      prefix: 'relatorio',
    })

    fastifyInstance.register(this.consultaDadosRecebimentos, {
      prefix: 'relatorio',
    })

    fastifyInstance.register(this.consultaPedidosEmpresa, {
      prefix: 'relatorio',
    })
  }

  async resumoEstatisticasFornecedor(app: FastifyInstance) {
    app.get('/fornecedor/resumo', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const estatisticas = await buscaResumoFornecedorEmpresa({
        empresaId: cliente,
      })

      res.status(200).send(estatisticas)
    })
  }

  async resumoEstatisticasComprasFornecedor(app: FastifyInstance) {
    app.get('/compras/resumo', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const estatisticas = await resumoPedidosEmpresa({
        empresaId: cliente,
      })

      res.status(200).send(estatisticas)
    })
  }

  async consultaDadosRecebimentos(app: FastifyInstance) {
    const schemaQuery = z.object({
      dataInicial: z.coerce.date().optional(),
      dataFinal: z.coerce.date().optional(),
    })

    app.get('/recebimentos', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { dataInicial, dataFinal } = await schemaQuery.parseAsync(req.query)

      const recebimentos = await listarRecebimentosFornecedorEmpresa({
        empresaId: cliente,
        dataInicio: dataInicial,
        dataFim: dataFinal,
      })

      const estatisticasRecebimentos = await resumoRecebimentoPedidosEmpresa({
        empresaId: cliente,
        dataInicio: dataInicial,
        dataFim: dataFinal,
      })

      res.status(200).send({
        estatisticasRecebimentos,
        recebimentos,
      })
    })
  }

  async consultaPedidosEmpresa(app: FastifyInstance) {
    const schemaQuery = z.object({
      dataInicial: z.coerce.date().optional(),
      dataFinal: z.coerce.date().optional(),
    })

    app.get('/compras', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { dataInicial, dataFinal } = await schemaQuery.parseAsync(req.query)

      const pedidos = await listarPedidosEmpresa({
        empresaId: cliente,
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

export default RelatorioComprasController
