import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import {
  atualizarDescricaoItem,
  atualizarStatusItemAvaliacao,
  buscarItensAvaliacaoRecebimentoEmpresa,
  salvarNovoItemAvalicao,
} from '../../repositories/Compras/ItensAvaliacaoRecebimentoRepository'

export class AdministradorComprasController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.cadastrarNovoItemEmpresa, {
      prefix: 'admin/compras/recebimento/avaliacao',
    })

    fastify.register(this.itensAvaliacaoRecebimentoEmpresa, {
      prefix: 'admin/compras/recebimento/avaliacao',
    })

    fastify.register(this.atualizarItemAvaliacaoRecebimentoEmpresa, {
      prefix: 'admin/compras/recebimento/avaliacao',
    })

    fastify.register(this.atualizarStatusItemAvaliacaoRecebimentoEmpresa, {
      prefix: 'admin/compras/recebimento/avaliacao',
    })
  }

  async cadastrarNovoItemEmpresa(app: FastifyInstance) {
    const schemaItemAvaliacao = z.object({
      itens: z.array(
        z.object({
          descricao: z.string({
            message: 'Descrição do item é obrigatório',
          }),
        })
      ),
    })

    const schemaEmpresaParam = z.object({
      empresaId: z
        .string({
          required_error: 'Necessário informar a empresa',
        })
        .uuid({
          message: 'Id da empresa inválida',
        }),
    })

    app.post('/empresa/:empresaId', async (req, reply) => {
      const { empresaId } = await schemaEmpresaParam.parseAsync(req.params)
      const { itens } = await schemaItemAvaliacao.parseAsync(req.body)

      await salvarNovoItemAvalicao(itens, empresaId)

      return reply.status(201).send()
    })
  }

  async itensAvaliacaoRecebimentoEmpresa(app: FastifyInstance) {
    const schemaEmpresaParam = z.object({
      empresaId: z
        .string({
          required_error: 'Necessário informar a empresa',
        })
        .uuid({
          message: 'Id da empresa inválida',
        }),
    })

    app.get('/empresa/:empresaId', async (req, reply) => {
      const { empresaId } = await schemaEmpresaParam.parseAsync(req.params)

      const listaItensRecebimento =
        await buscarItensAvaliacaoRecebimentoEmpresa({
          empresaId,
        })

      return reply.status(200).send(listaItensRecebimento)
    })
  }

  async atualizarItemAvaliacaoRecebimentoEmpresa(app: FastifyInstance) {
    const schemaItemAvaliacao = z.object({
      descricao: z.string({
        message: 'Descrição do item é obrigatório',
      }),
    })

    const schemaEmpresaParam = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do item',
        })
        .uuid({
          message: 'Id do item avaliativo de recebimento inválida',
        }),
    })

    app.patch('/:id/descricao', async (req, reply) => {
      const { id } = await schemaEmpresaParam.parseAsync(req.params)
      const { descricao } = await schemaItemAvaliacao.parseAsync(req.body)

      await atualizarDescricaoItem({
        id,
        descricao,
      })

      return reply.status(200).send()
    })
  }

  async atualizarStatusItemAvaliacaoRecebimentoEmpresa(app: FastifyInstance) {
    const schemaItemAvaliacao = z.object({
      ativo: z.coerce.boolean({
        message: 'Status do item é obrigatório',
      }),
    })

    const schemaEmpresaParam = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do item',
        })
        .uuid({
          message: 'Id do item avaliativo de recebimento inválida',
        }),
    })

    app.patch('/:id/status', async (req, reply) => {
      const { id } = await schemaEmpresaParam.parseAsync(req.params)
      const { ativo } = await schemaItemAvaliacao.parseAsync(req.body)

      await atualizarStatusItemAvaliacao({
        id,
        ativo,
      })

      return reply.status(200).send()
    })
  }
}
