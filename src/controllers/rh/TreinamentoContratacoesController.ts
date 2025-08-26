import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  atualizarTreinamentoRealizado,
  buscarTreinamentoRealizadoPorId,
  cancelarTreinamento,
  finalizarTreinamento,
  iniciarTreinamento,
  iniciarTreinamentosObrigatoriosCargo,
  listarTreinamentosColaborador,
  listarTreinamentosEmpresa,
  listarTreinamentosFinalizados,
  listarTreinamentosNaoRealizados,
  listarTreinamentosPendentes
} from './services/TreinamentosColaborador'

export async function TreinamentosColaboradorRoutes(app: FastifyInstance) {
  const iniciarTreinamentoSchema = z.object({
    iniciadoEm: z.string().transform((str) => new Date(str)),
    treinamentosId: z.string().uuid('ID do treinamento deve ser um UUID válido'),
    contratacaoColaboradorId: z.string().uuid('ID da contratação deve ser um UUID válido')
  })

  const finalizarTreinamentoSchema = z.object({
    finalizadoEm: z.string().transform((str) => new Date(str)),
    certificado: z.string().optional(),
    iniciadoEmConfirmado: z.string().transform((str) => new Date(str)),
  })

  const atualizarTreinamentoSchema = z.object({
    iniciadoEm: z.string().transform((str) => new Date(str)).optional(),
    finalizadoEm: z.string().transform((str) => new Date(str)).optional(),
    certificado: z.string().optional()
  })

  const paramIdSchema = z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  })

  const querySchema = z.object({
    status: z.enum(['pendentes', 'finalizados', 'todos']).optional().default('todos')
  })

  // Iniciar treinamento
  app.post('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const dados = await iniciarTreinamentoSchema.parseAsync(req.body)

    try {
      const treinamento = await iniciarTreinamento(dados)

      return res.status(201).send({
        status: true,
        msg: 'Treinamento iniciado com sucesso!',
        dados: {
          id: treinamento.id,
          iniciadoEm: treinamento.iniciadoEm,
          treinamento: {
            id: treinamento.treinamento.id,
            nome: treinamento.treinamento.nome,
            tipo: treinamento.treinamento.tipo
          },
          colaborador: treinamento.contratacaoColaborador.colaborador.pessoa.nome,
          cargo: treinamento.contratacaoColaborador.cargo.nome
        }
      })
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: error.message
      })
    }
  })

  // Listar treinamentos da empresa com filtros
  app.get('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { status } = await querySchema.parseAsync(req.query)
    const { cliente } = req.user

    let treinamentos

    switch (status) {
      case 'pendentes':
        treinamentos = await listarTreinamentosPendentes(cliente)
        break
      case 'finalizados':
        treinamentos = await listarTreinamentosFinalizados(cliente)
        break
      default:
        treinamentos = await listarTreinamentosEmpresa(cliente)
    }

    return res.send({
      status: true,
      dados: treinamentos.map(tr => ({
        id: tr.id,
        iniciadoEm: tr.iniciadoEm,
        finalizadoEm: tr.finalizadoEm,
        certificado: tr.certificado,
        treinamento: {
          id: tr.treinamento.id,
          nome: tr.treinamento.nome,
          tipo: tr.treinamento.tipo
        },
        colaborador: tr.contratacaoColaborador.colaborador.pessoa.nome,
        cargo: tr.contratacaoColaborador.cargo.nome
      }))
    })
  })

  // Buscar treinamento realizado por ID
  app.get('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const treinamento = await buscarTreinamentoRealizadoPorId(id)

    if (!treinamento) {
      return res.status(404).send({
        status: false,
        msg: 'Treinamento não encontrado'
      })
    }

    return res.send({
      status: true,
      dados: {
        id: treinamento.id,
        iniciadoEm: treinamento.iniciadoEm,
        finalizadoEm: treinamento.finalizadoEm,
        certificado: treinamento.certificado,
        treinamento: {
          id: treinamento.treinamento.id,
          nome: treinamento.treinamento.nome,
          tipo: treinamento.treinamento.tipo
        },
        contratacao: {
          id: treinamento.contratacaoColaborador.id,
          admitidoEm: treinamento.contratacaoColaborador.admitidoEm,
          colaborador: {
            documento: treinamento.contratacaoColaborador.colaborador.documento,
            nome: treinamento.contratacaoColaborador.colaborador.pessoa.nome
          },
          cargo: treinamento.contratacaoColaborador.cargo.nome,
          empresa: treinamento.contratacaoColaborador.empresa.pessoa.nome
        }
      }
    })
  })

  // Atualizar treinamento realizado
  app.put('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const dados = await atualizarTreinamentoSchema.parseAsync(req.body)

    const treinamento = await atualizarTreinamentoRealizado(id, dados)

    return res.send({
      status: true,
      msg: 'Treinamento atualizado com sucesso!',
      dados: {
        id: treinamento.id,
        iniciadoEm: treinamento.iniciadoEm,
        finalizadoEm: treinamento.finalizadoEm,
        certificado: treinamento.certificado,
        treinamento: {
          nome: treinamento.treinamento.nome,
          tipo: treinamento.treinamento.tipo
        },
        colaborador: treinamento.contratacaoColaborador.colaborador.pessoa.nome
      }
    })
  })

  // Finalizar treinamento
  app.post('/:id/finalizar', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const dados = await finalizarTreinamentoSchema.parseAsync(req.body)

    try {
      // Passa o novo campo para o serviço
      const treinamento = await finalizarTreinamento(id, {
        ...dados,
        iniciadoEmConfirmado: dados.iniciadoEmConfirmado
      })

      return res.send({
        status: true,
        msg: 'Treinamento finalizado com sucesso!',
        dados: {
          id: treinamento.id,
          finalizadoEm: treinamento.finalizadoEm,
          certificado: treinamento.certificado,
          iniciadoEmConfirmado: treinamento.iniciadoEmConfirmado,
          treinamento: treinamento.treinamento.nome,
          colaborador: treinamento.contratacaoColaborador.colaborador.pessoa.nome
        }
      })
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: error.message
      })
    }
  })

  // Cancelar treinamento
  app.delete('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    await cancelarTreinamento(id)

    return res.send({
      status: true,
      msg: 'Treinamento cancelado com sucesso!'
    })
  })

  // Listar treinamentos de um colaborador específico
  app.get('/colaborador/:contratacaoId', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const contratacaoIdSchema = z.object({
      contratacaoId: z.string().uuid('ID da contratação deve ser um UUID válido')
    })

    const { contratacaoId } = await contratacaoIdSchema.parseAsync(req.params)

    const treinamentos = await listarTreinamentosColaborador(contratacaoId)

    return res.send({
      status: true,
      dados: treinamentos.map(tr => ({
        id: tr.id,
        iniciadoEm: tr.iniciadoEm,
        finalizadoEm: tr.finalizadoEm,
        certificado: tr.certificado,
        treinamento: {
          id: tr.treinamento.id,
          nome: tr.treinamento.nome,
          tipo: tr.treinamento.tipo
        }
      }))
    })
  })

  app.post('/colaborador/:contratacaoId/iniciar-obrigatorios', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const contratacaoIdSchema = z.object({
      contratacaoId: z.string().uuid('ID da contratação deve ser um UUID válido')
    })

    const { contratacaoId } = await contratacaoIdSchema.parseAsync(req.params)

    try {
      const resultado = await iniciarTreinamentosObrigatoriosCargo(contratacaoId)

      return res.send({
        status: true,
        msg: 'Treinamentos obrigatórios processados com sucesso!',
        dados: {
          treinamentosIniciados: resultado.treinamentosIniciados,
          treinamentosJaExistentes: resultado.treinamentosJaExistentes,
          total: resultado.treinamentosIniciados + resultado.treinamentosJaExistentes
        }
      })
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: error.message
      })
    }
  })

  app.get('/pendentes', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user

    const treinamentos = await listarTreinamentosPendentes(cliente)

    return res.send({
      status: true,
      dados: treinamentos.map(tr => ({
        id: tr.id,
        iniciadoEm: tr.iniciadoEm,
        diasPendente: Math.floor((new Date().getTime() - tr.iniciadoEm.getTime()) / (1000 * 60 * 60 * 24)),
        treinamento: {
          id: tr.treinamento.id,
          nome: tr.treinamento.nome,
          tipo: tr.treinamento.tipo
        },
        colaborador: tr.contratacaoColaborador.colaborador.pessoa.nome,
        cargo: tr.contratacaoColaborador.cargo.nome
      }))
    })
  })

  app.get('/finalizados', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = req.user

    const treinamentos = await listarTreinamentosFinalizados(cliente)

    return res.send({
      status: true,
      dados: treinamentos.map(tr => ({
        id: tr.id,
        iniciadoEm: tr.iniciadoEm,
        finalizadoEm: tr.finalizadoEm,
        certificado: tr.certificado,
        duracaoDias: tr.finalizadoEm && Math.floor((tr.finalizadoEm.getTime() - tr.iniciadoEm.getTime()) / (1000 * 60 * 60 * 24)),
        treinamento: {
          id: tr.treinamento.id,
          nome: tr.treinamento.nome,
          tipo: tr.treinamento.tipo
        },
        colaborador: tr.contratacaoColaborador.colaborador.pessoa.nome,
        cargo: tr.contratacaoColaborador.cargo.nome
      }))
    })
  })

  // Nova rota para listar treinamentos não realizados
  app.get('/colaborador/:contratacaoId/nao-realizados', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const contratacaoIdSchema = z.object({
      contratacaoId: z.string().uuid('ID da contratação deve ser um UUID válido')
    })

    const tipoQuerySchema = z.object({
      tipo: z.enum(['integracao', 'capacitacao']).optional()
    })

    const { contratacaoId } = await contratacaoIdSchema.parseAsync(req.params)
    const { tipo } = await tipoQuerySchema.parseAsync(req.query)

    try {
      const treinamentos = await listarTreinamentosNaoRealizados(contratacaoId, tipo)

      return res.send({
        status: true,
        dados: treinamentos.map(tr => ({
          id: tr.id,
          nome: tr.nome,
          tipo: tr.tipo
        }))
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      return res.status(400).send({
        status: false,
        msg: errorMessage
      })
    }
  })
}