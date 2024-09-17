import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  agendarInspecaoEquipamento,
  atualizarAgendaEquipamento,
  consultarAgendaInspecaoEmpresa,
  finalizarInspecao,
  listaInspecoesEquipamentoEmpresa,
  listaPontosInspecionadoEquipamento,
  salvarInspecao,
} from '../../repositories/Manutencao/InspecaoEquipamentoRepository'
import { salvarNovaManutencao } from '../../repositories/Manutencao/ManutencaoEquipamentoRepository'

class InspecaoEquipamentoController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.registrarInspecao, {
      prefix: 'inspecao',
    })

    fastifyInstance.register(this.consultarInspecoesEquipamento, {
      prefix: 'inspecao',
    })

    fastifyInstance.register(this.listarPontosInspecionados, {
      prefix: 'inspecao',
    })

    fastifyInstance.register(this.finalizarInspecaoEquipamento, {
      prefix: 'inspecao',
    })

    fastifyInstance.register(this.agendaInspecoesEmpresa, {
      prefix: 'inspecao',
    })
  }

  async registrarInspecao(app: FastifyInstance) {
    const schemaDadosInspecao = z.object({
      iniciadoEm: z.coerce.date(),
      finalizadoEm: z.coerce.date().optional(),
      observacao: z.string().optional(),
      inspecaoPeca: z.array(
        z.object({
          pecaEquipamentoId: z.string().uuid(),
          aprovado: z.boolean(),
          inspecionadoEm: z.coerce.date().optional().nullable(),
          inspecionado: z.boolean(),
        }),
      ),
    })

    const schemaParamsEquipamento = z.object({
      id: z.string().uuid(),
    })

    app.post('/equipamento/:id', async (req, res) => {
      await req.jwtVerify()

      const { id, cliente } = req.user

      const { iniciadoEm, finalizadoEm, inspecaoPeca, observacao } =
        await schemaDadosInspecao.parseAsync(req.body)
      const { id: equipamentoId } = await schemaParamsEquipamento.parseAsync(
        req.params,
      )

      const pontoReprovado = inspecaoPeca.find((pontos) => !pontos.aprovado)

      if (finalizadoEm) {
        await atualizarAgendaEquipamento({
          empresaId: cliente,
          id: equipamentoId,
        })

        await agendarInspecaoEquipamento({
          empresaId: cliente,
          id: equipamentoId,
        })

        if (pontoReprovado && observacao) {
          await salvarNovaManutencao({
            equipamentoId,
            usuarioId: id,
            observacao,
          })
        }
      }

      const salvaInspecao = await salvarInspecao({
        iniciadoEm,
        equipamentoId,
        usuarioId: id,
        status: pontoReprovado ? 'reprovado' : 'aprovado',
        finalizadoEm,
        inspecaoPeca,
      })

      res.status(201).send(salvaInspecao)
    })
  }

  async consultarInspecoesEquipamento(app: FastifyInstance) {
    const schemaParamsEquipamento = z.object({
      equipamentoId: z.string().uuid(),
    })

    app.get('/equipamento/:equipamentoId', async (req, res) => {
      await req.jwtVerify()
      const { cliente } = req.user

      const { equipamentoId } = await schemaParamsEquipamento.parseAsync(
        req.params,
      )

      const inspecaoEquipamento = await listaInspecoesEquipamentoEmpresa({
        id: equipamentoId,
        empresaId: cliente,
      })

      res.status(200).send(inspecaoEquipamento)
    })
  }

  async listarPontosInspecionados(app: FastifyInstance) {
    const schemaParamsInspecao = z.object({
      id: z.string().uuid(),
    })

    app.get('/:id', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user

      const { id: inspecaoId } = await schemaParamsInspecao.parseAsync(
        req.params,
      )

      const pontosInspecionados = await listaPontosInspecionadoEquipamento(
        inspecaoId,
        cliente,
      )

      res.status(200).send(pontosInspecionados)
    })
  }

  async finalizarInspecaoEquipamento(app: FastifyInstance) {
    const schemaDadosInspecao = z.object({
      equipamentoId: z.string().uuid(),
      iniciadoEm: z.coerce.date(),
      finalizadoEm: z.coerce.date(),
      observacao: z.string().optional(),
      inspecaoPeca: z.array(
        z.object({
          pecaEquipamentoId: z.string().uuid(),
          aprovado: z.boolean(),
          inspecionadoEm: z.coerce.date(),
          inspecionado: z.boolean(),
        }),
      ),
    })

    const schemaParamsInspecao = z.object({
      id: z.string().uuid(),
    })

    app.put('/:id', async (req, res) => {
      await req.jwtVerify()

      const { id, cliente } = req.user

      const { equipamentoId, finalizadoEm, inspecaoPeca, observacao } =
        await schemaDadosInspecao.parseAsync(req.body)
      const { id: inspecaoId } = await schemaParamsInspecao.parseAsync(
        req.params,
      )

      const pontoReprovado = inspecaoPeca.find((pontos) => !pontos.aprovado)

      await atualizarAgendaEquipamento({
        empresaId: cliente,
        id: equipamentoId,
      })

      await agendarInspecaoEquipamento({
        empresaId: cliente,
        id: equipamentoId,
      })

      if (pontoReprovado && observacao) {
        await salvarNovaManutencao({
          equipamentoId,
          usuarioId: id,
          observacao,
        })
      }

      await finalizarInspecao({
        inspecaoId,
        equipamentoId,
        status: pontoReprovado ? 'reprovado' : 'aprovado',
        finalizadoEm: new Date(finalizadoEm),
        inspecaoPeca,
      })

      res.status(204).send()
    })
  }

  async agendaInspecoesEmpresa(app: FastifyInstance) {
    app.get('/agenda', async (req, res) => {
      await req.jwtVerify()
      const { cliente } = req.user

      const inspecaoAgendadas = await consultarAgendaInspecaoEmpresa({
        empresaId: cliente,
        id: '',
      })

      res.status(200).send(inspecaoAgendadas)
    })
  }
}

export default InspecaoEquipamentoController
