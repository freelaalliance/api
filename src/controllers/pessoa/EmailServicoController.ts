import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'

export async function emailRoutes(app: FastifyInstance) {
  app.delete('/email/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const schemaParams = z.object({ id: z.string().uuid() })
    const { id } = await schemaParams.parseAsync(req.params)

    try {
      const resultado = await prisma.emailPessoa.delete({
        where: {
          id,
        },
      })

      return res.status(200).send({
        status: true,
        msg: 'Email removido com sucesso!',
        dados: resultado,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao remover email',
        error,
      })
    }
  })

  app.post(`/:id/email`, async (req, res) => {
    const schemaBody = z.object({
      email: z.string().email(),
    })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user

    const { email } = await schemaBody.parseAsync(req.body)
    const { id: pessoaId } = await schemaParams.parseAsync(req.params)

    try {
      if (!cliente) {
        return res.status(401).send({
          status: false,
          msg: 'Usuario não autenticado',
        })
      }
      
      await prisma.emailPessoa.create({
        data: {
          email,
          pessoaId
        }
      })

      res.status(201).send({
        status: true,
        msg: 'Email adicionado com sucesso!'
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao adicionar o email',
        error,
      })
    }
  })
}
