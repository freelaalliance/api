import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { RespostaRequisicaoInterface } from '../../interfaces/ResponseInterface'
import { atualizarConfiguracao, buscarConfiguracaoPorChave, buscarConfiguracoesPorEmpresa, criarConfiguracao } from '../../repositories/ConfiguracaoEmpresaRepository'

export class ConfiguracaoEmpresaController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.criarConfiguracaoEmpresa, {
      prefix: '/api/admin/configuracao',
    })

    fastify.register(this.buscarConfiguracoesPorEmpresa, {
      prefix: '/api/admin/configuracao',
    })

    fastify.register(this.buscarConfiguracaoPorChave, {
      prefix: '/api/admin/configuracao',
    })

    fastify.register(this.atualizarConfiguracaoEmpresa, {
      prefix: '/api/admin/configuracao',
    })
  }

  async criarConfiguracaoEmpresa(app: FastifyInstance) {
    const schemaConfiguracao = z.object({
      chave: z.string({
        required_error: 'Chave da configuração é obrigatória',
      }).max(100, {
        message: 'Chave deve ter no máximo 100 caracteres',
      }),
      valor: z.string({
        required_error: 'Valor da configuração é obrigatório',
      }),
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.post('/', async (req, reply) => {
      try {
        const { chave, valor, empresaId } = await schemaConfiguracao.parseAsync(req.body)

        const resultado: RespostaRequisicaoInterface = await criarConfiguracao({
          chave,
          valor,
          empresaId,
        })

        return reply.status(resultado.status ? 201 : 400).send(resultado)
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao criar configuração',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    })
  }

  async buscarConfiguracoesPorEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.get('/empresa/:empresaId', async (req, reply) => {
      try {
        const { empresaId } = await schemaParams.parseAsync(req.params)

        const configuracoes = await buscarConfiguracoesPorEmpresa(empresaId)

        return reply.status(200).send(configuracoes)
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao buscar configurações',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    })
  }

  async buscarConfiguracaoPorChave(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
      chave: z.string({
        required_error: 'Chave da configuração é obrigatória',
      }),
    })

    app.get('/empresa/:empresaId/chave/:chave', async (req, reply) => {
      try {
        const { empresaId, chave } = await schemaParams.parseAsync(req.params)

        const configuracao = await buscarConfiguracaoPorChave(empresaId, chave)

        if (!configuracao) {
          return reply.status(404).send({
            status: false,
            msg: 'Configuração não encontrada',
          })
        }

        return reply.status(200).send(configuracao)
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao buscar configuração',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    })
  }

  async atualizarConfiguracaoEmpresa(app: FastifyInstance) {
    const schemaConfiguracao = z.object({
      valor: z.string({
        required_error: 'Valor da configuração é obrigatório',
      }),
    })

    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'ID da configuração é obrigatório',
        })
        .uuid({
          message: 'ID da configuração inválido',
        }),
    })

    app.put('/:id', async (req, reply) => {
      try {
        const { id } = await schemaParams.parseAsync(req.params)
        const { valor } = await schemaConfiguracao.parseAsync(req.body)

        const resultado: RespostaRequisicaoInterface = await atualizarConfiguracao(id, valor)

        return reply.status(resultado.status ? 200 : 400).send(resultado)
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao atualizar configuração',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    })
  }
}
