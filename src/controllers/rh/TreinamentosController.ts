import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  atualizarTreinamento,
  criarPlanoTreinamento,
  criarTreinamento,
  deletarPlanoTreinamento,
  deletarTreinamento,
  listarPlanosTreinamento,
  listarTreinamentos,
  listarTreinamentosCapacitacaoCargo,
  listarTreinamentosIntegracaoCargo,
} from './services/TreinamentosService'

const reqUserSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().uuid(),
})

export async function TreinamentosRoutes(app: FastifyInstance) {
  const bodySchema = z.object({
    nome: z.string().min(1, 'Título é obrigatório'),
    tipo: z.enum(['integracao', 'capacitacao']),
    planos: z.array(
      z.object({
        nome: z.string().min(1, 'Nome do plano é obrigatório'),
      })
    ),
  })

  const paramIdSchema = z.object({
    id: z.string().uuid(),
  })


  app.post('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { nome, tipo, planos } =
      await bodySchema.parseAsync(req.body)

    const { cliente } = await reqUserSchema.parseAsync(req.user)

    await criarTreinamento({
      nome,
      tipo,
      planos,
      empresa: cliente,
    })

    return res.status(201).send({
      status: true,
      msg: 'Treinamento criado com sucesso!',
    })
  })

  app.get('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const lista = await listarTreinamentos()

    return res.send({
      status: true,
      dados: lista.map(treinamento => ({
        id: treinamento.id,
        nome: treinamento.nome,
        tipo: treinamento.tipo,
        planos: treinamento.planos.map(plano => ({
          id: plano.id,
          nome: plano.nome,
        })),
      })),
    })
  })

  app.put('/:id', async (req, res) => {
    const bodySchema = z.object({
      nome: z.string().min(1, 'Título é obrigatório'),
      tipo: z.enum(['integracao', 'capacitacao']),
    })

    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { nome, tipo } =
      await bodySchema.parseAsync(req.body)

    await atualizarTreinamento(id, {
      nome,
      tipo
    })

    return res.send({
      status: true,
      msg: 'Treinamento atualizado com sucesso!',
    })
  })

  app.delete('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    await deletarTreinamento(id)

    return res.send({
      status: true,
      msg: 'Treinamento deletado com sucesso!',
    })
  })

  app.post('/:id/planos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const bodySchemaPlanos = z.object({
      nome: z.string().min(1, 'Nome do plano é obrigatório'),
    })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { nome } = await bodySchemaPlanos.parseAsync(req.body)

    await criarPlanoTreinamento(id, nome)

    return res.status(201).send({
      status: true,
      msg: 'Plano de treinamento adicionado com sucesso!',
    })
  })

  app.delete('/planos/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const paramIdPlanoSchema = z.object({
      id: z.coerce.number(),
    })

    const { id } = await paramIdPlanoSchema.parseAsync(req.params)

    await deletarPlanoTreinamento(id)

    return res.send({
      status: true,
      msg: 'Plano de treinamento deletado com sucesso!',
    })
  })

  app.get('/:id/planos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const planos = await listarPlanosTreinamento(id)

    return res.send({
      status: true,
      dados: planos.map(plano => ({
        id: plano.id,
        nome: plano.nome,
      })),
    })
  })

  // Rota para listar treinamentos de integração por cargo
  app.get('/integracao/cargo/:cargoId', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const paramCargoSchema = z.object({
      cargoId: z.string().uuid(),
    })

    const { cargoId } = await paramCargoSchema.parseAsync(req.params)
    const { cliente } = await reqUserSchema.parseAsync(req.user)

    const treinamentos = await listarTreinamentosIntegracaoCargo(cargoId, cliente)

    return res.send({
      status: true,
      dados: treinamentos.map(item => ({
        id: item.treinamento.id,
        nome: item.treinamento.nome,
        tipo: item.treinamento.tipo,
      })),
    })
  })

  // Rota para listar treinamentos de capacitação
  app.get('/capacitacao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = await reqUserSchema.parseAsync(req.user)

    const treinamentos = await listarTreinamentosCapacitacaoCargo(cliente)

    return res.send({
      status: true,
      dados: treinamentos.map(treinamento => ({
        id: treinamento.id,
        nome: treinamento.nome,
        tipo: treinamento.tipo,
      })),
    })
  })
}
