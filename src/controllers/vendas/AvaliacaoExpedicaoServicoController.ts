import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { atualizarItemAvaliacao, criarItemAvaliacao, listarItensPorEmpresa, removerItemAvaliacao } from './services/AvaliacaoExpedicaoService'

const reqUserSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().uuid(),
})

export async function itensAvaliacaoExpedicaoRoutes(app: FastifyInstance) {
  app.get('/itens-avaliacao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = await reqUserSchema.parseAsync(req.user)

    const lista = await listarItensPorEmpresa(cliente)

    return res.send({
      status: true,
      dados: lista,
    })
  })
}
