import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'

export async function telefoneRoutes(app: FastifyInstance) {
  app.delete('/telefone/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const schemaParams = z.object({ id: z.string().uuid() })
    const { id } = await schemaParams.parseAsync(req.params)

    try {
      const resultado = await prisma.telefonePessoa.delete({
        where: {
          id,
        },
      })

      return res.status(200).send({
        status: true,
        msg: 'Telefone removido com sucesso!',
        dados: resultado,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao remover telefone',
        error,
      })
    }
  })
}
