import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { listarExpedicoesPorEmpresa, obterMediaAvaliacaoExpedicoes, obterResumoExpedicoes } from '../vendas/services/ExpedicaoVendaService'

export class AdministradorExpedicaoController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.listarExpedicoes, {
      prefix: '/api/admin/expedicao',
    })

    fastifyInstance.register(this.resumoExpedicoes, {
      prefix: '/api/admin/expedicao',
    })

    fastifyInstance.register(this.mediaAvaliacaoExpedicoes, {
      prefix: '/api/admin/expedicao',
    })
  }

  async listarExpedicoes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const lista = await listarExpedicoesPorEmpresa(empresaId)

      return res.send({
        status: true,
        dados: lista.map((expedicao) => ({
          id: expedicao.id,
          expedidoEm: expedicao.recebidoEm,
          venda: {
            id: expedicao.venda.id,
            numeroVenda: expedicao.venda.numPedido,
            cliente: {
              nome: expedicao.venda.cliente.pessoa.nome,
            },
          },
          usuario: expedicao.usuario.pessoa.nome,
          avaliacaoExpedicao: expedicao.avaliacaoExpedicao,
        })),
      })
    })
  }

  async resumoExpedicoes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/resumo', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const resumo = await obterResumoExpedicoes(empresaId)

      return res.send({
        status: true,
        dados: resumo,
      })
    })
  }

  async mediaAvaliacaoExpedicoes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/media-avaliacao', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const media = await obterMediaAvaliacaoExpedicoes(empresaId)

      return res.send({
        status: true,
        dados: {
          media,
        },
      })
    })
  }
}
