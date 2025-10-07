import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getDocumentosEmpresa, getUsuariosAcessoModuloDocumentos } from '../../repositories/Documentos/DocumentoRepository'

export class AdministradorDocumentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.listarDocumentosEmpresa, {
      prefix: '/api/admin/documentos',
    })

    fastifyInstance.register(this.listarCategoriasDocumentoEmpresa, {
      prefix: '/api/admin/documentos',
    })

    fastifyInstance.register(this.getUsuariosAcessosModuloDocumentos, {
      prefix: '/api/admin/documentos',
    })
  }

  async listarDocumentosEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const documentos = await getDocumentosEmpresa(empresaId)

        res.status(200).send(documentos.map((documento) => ({
          id: documento.id,
          nome: documento.nome,
          descricaoDocumento: documento.descricao,
          copias: documento.copias,
          recuperacao: documento.recuperacao,
          elegibilidade: documento.presElegibilidade,
          disposicao: documento.disposicao,
          retencao: documento.retencao,
          uso: documento.uso,
          categoriaDocumentoNome: documento.categoriasDocumento.nome,
          empresaId: documento.empresaId,
          revisoes: documento.Revisoes.map((revisao) => ({
            id: revisao.id,
            numeroRevisao: revisao.numeroRevisao,
            revisadoEm: revisao.revisadoEm,
            arquivoId: revisao.arquivos.id,
            arquivoNome: revisao.arquivos.nome,
            arquivoUrl: revisao.arquivos.url,
            usuario: revisao.usuario.pessoa.nome,
          }))
        })))
      } catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao listar documentos!',
        })
      }
    })
  }

  async listarCategoriasDocumentoEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/categorias', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const { listarCategoriasDocumentoEmpresa } = await import('../../repositories/Documentos/CategoriaRepository')

        const categorias = await listarCategoriasDocumentoEmpresa(empresaId)

        res.status(200).send(categorias)
      } catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao listar categorias!',
        })
      }
    })
  }

  async getUsuariosAcessosModuloDocumentos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresas/:empresaId/permissoes/usuarios', async (req, res) => {
      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const usuarios = await getUsuariosAcessoModuloDocumentos(empresaId)

        res.status(200).send(usuarios.map((usuario) => ({
          id: usuario.id,
          nome: usuario.pessoa.nome,
          email: usuario.email,
        })))
      } catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao listar usuários!',
        })
      }
    })
  }
}
