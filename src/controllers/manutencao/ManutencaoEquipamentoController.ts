import { FastifyInstance } from "fastify";
import { z } from "zod";
import { buscarManutencoesEquipamento, cancelarManutencaoEquipamento, consultaDuracaoManutencoesEquipamento, finalizarManutencaoEquipamento, iniciarManutencaoEquipamento, salvarNovaManutencao } from "../../repositories/Manutencao/ManutencaoEquipamentoRepository";

class ManutencaoEquipamentoController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.listarManutencoesEquipamento, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.novaManutencaoEquipamento, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.cancelarManutencao, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.iniciarManutencao, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.encerrarManutencao, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.buscarDuracoesManutencaoEquipamento, {
      prefix: '/manutencao'
    })
  }

  async listarManutencoesEquipamento(app: FastifyInstance) {
    const schemaParamsEquipamento = z.object({
      idEquipamento: z.string()
    })

    app.get('/equipamento/:idEquipamento', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user

      const { idEquipamento: id } = schemaParamsEquipamento.parse(req.params)

      const manutencoes = await buscarManutencoesEquipamento({ equipamentoId: id, empresaId: cliente })

      res.status(200).send(manutencoes)
    })
  }

  async novaManutencaoEquipamento(app: FastifyInstance) {
    const schemaParamsManutencao = z.object({
      equipamentoId: z.string().uuid(),
    })

    const schemaBodyNovaManutencao = z.object({
      observacao: z.string(),
    })

    app.post('/equipamento/:equipamentoId', async (req, res) => {
      await req.jwtVerify()

      const { id } = req.user

      const { observacao } = await schemaBodyNovaManutencao.parseAsync(req.body)
      const { equipamentoId } = schemaParamsManutencao.parse(req.params)

      const novaManutencao = await salvarNovaManutencao({ equipamentoId, observacao, usuarioId: id})

      res.status(201).send(novaManutencao)
    })
  }

  async cancelarManutencao(app: FastifyInstance) {
    const schemaParamsManutencao = z.object({
      id: z.string().uuid(),
    })

    const schemaBodyCancelaManutencao = z.object({
      equipamentoId: z.string().uuid(),
    })

    app.patch('/cancelar/:id', async (req, res) => {
      const { id: manutencaoId } = await schemaParamsManutencao.parseAsync(req.params)
      const { equipamentoId } = await schemaBodyCancelaManutencao.parseAsync(req.body)

      const cancelaManutencao = await cancelarManutencaoEquipamento({ equipamentoId, manutencaoId, canceladoEm: new Date() })

      res.status(200).send(cancelaManutencao)
    })
  }

  async encerrarManutencao(app: FastifyInstance) {
    const schemaParamsManutencao = z.object({
      id: z.string().uuid(),
    })

    const schemaBodyFinalizaManutencao = z.object({
      finalizadoEm: z.coerce.date(),
      equipamentoId: z.string().uuid(),
    })

    app.patch('/finalizar/:id', async (req, res) => {
      const { id: manutencaoId } = await schemaParamsManutencao.parseAsync(req.params)
      const { equipamentoId, finalizadoEm } = await schemaBodyFinalizaManutencao.parseAsync(req.body)

      const finalizaManutencao = await finalizarManutencaoEquipamento(
        {
          equipamentoId,
          manutencaoId,
          finalizadoEm,
        }
      )

      res.status(200).send(finalizaManutencao)
    })
  }

  async iniciarManutencao(app: FastifyInstance) {
    const schemaParamsManutencao = z.object({
      id: z.string().uuid(),
    })

    const schemaBodyIniciarManutencao = z.object({
      equipamentoId: z.string().uuid(),
    })

    app.patch('/iniciar/:id', async (req, res) => {
      
      const { id: manutencaoId } = await schemaParamsManutencao.parseAsync(req.params)
      const { equipamentoId } = await schemaBodyIniciarManutencao.parseAsync(req.body)

      const iniciaManutencao = await iniciarManutencaoEquipamento(
        {
          equipamentoId, 
          manutencaoId, 
          iniciadoEm: new Date()
        })

      res.status(200).send(iniciaManutencao)
    })
  }

  async buscarDuracoesManutencaoEquipamento(app: FastifyInstance){
    const schemaParamsManutencao = z.object({
      idEquipamento: z.string().uuid(),
    })

    app.get('/equipamento/:idEquipamento/duracao', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user

      const { idEquipamento } = await schemaParamsManutencao.parseAsync(req.params)

      const duracoesManutencoes = await consultaDuracaoManutencoesEquipamento({ equipamentoId: idEquipamento, empresaId: cliente })

      res.status(200).send(duracoesManutencoes)
    })
  }
}

export default ManutencaoEquipamentoController