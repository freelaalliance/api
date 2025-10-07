import { addDays, differenceInDays } from 'date-fns'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  buscaEstatisticasManutencoes,
  buscaEstatisticasManutencoesEquipamentosEmpresa,
  buscarManutencoesEquipamento,
  consultaDuracaoManutencoesEquipamento,
  consultaQuantidadeEquipamentosFuncionando,
  consultaQuantidadeEquipamentosParado,
  consultaQuantidadeManutencoesEmAndamento,
  consultaQuantidadeManutencoesEmDia,
} from '../../repositories/Manutencao/ManutencaoEquipamentoRepository'

export class AdministradorManutencaoController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.listarManutencoesEquipamento, {
      prefix: '/api/admin/manutencao',
    })

    fastifyInstance.register(this.buscarDuracoesManutencaoEquipamento, {
      prefix: '/api/admin/manutencao',
    })

    fastifyInstance.register(this.buscaEstatisticasEquipamentoStatus, {
      prefix: '/api/admin/manutencao',
    })

    fastifyInstance.register(this.buscaEstatisticasManutencoes, {
      prefix: '/api/admin/manutencao',
    })

    fastifyInstance.register(this.buscaIndicadoresManutencaoEquipamento, {
      prefix: '/api/admin/manutencao',
    })

    fastifyInstance.register(this.buscaIndicadoresManutencoesEmpresa, {
      prefix: '/api/admin/manutencao',
    })
  }

  async listarManutencoesEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
      idEquipamento: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/equipamento/:idEquipamento', async (req, res) => {
      const { empresaId, idEquipamento: id } = await schemaParams.parseAsync(req.params)

      const manutencoes = await buscarManutencoesEquipamento({
        equipamentoId: id,
        empresaId,
      })

      res.status(200).send(manutencoes)
    })
  }

  async buscarDuracoesManutencaoEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
      idEquipamento: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/equipamento/:idEquipamento/duracao', async (req, res) => {
      const { empresaId, idEquipamento } = await schemaParams.parseAsync(req.params)

      const duracoesManutencoes = await consultaDuracaoManutencoesEquipamento({
        equipamentoId: idEquipamento,
        empresaId,
      })

      res.status(200).send(duracoesManutencoes)
    })
  }

  async buscaEstatisticasEquipamentoStatus(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/estatisticas/status', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const equipamentoParado = await consultaQuantidadeEquipamentosParado({
        empresaId,
        equipamentoId: '',
      })

      const equipamentoFuncionando =
        await consultaQuantidadeEquipamentosFuncionando({
          empresaId,
          equipamentoId: '',
        })

      res.status(200).send({
        qtd_equipamentos_parados: equipamentoParado
          ? Number(equipamentoParado.qtd_equipamentos_parados)
          : 0,
        qtd_equipamentos_funcionando: equipamentoFuncionando
          ? Number(equipamentoFuncionando.qtd_equipamentos_funcionando)
          : 0,
      })
    })
  }

  async buscaEstatisticasManutencoes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/estatisticas', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const manutencoesEmAndamento =
        await consultaQuantidadeManutencoesEmAndamento({
          empresaId,
          equipamentoId: '',
        })

      const manutencoesEmDia = await consultaQuantidadeManutencoesEmDia({
        empresaId,
        equipamentoId: '',
      })

      const equipamentosManutencaoEmDia = manutencoesEmDia.filter(
        equipamento => {
          const proximaManutencaoPreventiva = equipamento.inspecionadoEm
            ? addDays(
              new Date(equipamento.inspecionadoEm),
              equipamento.frequencia
            )
            : addDays(
              new Date(equipamento.cadastradoEm),
              equipamento.frequencia
            )

          const diasProximaManutencao = differenceInDays(
            proximaManutencaoPreventiva,
            new Date()
          )

          if (diasProximaManutencao >= 0) {
            return equipamento
          }

          return null
        }
      )

      res.status(200).send({
        qtd_equipamentos_manutencao_em_dia: equipamentosManutencaoEmDia.length,
        media_duracao: manutencoesEmAndamento.media_duracao,
        total_duracao_manutencoes:
          manutencoesEmAndamento.total_duracao_manutencoes,
        qtd_manutencoes_realizadas:
          manutencoesEmAndamento.qtd_manutencoes_realizadas,
      })
    })
  }

  async buscaIndicadoresManutencaoEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    const schemaQueryParams = z.object({
      equipamentoId: z.string().uuid().optional(),
    })

    app.get('/empresas/:empresaId/indicadores/equipamento', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const { equipamentoId } = await schemaQueryParams.parseAsync(req.query)

      const dadosIndicadores = await buscaEstatisticasManutencoes({
        empresaId,
        equipamentoId: equipamentoId ?? null,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      }) as unknown as any[]

      res.status(200).send({
        total_tempo_parado: Number(dadosIndicadores[0].total_tempo_parado),
        qtd_manutencoes: Number(dadosIndicadores[0].qtd_manutencoes),
        total_tempo_operacao: Number(dadosIndicadores[0].total_tempo_operacao),
      })
    })
  }

  async buscaIndicadoresManutencoesEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/indicadores/equipamentos', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const dadosIndicadores =
        await buscaEstatisticasManutencoesEquipamentosEmpresa({
          empresaId,
          equipamentoId: '',
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        }) as any[]

      res.status(200).send(
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        dadosIndicadores.map((equipamento: any) => {
          return {
            nome: equipamento.nome,
            total_tempo_parado: Number(equipamento.total_tempo_parado),
            qtd_manutencoes: Number(equipamento.qtd_manutencoes),
            total_tempo_operacao: Number(equipamento.total_tempo_operacao),
          }
        })
      )
    })
  }
}
