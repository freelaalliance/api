import { FastifyInstance } from "fastify";
import { z } from "zod";
import { buscaEstatisticasManutencoes, buscaEstatisticasManutencoesEquipamentosEmpresa, buscarManutencoesEquipamento, cancelarManutencaoEquipamento, consultaDuracaoManutencoesEquipamento, consultaQuantidadeEquipamentosFuncionando, consultaQuantidadeEquipamentosParado, consultaQuantidadeManutencoesEmAndamento, consultaQuantidadeManutencoesEmDia, finalizarManutencaoEquipamento, iniciarManutencaoEquipamento, salvarNovaManutencao } from "../../repositories/Manutencao/ManutencaoEquipamentoRepository";
import { addDays, differenceInDays } from "date-fns";

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

    fastifyInstance.register(this.buscaEstatisticasEquipamentoStatus, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.buscaEstatisticasManutencoes, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.buscaIndicadoresManutencaoEquipamento, {
      prefix: '/manutencao'
    })

    fastifyInstance.register(this.buscaIndicadoresManutencoesEmpresa, {
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

      const novaManutencao = await salvarNovaManutencao({ equipamentoId, observacao, usuarioId: id })

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

  async buscarDuracoesManutencaoEquipamento(app: FastifyInstance) {
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

  async buscaEstatisticasEquipamentoStatus(app: FastifyInstance) {
    app.get('/equipamento/estatatisticas/status', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user

      const equipamentoParado = await consultaQuantidadeEquipamentosParado({
        empresaId: cliente,
        equipamentoId: ''
      })

      const equipamentoFuncionando = await consultaQuantidadeEquipamentosFuncionando({
        empresaId: cliente,
        equipamentoId: ''
      })

      res.status(200).send({
        qtd_equipamentos_parados: equipamentoParado[0] ? Number(equipamentoParado[0].qtd_equipamentos_parados) : 0,
        qtd_equipamentos_funcionando: equipamentoFuncionando[0] ? Number(equipamentoFuncionando[0].qtd_equipamentos_funcionando) : 0,
      })
    })
  }

  async buscaEstatisticasManutencoes(app: FastifyInstance) {
    app.get('/estatisticas', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user

      const manutencoesEmAndamento = await consultaQuantidadeManutencoesEmAndamento({
        empresaId: cliente,
        equipamentoId: ''
      })

      const manutencoesEmDia = await consultaQuantidadeManutencoesEmDia({
        empresaId: cliente,
        equipamentoId: ''
      })

      const equipamentosManutencaoEmDia = manutencoesEmDia.filter((equipamento) => {
        const proximaManutencaoPreventiva = equipamento.inspecionadoEm ? addDays(new Date(equipamento.inspecionadoEm), equipamento.frequencia) : addDays(new Date(equipamento.cadastradoEm), equipamento.frequencia)

        const diasProximaManutencao = differenceInDays(proximaManutencaoPreventiva, new Date())

        if(diasProximaManutencao >= 0){
          return equipamento
        }
      })


      res.status(200).send({
        qtd_equipamentos_manutencao_em_dia: equipamentosManutencaoEmDia.length,
        qtd_manutencoes_em_andamento: manutencoesEmAndamento[0] ? Number(manutencoesEmAndamento[0].qtd_equipamentos_em_manutencao) : 0,
      })
    })
  }

  async buscaIndicadoresManutencaoEquipamento(app: FastifyInstance) {
    const schemaQueryParams = z.object({
      equipamentoId: z.string().uuid().optional()
    })

    app.get('/indicadores/equipamento', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user
      const { equipamentoId } = await schemaQueryParams.parseAsync(req.query)

      const dadosIndicadores = await buscaEstatisticasManutencoes({
        empresaId: cliente,
        equipamentoId: equipamentoId ?? null
      })

      res.status(200).send({
        total_tempo_parado: Number(dadosIndicadores[0].total_tempo_parado),
        qtd_manutencoes: Number(dadosIndicadores[0].qtd_manutencoes),
        total_tempo_operacao: Number(dadosIndicadores[0].total_tempo_operacao)
      })
    })
  }

  async buscaIndicadoresManutencoesEmpresa(app: FastifyInstance){
    app.get('/indicadores/equipamentos/empresa', async (req, res) => {
      await req.jwtVerify()

      const { cliente } = req.user

      const dadosIndicadores = await buscaEstatisticasManutencoesEquipamentosEmpresa({
        empresaId: cliente,
        equipamentoId: ''
      })

      res.status(200).send(dadosIndicadores.map((equipamento) => {
        return {
          nome: equipamento.nome,
          total_tempo_parado: Number(equipamento.total_tempo_parado),
          qtd_manutencoes: Number(equipamento.qtd_manutencoes),
          total_tempo_operacao: Number(equipamento.total_tempo_operacao)
        }
      }))
    })
  }
}

export default ManutencaoEquipamentoController