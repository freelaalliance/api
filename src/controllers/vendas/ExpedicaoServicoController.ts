import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { buscarVendasNaoExpedidas, criarExpedicaoVenda, listarExpedicoesPorEmpresa, obterMediaAvaliacaoExpedicoes, obterResumoExpedicoes } from './services/ExpedicaoVendaService'

export async function expedicaoRoutes(app: FastifyInstance) {
  const bodySchema = z.object({
    recebidoEm: z.coerce.date(),
    vendasId: z.string().uuid(),
  })

  app.post('/expedicao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id: usuarioId } = req.user
    
    const { recebidoEm, vendasId } = await bodySchema.parseAsync(req.body)

    const nova = await criarExpedicaoVenda({ recebidoEm, vendasId, usuarioId })

    return res.status(201).send({
      status: true,
      msg: 'Expedição criada com sucesso!',
      dados: nova,
    })
  })

  app.get('/expedicao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente } = req.user

    const lista = await listarExpedicoesPorEmpresa(cliente)

    return res.send({
      status: true,
      dados: lista,
    })
  })

  app.get('/expedicao/pendentes', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user

    const pendentes = await buscarVendasNaoExpedidas(empresaId)

    return res.send({
      status: true,
      dados: pendentes,
    })
  })

  app.get('/expedicao/resumo', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user

    const resumo = await obterResumoExpedicoes(empresaId)

    return res.send({
      status: true,
      dados: resumo,
    })
  })

  app.get('/expedicao/media-avaliacao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user

    const media = await obterMediaAvaliacaoExpedicoes(empresaId)

    return res.send({
      status: true,
      dados: {
        media,
      },
    })
  })
}
