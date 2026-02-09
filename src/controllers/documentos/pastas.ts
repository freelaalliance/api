import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'

const reqUserSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().uuid(),
})

export class PastasController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.criarPasta, {
      prefix: '/documentos/pastas',
    })
    fastifyInstance.register(this.listarPastasUsuario, {
      prefix: '/documentos/pastas',
    })
    fastifyInstance.register(this.listarPastasPorEmpresa, {
      prefix: '/documentos/pastas',
    })
    fastifyInstance.register(this.atualizarPasta, {
      prefix: '/documentos/pastas',
    })
    fastifyInstance.register(this.excluirPasta, {
      prefix: '/documentos/pastas',
    })
  }

  async criarPasta(app: FastifyInstance) {
    const schemaNovaPasta = z.object({
      nome: z.string({
        required_error: 'Nome da pasta é obrigatório',
      }).min(1, 'Nome da pasta não pode ser vazio'),
    })

    app.post('/', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = await reqUserSchema.parseAsync(req.user)

      if (!cliente) {
        return res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })
      }

      const { nome } = await schemaNovaPasta.parseAsync(req.body)

      try {
        const pasta = await prisma.pastaDocumento.create({
          data: {
            nome,
            empresaId: cliente,
          },
        })

        return res.status(201).send({
          status: true,
          msg: 'Pasta criada com sucesso!',
          data: {
            id: pasta.id,
            nome: pasta.nome,
            empresaId: pasta.empresaId,
          },
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao criar pasta!',
        })
      }
    })
  }

  async listarPastasUsuario(app: FastifyInstance) {
    app.get('/', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = await reqUserSchema.parseAsync(req.user)

      if (!cliente) {
        return res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })
      }

      try {
        const pastas = await prisma.pastaDocumento.findMany({
          where: {
            empresaId: cliente,
            excluido: false,
          },
          orderBy: {
            nome: 'asc',
          },
          select: {
            id: true,
            nome: true,
            empresaId: true,
            _count: {
              select: {
                documentos: {
                  where: {
                    excluido: false,
                  },
                },
              },
            },
          },
        })

        return res.status(200).send(pastas.map(pasta => ({
          id: pasta.id,
          nome: pasta.nome,
          empresaId: pasta.empresaId,
          quantidadeDocumentos: pasta._count.documentos,
        })))
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao listar pastas!',
        })
      }
    })
  }

  async listarPastasPorEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresa/:empresaId', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const pastas = await prisma.pastaDocumento.findMany({
          where: {
            empresaId,
            excluido: false,
          },
          orderBy: {
            nome: 'asc',
          },
          select: {
            id: true,
            nome: true,
            empresaId: true,
            _count: {
              select: {
                documentos: {
                  where: {
                    excluido: false,
                  },
                },
              },
            },
          },
        })

        return res.status(200).send(pastas.map(pasta => ({
          id: pasta.id,
          nome: pasta.nome,
          empresaId: pasta.empresaId,
          quantidadeDocumentos: pasta._count.documentos,
        })))
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao listar pastas!',
        })
      }
    })
  }

  async atualizarPasta(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    const schemaBody = z.object({
      nome: z.string({
        required_error: 'Nome da pasta é obrigatório',
      }).min(1, 'Nome da pasta não pode ser vazio'),
    })

    app.put('/:id', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = await reqUserSchema.parseAsync(req.user)

      if (!cliente) {
        return res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })
      }

      const { id } = await schemaParams.parseAsync(req.params)
      const { nome } = await schemaBody.parseAsync(req.body)

      try {
        const pasta = await prisma.pastaDocumento.findFirst({
          where: {
            id,
            empresaId: cliente,
            excluido: false,
          },
        })

        if (!pasta) {
          return res.status(404).send({
            status: false,
            msg: 'Pasta não encontrada',
          })
        }

        const pastaAtualizada = await prisma.pastaDocumento.update({
          where: { id },
          data: { nome },
        })

        return res.status(200).send({
          status: true,
          msg: 'Pasta atualizada com sucesso!',
          data: {
            id: pastaAtualizada.id,
            nome: pastaAtualizada.nome,
            empresaId: pastaAtualizada.empresaId,
          },
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao atualizar pasta!',
        })
      }
    })
  }

  async excluirPasta(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.delete('/:id', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = await reqUserSchema.parseAsync(req.user)

      if (!cliente) {
        return res.status(401).send({
          status: false,
          msg: 'Sessão encerrada!',
        })
      }

      const { id } = await schemaParams.parseAsync(req.params)

      try {
        const pasta = await prisma.pastaDocumento.findFirst({
          where: {
            id,
            empresaId: cliente,
            excluido: false,
          },
        })

        if (!pasta) {
          return res.status(404).send({
            status: false,
            msg: 'Pasta não encontrada',
          })
        }

        await prisma.pastaDocumento.update({
          where: { id },
          data: { excluido: true },
        })

        return res.status(200).send({
          status: true,
          msg: 'Pasta excluída com sucesso!',
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao excluir pasta!',
        })
      }
    })
  }
}
