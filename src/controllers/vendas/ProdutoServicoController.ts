import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const prisma = new PrismaClient()

export async function produtoServicoRoutes(app: FastifyInstance) {
  // Criar
  app.post('/produtos-servicos', async (req, res) => {
    const schemaBody = z.object({
      nome: z.string({ required_error: 'Nome é obrigatório' }),
      descricao: z.string().default(''),
      tipo: z.enum(['PRODUTO', 'SERVICO']).default('PRODUTO'),
      preco: z.coerce.number().positive({ message: 'Preço deve ser positivo' })
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const body = await schemaBody.parseAsync(req.body)

      const produto = await prisma.produtoServico.create({
        data: {
          ...body,
          empresaId: cliente
        },
      })

      return res.status(201).send({
        status: true,
        msg: 'Produto/Serviço criado com sucesso!',
        dados: produto,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao criar produto/serviço',
        dados: null,
        error,
      })
    }
  })

  // Listar todos
  app.get('/produtos-servicos', async (req, res) => {
    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const produtos = await prisma.produtoServico.findMany({
        where: {
          empresaId: cliente,
          ativo: true,
        }
      })

      return res.send({
        status: true,
        msg: 'Produtos/Serviços encontrados',
        dados: produtos,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao listar produtos/serviços',
        dados: null,
        error,
      })
    }
  })

  // Buscar por ID
  app.get('/produtos-servicos/:id', async (req, res) => {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParam.parseAsync(req.params)

      const produto = await prisma.produtoServico.findUnique({
        where: { id, empresaId: cliente },
        include: { empresa: true },
      })

      if (!produto) {
        return res.status(404).send({
          status: false,
          msg: 'Produto/Serviço não encontrado',
          dados: null,
        })
      }

      return res.send({
        status: true,
        msg: 'Produto/Serviço encontrado',
        dados: produto,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao buscar produto/serviço',
        dados: null,
        error,
      })
    }
  })

  // Atualizar
  app.put('/produtos-servicos/:id', async (req, res) => {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    const schemaBody = z.object({
      nome: z.string().optional(),
      descricao: z.string().optional(),
      tipo: z.enum(['PRODUTO', 'SERVICO']).optional(),
      preco: z.coerce.number().positive().optional()
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParam.parseAsync(req.params)
      const body = await schemaBody.parseAsync(req.body)

      const produto = await prisma.produtoServico.update({
        where: { id, empresaId: cliente },
        data: body,
      })

      return res.send({
        status: true,
        msg: 'Produto/Serviço atualizado com sucesso',
        dados: produto,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao atualizar produto/serviço',
        dados: null,
        error,
      })
    }
  })

  // Deletar
  app.delete('/produtos-servicos/:id', async (req, res) => {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParam.parseAsync(req.params)

      await prisma.produtoServico.update({
        where: { id, empresaId: cliente },
        data: { ativo: false }, 
      })

      return res.send({
        status: true,
        msg: 'Produto/Serviço deletado com sucesso',
        dados: null,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao deletar produto/serviço',
        dados: null,
        error,
      })
    }
  })
}
