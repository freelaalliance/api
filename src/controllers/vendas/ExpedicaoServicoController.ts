import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'
import { buscarVendasNaoExpedidas, listarExpedicoesPorEmpresa, obterMediaAvaliacaoExpedicoes, obterResumoExpedicoes } from './services/ExpedicaoVendaService'

export async function expedicaoRoutes(app: FastifyInstance) {
  const bodySchema = z.object({
    recebidoEm: z.coerce.date(),
    vendasId: z.string().uuid(),
    itensAvaliacao: z.array(z.object({
      itensAvaliacaoExpedicaoId: z.coerce.number(),
      nota: z.coerce.number().min(0, {
        message: "Nota mínima precisa ser zero"
      })
    }))
  })

  app.post('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id: usuarioId, cliente } = req.user

    if(!cliente){
      res.status(401).send({
        status: false,
        msg: 'Usuário não autenticado!'
      })

      return
    }
    
    const { recebidoEm, vendasId, itensAvaliacao } = await bodySchema.parseAsync(req.body)

    const buscaVenda = await prisma.venda.findUnique({
      where: {
        id: vendasId,
        empresasId: cliente
      }
    })

    if(!buscaVenda) {
      res.status(404).send({
        status: false,
        msg: 'Venda não encontrada!'
      })

      return
    }

    const somaTotalAvaliacao = itensAvaliacao.reduce((total, itemAvaliacao) => {return total + Number(itemAvaliacao.nota)}, 0)

    const nova = await prisma.expedicaoVenda.create({
      data: {
        recebidoEm,
        vendasId,
        usuariosId: usuarioId,
        avaliacaoExpedicao: Number(somaTotalAvaliacao / itensAvaliacao.length),
        avaliacoes: {
          createMany: {
            data: itensAvaliacao
          }
        },
      }
    })

    await prisma.venda.update({
      where: {
        id: vendasId,
      },
      data: {
        expedido: true,
      },
    })

    return res.status(201).send({
      status: true,
      msg: 'Expedição criada com sucesso!',
      dados: nova,
    })
  })

  app.get('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente } = req.user

    const lista = await listarExpedicoesPorEmpresa(cliente)

    return res.send({
      status: true,
      dados: lista.map((expedicao) => ({
        id: expedicao.id,
        expedidoEm: expedicao.recebidoEm,
        venda: {
          id: expedicao.venda.id,
          numeroVenda: expedicao.venda.numPedido,
          cliente: {
            nome: expedicao.venda.cliente.pessoa.nome,
          },
        },
        usuario: expedicao.usuario.pessoa.nome,
        avaliacaoExpedicao: expedicao.avaliacaoExpedicao,
      })),
    })
  })

  app.get('/resumo', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user

    const resumo = await obterResumoExpedicoes(empresaId)

    return res.send({
      status: true,
      dados: resumo,
    })
  })

  app.get('/media-avaliacao', async (req, res) => {
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
