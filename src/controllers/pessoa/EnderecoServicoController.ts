
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'

export async function enderecoRoutes(app: FastifyInstance) {
  const schemaBody = z.object({
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string(),
    cep: z.string(),
    complemento: z.string().optional().nullable(),
  })

  const schemaParams = z.object({
    id: z.string().uuid(),
  })

  app.put('endereco/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await schemaParams.parseAsync(req.params)
    const dados = await schemaBody.parseAsync(req.body)

    try {
      const resultado = await prisma.endereco.update({
        where: {
          id,
        },
        data: dados
      })

      return res.status(200).send({
        status: true,
        msg: 'Endereço modificado com sucesso!',
        dados: resultado,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao modificar endereço',
        error,
      })
    }
  })
}
