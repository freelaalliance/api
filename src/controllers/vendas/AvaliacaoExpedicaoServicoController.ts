import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { atualizarItemAvaliacao, criarItemAvaliacao, listarItensPorEmpresa, removerItemAvaliacao } from './services/AvaliacaoExpedicaoService'

export async function itensAvaliacaoExpedicaoRoutes(app: FastifyInstance) {
  const bodySchema = z.object({
    itens: z.array(z.object({
      pergunta: z.string().min(1, 'Pergunta é obrigatória'),
    })),
  })

  const paramIdSchema = z.object({
    id: z.coerce.number(),
  })

  app.post('/itens-avaliacao/empresa/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const paramEmpresaSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = await paramEmpresaSchema.parseAsync(req.params)
    const { itens } = await bodySchema.parseAsync(req.body)

    const novo = await criarItemAvaliacao({
      itens,
      empresasId: id,
    })

    return res.status(201).send({
      status: true,
      msg: 'Item de avaliação criado com sucesso!',
      dados: novo,
    })
  })

  app.get('/itens-avaliacao/empresa/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const paramEmpresaSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = await paramEmpresaSchema.parseAsync(req.params)

    const lista = await listarItensPorEmpresa(id)

    return res.send({
      status: true,
      dados: lista.map((item) => ({
        id: item.id,
        pergunta: item.pergunta,
      })),
    })
  })

  app.put('/itens-avaliacao/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const bodySchemaAtualizacao = z.object({
      pergunta: z.string().min(1, 'Pergunta é obrigatória'),
    })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { pergunta } = await bodySchemaAtualizacao.parseAsync(req.body)

    const atualizado = await atualizarItemAvaliacao(id, pergunta)

    return res.send({
      status: true,
      msg: 'Item de avaliação atualizado com sucesso!',
      dados: atualizado,
    })
  })

  // Remover
  app.delete('/itens-avaliacao/:id/empresa/:empresaId', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const paramEmpresaSchema = z.object({
      empresaId: z.string().uuid(),
    })
    const { empresaId } = await paramEmpresaSchema.parseAsync(req.params)

    const { id } = await paramIdSchema.parseAsync(req.params)

    const removido = await removerItemAvaliacao(id, empresaId)

    return res.send({
      status: true,
      msg: 'Item de avaliação removido com sucesso!',
      dados: removido,
    })
  })

  app.get('/itens-avaliacao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user

    const lista = await listarItensPorEmpresa(cliente)

    return res.send({
      status: true,
      dados: lista,
    })
  })
}
