import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  calcularPeriodoPorTipo,
  getAnalyticsColaboradores,
  getAnalyticsColaboradoresPorCargo,
  getAnalyticsRotatividade,
  getAnalyticsTreinamentos,
  listarColaboradoresAtivos,
  listarColaboradoresDemitidos,
  listarColaboradoresEmTreinamento
} from '../rh/services/AnalyticsRhService'

export class AdministradorRhController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.analyticsColaboradores, {
      prefix: '/api/admin/rh',
    })

    fastifyInstance.register(this.analyticsRotatividade, {
      prefix: '/api/admin/rh',
    })

    fastifyInstance.register(this.analyticsTreinamentos, {
      prefix: '/api/admin/rh',
    })

    fastifyInstance.register(this.analyticsColaboradoresPorCargo, {
      prefix: '/api/admin/rh',
    })

    fastifyInstance.register(this.listarColaboradoresAtivos, {
      prefix: '/api/admin/rh',
    })

    fastifyInstance.register(this.listarColaboradoresDemitidos, {
      prefix: '/api/admin/rh',
    })

    fastifyInstance.register(this.listarColaboradoresEmTreinamento, {
      prefix: '/api/admin/rh',
    })
  }

  async analyticsColaboradores(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/analytics/colaboradores', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const analytics = await getAnalyticsColaboradores(empresaId)

        return res.send({
          status: true,
          dados: analytics
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }

  async analyticsRotatividade(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    const periodoQuerySchema = z.object({
      periodo: z.enum(['mes', 'trimestre', 'semestre', 'anual']).optional().default('mes')
    })

    app.get('/empresas/:empresaId/analytics/rotatividade', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const { periodo } = await periodoQuerySchema.parseAsync(req.query)

      try {
        const periodoCalculado = calcularPeriodoPorTipo(periodo)
        const analytics = await getAnalyticsRotatividade(empresaId, periodoCalculado)

        return res.send({
          status: true,
          dados: {
            ...analytics,
            periodo: periodo,
            dataInicio: periodoCalculado.inicio,
            dataFim: periodoCalculado.fim
          }
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }

  async analyticsTreinamentos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/analytics/treinamentos', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const analytics = await getAnalyticsTreinamentos(empresaId)

        return res.send({
          status: true,
          dados: analytics
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }

  async analyticsColaboradoresPorCargo(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/analytics/colaboradores-por-cargo', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const analytics = await getAnalyticsColaboradoresPorCargo(empresaId)

        return res.send({
          status: true,
          dados: analytics
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }

  async listarColaboradoresAtivos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/colaboradores/ativos', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const colaboradores = await listarColaboradoresAtivos(empresaId)

        return res.send({
          status: true,
          dados: colaboradores.map(contratacao => ({
            id: contratacao.id,
            admitidoEm: contratacao.admitidoEm,
            demitidoEm: contratacao.demitidoEm,
            colaborador: {
              id: contratacao.colaborador.id,
              documento: contratacao.colaborador.documento,
              nome: contratacao.colaborador.pessoa.nome,
              email: contratacao.colaborador.pessoa.EmailPessoa?.[0]?.email || null,
              telefone: contratacao.colaborador.pessoa.TelefonePessoa?.[0]?.numero || null
            },
            cargo: {
              nome: contratacao.cargo.nome
            }
          }))
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }

  async listarColaboradoresDemitidos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/colaboradores/demitidos', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const colaboradores = await listarColaboradoresDemitidos(empresaId)

        return res.send({
          status: true,
          dados: colaboradores.map(contratacao => ({
            id: contratacao.id,
            admitidoEm: contratacao.admitidoEm,
            demitidoEm: contratacao.demitidoEm,
            colaborador: {
              id: contratacao.colaborador.id,
              documento: contratacao.colaborador.documento,
              nome: contratacao.colaborador.pessoa.nome,
              email: contratacao.colaborador.pessoa.EmailPessoa?.[0]?.email || null,
              telefone: contratacao.colaborador.pessoa.TelefonePessoa?.[0]?.numero || null
            },
            cargo: {
              nome: contratacao.cargo.nome
            }
          }))
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }

  async listarColaboradoresEmTreinamento(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/colaboradores/em-treinamento', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const colaboradores = await listarColaboradoresEmTreinamento(empresaId)

        return res.send({
          status: true,
          dados: colaboradores.map(treinamento => ({
            id: treinamento.id,
            iniciadoEm: treinamento.iniciadoEm,
            colaborador: {
              nome: treinamento.contratacaoColaborador.colaborador.pessoa.nome,
              documento: treinamento.contratacaoColaborador.colaborador.documento
            },
            cargo: {
              nome: treinamento.contratacaoColaborador.cargo.nome
            },
            treinamento: {
              id: treinamento.treinamento.id,
              nome: treinamento.treinamento.nome,
              tipo: treinamento.treinamento.tipo
            }
          }))
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return res.status(500).send({
          status: false,
          msg: errorMessage
        })
      }
    })
  }
}
