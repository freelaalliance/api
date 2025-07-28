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
} from './services/AnalyticsRhService'

export async function AnalyticsRhRoutes(app: FastifyInstance) {
  const periodoQuerySchema = z.object({
    periodo: z.enum(['mes', 'trimestre', 'semestre', 'anual']).optional().default('mes')
  })

  // Analytics de colaboradores (ativos, inativos, contratações)
  app.get('/analytics/colaboradores', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }

    try {
      const analytics = await getAnalyticsColaboradores(cliente)

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

  // Analytics de rotatividade
  app.get('/analytics/rotatividade', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }
    const { periodo } = await periodoQuerySchema.parseAsync(req.query)

    try {
      const periodoCalculado = calcularPeriodoPorTipo(periodo)
      const analytics = await getAnalyticsRotatividade(cliente, periodoCalculado)

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

  // Analytics de treinamentos
  app.get('/analytics/treinamentos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }

    try {
      const analytics = await getAnalyticsTreinamentos(cliente)

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

  // Analytics de colaboradores por cargo
  app.get('/analytics/colaboradores-por-cargo', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }

    try {
      const analytics = await getAnalyticsColaboradoresPorCargo(cliente)

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

  // Listar colaboradores ativos
  app.get('/colaboradores/ativos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }

    try {
      const colaboradores = await listarColaboradoresAtivos(cliente)

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

  // Listar colaboradores demitidos
  app.get('/colaboradores/demitidos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }

    try {
      const colaboradores = await listarColaboradoresDemitidos(cliente)

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

  // Listar colaboradores em treinamento
  app.get('/colaboradores/em-treinamento', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user as { cliente: string }

    try {
      const colaboradores = await listarColaboradoresEmTreinamento(cliente)

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
