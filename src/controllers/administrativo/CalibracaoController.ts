import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import CalibracaoEntity, {
  type EstatisticaAgendaCalibracaoEmpresaType,
  type EstatisticaCalibracaoInstrumentoEmpresaType,
} from '../../entities/CalibracaoEntity'
import type { HistoricoCalibracaoInstrumentoType } from '../../repositories/CalibracaoRepository'

export class AdministradorCalibracaoController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.buscarAgendaCalibracoesEmpresa, {
      prefix: '/api/admin/calibracao',
    })

    fastify.register(this.buscarCalibracoesEmpresa, {
      prefix: '/api/admin/calibracao',
    })

    fastify.register(this.recuperarEstatisticasInstrumentosCalibracoesEmpresa, {
      prefix: '/api/admin/calibracao',
    })

    fastify.register(this.recuperarHistoricoInstrumento, {
      prefix: '/api/admin/calibracao',
    })
  }

  async buscarAgendaCalibracoesEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/agenda', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const calibracaoEntity = new CalibracaoEntity()

      const agenda = await calibracaoEntity.recuperarAgendamentosCalibracaoInstrumentosEmpresa(
        empresaId
      )

      return res.status(200).send(agenda)
    })
  }

  async buscarCalibracoesEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/calibracoes', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      const calibracoes =
        await calibracaoInstrumentoEntity.recuperarListaCalibracaoEmpresa(
          empresaId
        )

      return res.status(200).send(
        calibracoes.map(calibracaoInstrumento => {
          return {
            calibracao: {
              id: calibracaoInstrumento.id,
              numeroCertificado: calibracaoInstrumento.numeroCertificado,
              erroEncontrado: calibracaoInstrumento.erroEncontrado,
              incertezaTendenciaEncontrado:
                calibracaoInstrumento.incertezaTendenciaEncontrado,
              toleranciaEstabelicida:
                calibracaoInstrumento.toleranciaEstabelicida,
              certificado: calibracaoInstrumento.certificado,
              observacao: calibracaoInstrumento.observacao,
              status: calibracaoInstrumento.status,
              realizadoEm: calibracaoInstrumento.realizadoEm,
              usuarioId: calibracaoInstrumento.usuarioId,
              usuarioNome: calibracaoInstrumento.usuario.pessoa.nome,
            },
            instrumento: {
              id: calibracaoInstrumento.instrumento.id,
              codigo: calibracaoInstrumento.instrumento.codigo,
              nome: calibracaoInstrumento.instrumento.nome,
              localizacao: calibracaoInstrumento.instrumento.localizacao,
              marca: calibracaoInstrumento.instrumento.marca,
              resolucao: calibracaoInstrumento.instrumento.resolucao,
              frequencia: calibracaoInstrumento.instrumento.frequencia,
              repeticao: calibracaoInstrumento.instrumento.repeticao,
            },
          }
        })
      )
    })
  }

  async recuperarEstatisticasInstrumentosCalibracoesEmpresa(
    app: FastifyInstance
  ) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/estatisticas', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)
      const calibracaoEntity = new CalibracaoEntity()

      const estatisticasCalibracao: EstatisticaCalibracaoInstrumentoEmpresaType =
        await calibracaoEntity.recuperarEstatisticasCalibracoesEmpresa(
          empresaId
        )

      const estatisticasInstrumento =
        await calibracaoEntity.recuperarEstatisticasInstrumentoEmpresa(
          empresaId
        )

      const estatisticasAgenda: EstatisticaAgendaCalibracaoEmpresaType =
        await calibracaoEntity.recuperarEstatisticasAgendaCalibracaoEmpresa(
          empresaId
        )

      return res.status(200).send({
        quantidadeCalibracoesAprovadas:
          estatisticasCalibracao.quantidadeCalibracoesAprovadas,
        quantidadeCalibracoesReprovadas:
          estatisticasCalibracao.quantidadeCalibracoesReprovadas,
        quantidadeInstrumentosEmpresa:
          estatisticasInstrumento.quantidadeInstrumentosEmpresa,
        quantidadeInstrumentosCadastradoAtual:
          estatisticasInstrumento.quantidadeInstrumentosCadastradoAtual,
        calibracoesVencido: estatisticasAgenda.calibracoesVencido,
        calibracoesVencendo: estatisticasAgenda.calibracoesVencendo,
        calibracoesDentroPrazo: estatisticasAgenda.calibracoesDentroPrazo,
      })
    })
  }

  async recuperarHistoricoInstrumento(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
      id: z
        .string({
          required_error: 'Necessário informar o id do instrumento',
        })
        .uuid({ message: 'O id do instrumento é inválido!' }),
    })

    app.get('/empresas/:empresaId/historico/:id', async (req, res) => {
      const instrumentoEntity = new CalibracaoEntity()
      const { id } = await schemaParams.parseAsync(req.params)

      const dadosInstrumento =
        await instrumentoEntity.consultarDadosInstrumentoPorId(id)

      const historicoCalibracoesInstrumento: HistoricoCalibracaoInstrumentoType[] =
        await instrumentoEntity.recuperarHistoricoCalibracoesInstrumento(id)

      return res.status(200).send({
        id: dadosInstrumento.getId(),
        codigo: dadosInstrumento.getCodigo(),
        nome: dadosInstrumento.getNome(),
        marca: dadosInstrumento.getMarca(),
        localizacao: dadosInstrumento.getLocalizacao(),
        frequencia: dadosInstrumento.getFrequencia(),
        repeticao: dadosInstrumento.getRepeticao(),
        calibracoes: historicoCalibracoesInstrumento.map(calibracao => {
          return {
            id: calibracao.id,
            numeroCertificado: calibracao.numeroCertificado,
            erroEncontrado: calibracao.erroEncontrado,
            incertezaTendenciaEncontrado:
              calibracao.incertezaTendenciaEncontrado,
            toleranciaEstabelicida: calibracao.toleranciaEstabelicida,
            certificado: calibracao.certificado,
            observacao: calibracao.observacao,
            status: calibracao.status,
            realizadoEm: calibracao.realizadoEm,
            usuarioUltimaAlteracao: calibracao.usuario.pessoa.nome,
          }
        }),
      })
    })
  }
}
