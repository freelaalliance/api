import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  listarRecebimentosFornecedorEmpresa,
  resumoRecebimentoPedidosEmpresa,
} from '../../repositories/Compras/RecebimentoRepository'

export class AdministradorRecebimentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.consultaDadosRecebimentos, {
      prefix: '/api/admin/recebimentos',
    })
  }

  async consultaDadosRecebimentos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    const schemaQuery = z.object({
      dataInicial: z.coerce.date().optional(),
      dataFinal: z.coerce.date().optional(),
    })

    app.get('/empresas/:empresaId', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const { dataInicial, dataFinal } = await schemaQuery.parseAsync(req.query)

      const recebimentos = await listarRecebimentosFornecedorEmpresa({
        empresaId,
        dataInicio: dataInicial,
        dataFim: dataFinal,
      })

      const estatisticasRecebimentos = await resumoRecebimentoPedidosEmpresa({
        empresaId,
        dataInicio: dataInicial,
        dataFim: dataFinal,
      })

      res.status(200).send({
        estatisticasRecebimentos,
        recebimentos,
      })
    })
  }
}
