import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import CalibracaoEntity, {
  type EstatisticaAgendaCalibracaoEmpresaType,
  type EstatisticaCalibracaoInstrumentoEmpresaType,
} from '../../entities/CalibracaoEntity'
import InstrumentoEntity, {
  type EstatisticaInstrumentoEmpresaType,
} from '../../entities/InstrumentoEntity'
import type { HistoricoCalibracaoInstrumentoType } from '../../repositories/CalibracaoRepository'

class InstrumentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.criarNovaCalibracao, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.modificarDadosCalibracao, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.modificarDadosInstrumento, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.removerCalibracao, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.removerInstrumento, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.buscarCalibracoesEmpresa, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.buscarAgendaCalibracoesEmpresa, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(this.consultarInstrumentoEmpresaPorCodigo, {
      prefix: '/instrumentos',
    })
    fastifyInstance.register(
      this.recuperarEstatisticasInstrumentosCalibracoesEmpresa,
      {
        prefix: '/instrumentos',
      }
    )
    fastifyInstance.register(this.recuperarHistoricoInstrumento, {
      prefix: '/instrumentos',
    })
  }

  async criarNovaCalibracao(app: FastifyInstance) {
    const schemaCalibracao = z.object({
      numeroCertificado: z.string().min(1, {
        message: 'O número do certificado é obrigatório',
      }),
      erroEncontrado: z.string().min(1, {
        message: 'O valor do erro encontrado é obrigatório',
      }),
      incertezaTendenciaEncontrado: z.string().min(1, {
        message: 'A incerteza ou tendencia encontrada é obrigatória',
      }),
      localizacao: z.string().min(1, {
        message: 'A localização é obrigatória',
      }),
      toleranciaEstabelecida: z.string().min(1, {
        message: 'A tolerância estabelecida é obrigatória',
      }),
      observacao: z.optional(z.string()),
      certificado: z.string().min(1, {
        message: 'O certificado é obrigatório',
      }),
      realizadoEm: z.coerce.date({
        required_error: 'A data de realização é obrigatória',
      }),
      codigo: z.string().min(1, {
        message: 'O código do instrumento é obrigatório',
      }),
      nome: z.string().min(1, {
        message: 'O nome do instrumento é obrigatório',
      }),
      marca: z.string().min(1, {
        message: 'O marca do instrumento é obrigatório!',
      }),
      resolucao: z.string().min(1, {
        message: 'A resolução do instrumento é obrigatória',
      }),
      frequencia: z.number({
        required_error:
          'Necessario informar a frequencia de dias para realizar uma nova calibração!',
      }),
      repeticao: z.number({
        required_error:
          'Necessario informar a quantidade de calibrações esse instrumento pode receber!',
      }),
    })

    app.post('/calibracao', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })
      const {
        numeroCertificado,
        erroEncontrado,
        incertezaTendenciaEncontrado,
        toleranciaEstabelecida,
        observacao,
        certificado,
        realizadoEm,
        codigo,
        nome,
        marca,
        resolucao,
        frequencia,
        repeticao,
        localizacao,
      } = schemaCalibracao.parse(req.body)

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      calibracaoInstrumentoEntity.setNumeroCertificado(numeroCertificado)
      calibracaoInstrumentoEntity.setErroEncontrado(erroEncontrado)
      calibracaoInstrumentoEntity.setIncertezaTendencia(
        incertezaTendenciaEncontrado
      )
      calibracaoInstrumentoEntity.setTolerancia(toleranciaEstabelecida)
      calibracaoInstrumentoEntity.setCertificado(certificado)
      calibracaoInstrumentoEntity.setRealizadoEm(realizadoEm)

      if (observacao) calibracaoInstrumentoEntity.setObservacao(observacao)

      calibracaoInstrumentoEntity.setCodigo(codigo)
      calibracaoInstrumentoEntity.setNome(nome)
      calibracaoInstrumentoEntity.setMarca(marca)
      calibracaoInstrumentoEntity.setResolucao(resolucao)
      calibracaoInstrumentoEntity.setFrequencia(frequencia)
      calibracaoInstrumentoEntity.setRepeticao(repeticao)
      calibracaoInstrumentoEntity.setLocalizacao(localizacao)

      calibracaoInstrumentoEntity.setUsuarioId(req.user.id)
      calibracaoInstrumentoEntity.setEmpresaId(req.user.cliente)

      const salvaCalibracaoInstrumento =
        await calibracaoInstrumentoEntity.salvarCalibracao()

      reply
        .status(salvaCalibracaoInstrumento.status ? 201 : 400)
        .send(salvaCalibracaoInstrumento)
    })
  }

  async modificarDadosCalibracao(app: FastifyInstance) {
    const schemaCalibracao = z.object({
      numeroCertificado: z.string().min(1, {
        message: 'O número do certificado é obrigatório',
      }),
      erroEncontrado: z.string().min(1, {
        message: 'O valor do erro encontrado é obrigatório',
      }),
      incertezaTendenciaEncontrado: z.string().min(1, {
        message: 'A incerteza ou tendencia encontrada é obrigatória',
      }),
      toleranciaEstabelicida: z.string().min(1, {
        message: 'A tolerância estabelecida é obrigatória',
      }),
      observacao: z.optional(z.string()),
      certificado: z.string().min(1, {
        message: 'O certificado é obrigatório',
      }),
      realizadoEm: z.coerce.date({
        required_error: 'A data de realização é obrigatória',
      }),
    })

    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da calibração!',
        })
        .uuid({
          message: 'Id da calibração é inválida!',
        }),
    })

    app.put('/calibracao/:id', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id } = schemaParams.parse(req.params)
      const {
        numeroCertificado,
        erroEncontrado,
        incertezaTendenciaEncontrado,
        toleranciaEstabelicida,
        observacao,
        certificado,
        realizadoEm,
      } = schemaCalibracao.parse(req.body)

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      calibracaoInstrumentoEntity.setNumeroCertificado(numeroCertificado)
      calibracaoInstrumentoEntity.setErroEncontrado(erroEncontrado)
      calibracaoInstrumentoEntity.setIncertezaTendencia(
        incertezaTendenciaEncontrado
      )
      calibracaoInstrumentoEntity.setTolerancia(toleranciaEstabelicida)
      calibracaoInstrumentoEntity.setObservacao(observacao ?? null)
      calibracaoInstrumentoEntity.setCertificado(certificado)
      calibracaoInstrumentoEntity.setRealizadoEm(realizadoEm)
      calibracaoInstrumentoEntity.setUsuarioId(req.user.id)

      const salvaCalibracaoInstrumento =
        await calibracaoInstrumentoEntity.atualizarDadosCalibracao(id)

      reply
        .code(salvaCalibracaoInstrumento.status ? 202 : 400)
        .send(salvaCalibracaoInstrumento)
    })
  }

  async modificarDadosInstrumento(app: FastifyInstance) {
    const schemaInstrumento = z.object({
      codigo: z.string().min(1, {
        message: 'O código do instrumento é obrigatório',
      }),
      nome: z.string().min(1, {
        message: 'O nome do instrumento é obrigatório',
      }),
      marca: z.string().min(1, {
        message: 'O marca do instrumento é obrigatório!',
      }),
      resolucao: z.string().min(1, {
        message: 'A resolução do instrumento é obrigatória',
      }),
      frequencia: z.number({
        required_error:
          'Necessario informar a frequencia de dias para realizar uma nova calibração!',
      }),
      repeticao: z.number({
        required_error:
          'Necessario informar a quantidade de calibrações esse instrumento pode receber!',
      }),
    })

    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do instrumento!',
        })
        .uuid({
          message: 'Id do instrumento é inválida!',
        }),
    })

    app.put('/:id', async (req, reply) => {
      const { codigo, nome, marca, resolucao, frequencia, repeticao } =
        schemaInstrumento.parse(req.params)

      const { id } = schemaParams.parse(req.body)

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      calibracaoInstrumentoEntity.setCodigo(codigo)
      calibracaoInstrumentoEntity.setNome(nome)
      calibracaoInstrumentoEntity.setMarca(marca)
      calibracaoInstrumentoEntity.setResolucao(resolucao)
      calibracaoInstrumentoEntity.setFrequencia(frequencia)
      calibracaoInstrumentoEntity.setRepeticao(repeticao)

      const salvaDadosInstrumento =
        await calibracaoInstrumentoEntity.atualizarDadosInstrumento(id)

      reply
        .code(salvaDadosInstrumento.status ? 202 : 400)
        .send(salvaDadosInstrumento)
    })
  }

  async removerInstrumento(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do instrumento!',
        })
        .uuid({
          message: 'Id do instrumento é inválida!',
        }),
    })

    app.delete('/:id', async (req, res) => {
      const { id } = schemaParams.parse(req.params)

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      const salvaRemoverInstrumento =
        await calibracaoInstrumentoEntity.excluirInstrumento(id)

      res
        .code(salvaRemoverInstrumento.status ? 202 : 400)
        .send(salvaRemoverInstrumento)
    })
  }

  async removerCalibracao(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da calibração!',
        })
        .uuid({
          message: 'Id da calibração é inválida!',
        }),
    })

    app.delete('/calibracao/:id', async (req, res) => {
      const { id } = schemaParams.parse(req.params)

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      const salvaRemoverCalibracao =
        await calibracaoInstrumentoEntity.excluirCalibracao(id)

      res
        .code(salvaRemoverCalibracao.status ? 202 : 400)
        .send(salvaRemoverCalibracao)
    })
  }

  async buscarCalibracoesEmpresa(app: FastifyInstance) {
    app.get('/calibracao/all', async req => {
      await req.jwtVerify({ onlyCookie: true })

      const calibracaoInstrumentoEntity = new CalibracaoEntity()

      const calibracoes =
        await calibracaoInstrumentoEntity.recuperarListaCalibracaoEmpresa(
          req.user.cliente
        )

      return calibracoes.map(calibracaoInstrumento => {
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
    })
  }

  async buscarAgendaCalibracoesEmpresa(app: FastifyInstance) {
    app.get('/calibracoes/agenda', async req => {
      await req.jwtVerify({ onlyCookie: true })
      const calibracaoEntity = new CalibracaoEntity()

      return await calibracaoEntity.recuperarAgendamentosCalibracaoInstrumentosEmpresa(
        req.user.cliente
      )
    })
  }

  async consultarInstrumentoEmpresaPorCodigo(app: FastifyInstance) {
    const schemaParams = z.object({
      codigo: z.optional(z.string()),
    })

    app.get('/', async req => {
      await req.jwtVerify({ onlyCookie: true })
      const { codigo } = schemaParams.parse(req.query)

      if (codigo) {
        const instrumentoEntity = new InstrumentoEntity()

        instrumentoEntity.setEmpresaId(req.user.cliente)

        const dadosInstrumento =
          await instrumentoEntity.buscarDadosInstrumentoEmpresaPorCodigo(codigo)

        return {
          id: dadosInstrumento.getId(),
          codigo: dadosInstrumento.getCodigo(),
          nome: dadosInstrumento.getNome(),
          resolucao: dadosInstrumento.getResolucao(),
          marca: dadosInstrumento.getMarca(),
          localizacao: dadosInstrumento.getLocalizacao(),
          frequencia: dadosInstrumento.getFrequencia(),
          repeticao: dadosInstrumento.getRepeticao(),
        }
      }
      return null
    })
  }

  async recuperarEstatisticasInstrumentosCalibracoesEmpresa(
    app: FastifyInstance
  ) {
    app.get('/estatisticas', async req => {
      await req.jwtVerify({ onlyCookie: true })
      const calibracaoEntity = new CalibracaoEntity()

      const estatisticasCalibracao: EstatisticaCalibracaoInstrumentoEmpresaType =
        await calibracaoEntity.recuperarEstatisticasCalibracoesEmpresa(
          req.user.cliente
        )

      const estatisticasInstrumento: EstatisticaInstrumentoEmpresaType =
        await calibracaoEntity.recuperarEstatisticasInstrumentoEmpresa(
          req.user.cliente
        )

      const estatisticasAgenda: EstatisticaAgendaCalibracaoEmpresaType =
        await calibracaoEntity.recuperarEstatisticasAgendaCalibracaoEmpresa(
          req.user.cliente
        )

      return {
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
      }
    })
  }

  async recuperarHistoricoInstrumento(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do instrumento',
        })
        .uuid({ message: 'O id do instrumento é inválido!' }),
    })

    app.get('/historico/:id', async req => {
      const instrumentoEntity = new CalibracaoEntity()
      const { id } = schemaParams.parse(req.params)

      const dadosInstrumento: InstrumentoEntity =
        await instrumentoEntity.consultarDadosInstrumentoPorId(id)

      const historicoCalibracoesInstrumento: HistoricoCalibracaoInstrumentoType[] =
        await instrumentoEntity.recuperarHistoricoCalibracoesInstrumento(id)

      return {
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
      }
    })
  }
}

export default InstrumentosController
