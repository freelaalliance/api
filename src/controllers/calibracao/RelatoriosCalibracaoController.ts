import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import CalibracaoEntity from '../../entities/CalibracaoEntity'

const reqUserSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().uuid(),
})

class RelatorioCalibracaoController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.gerarRelatorioCalibracao, {
      prefix: '/relatorio',
    })
  }

  async gerarRelatorioCalibracao(app: FastifyInstance) {
    const schemaFiltroRelatorio = z.object({
      status: z.enum(["aprovado", "reprovado"]).optional(),
      calibradoDe: z.optional(z.coerce.date()),
      calibradoAte: z.optional(z.coerce.date()),
      codigoInstrumento: z.string().optional(),
      localizacaoInstrumento: z.string().optional(),
    })

    app.get('/calibracoes', async (req, reply) => {
      const {
        status,
        calibradoDe,
        calibradoAte,
        codigoInstrumento,
        localizacaoInstrumento,
      } = schemaFiltroRelatorio.parse(req.query)

      await req.jwtVerify({ onlyCookie: true })

      const calibracaoEntity = new CalibracaoEntity()
      const { cliente: empresaId } = await reqUserSchema.parseAsync(req.user)
      calibracaoEntity.setEmpresaId(empresaId)

      const calibracoes =
        await calibracaoEntity.buscarCalibracoesEmpresaPorFiltro({
          status,
          calibradoDe: calibradoDe && new Date(calibradoDe),
          calibradoAte: calibradoAte && new Date(calibradoAte),
          codigoInstrumento,
          localizacaoInstrumento,
        })

      reply.code(200).send(
        calibracoes.map(calibracao => {
          return {
            id: calibracao.id,
            codigo: calibracao.instrumento.codigo,
            nome: calibracao.instrumento.nome,
            localizacao: calibracao.instrumento.localizacao,
            marca: calibracao.instrumento.marca,
            resolucao: calibracao.instrumento.resolucao,
            frequencia: calibracao.instrumento.frequencia,
            numeroCertificado: calibracao.numeroCertificado,
            erroEncontrado: calibracao.erroEncontrado,
            incertezaTendenciaEncontrado:
              calibracao.incertezaTendenciaEncontrado,
            toleranciaEstabelicida: calibracao.toleranciaEstabelicida,
            observacao: calibracao.observacao,
            certificado: calibracao.certificado,
            status: calibracao.status,
            realizadoEm: calibracao.realizadoEm,
            atualizadoEm: calibracao.atualizadoEm,
          }
        })
      )
    })
  }
}

export default RelatorioCalibracaoController
