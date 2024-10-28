import { FastifyInstance } from 'fastify'

import { resumoPedidosEmpresa } from '../../repositories/Compras/CompraRepository'
import { buscaResumoFornecedorEmpresa } from '../../repositories/Compras/FornecedorRepository'

class RelatorioComprasController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.resumoEstatisticasFornecedor, {
      prefix: 'relatorio',
    })

    fastifyInstance.register(this.resumoEstatisticasComprasFornecedor, {
      prefix: 'relatorio',
    })
  }

  async resumoEstatisticasFornecedor(app: FastifyInstance) {
    app.get('/fornecedor/resumo', async (req, res) => {
      await req.jwtVerify()
      const { cliente } = req.user

      const estatisticas = await buscaResumoFornecedorEmpresa({
        empresaId: cliente,
      })

      res.status(200).send(estatisticas)
    })
  }

  async resumoEstatisticasComprasFornecedor(app: FastifyInstance) {
    app.get('/compras/resumo', async (req, res) => {
      await req.jwtVerify()
      const { cliente } = req.user

      const estatisticas = await resumoPedidosEmpresa({
        empresaId: cliente,
      })

      res.status(200).send(estatisticas)
    })
  }
}

export default RelatorioComprasController
