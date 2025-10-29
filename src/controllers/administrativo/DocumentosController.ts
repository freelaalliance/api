import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { excluirCategoriaDocumento, listarCategoriasDocumentoEmpresa, novaCategoriaEmpresa } from '../../repositories/Documentos/CategoriaRepository'
import { getDocumentosEmpresa, getUsuariosAcessoModuloDocumentos } from '../../repositories/Documentos/DocumentoRepository'

export class AdministradorDocumentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.listarDocumentosEmpresa, {
      prefix: '/api/admin/documentos',
    })

    fastifyInstance.register(this.listarCategoriasDocumento, {
      prefix: '/api/admin/documentos/categorias',
    })

    fastifyInstance.register(this.getUsuariosAcessosModuloDocumentos, {
      prefix: '/api/admin/documentos',
    })

    fastifyInstance.register(this.cadastrarCategoriasDocumento, { 
      prefix: '/api/admin/documentos/categorias' 
    })

    fastifyInstance.register(this.removerCategoria, { 
      prefix: '/api/admin/documentos/categorias' 
    })
  }

  async cadastrarCategoriasDocumento(app: FastifyInstance) {
    const schemaBodyInserirCategoria = z.object({
      categorias: z.array(z.object({
        nome: z.string(),
      })),
    })

    const schemaParamEmpresaCategoria = z.object({
      empresaId: z.string().uuid()
    })

    app.post('/:empresaId', async (req, res) => {

      const { categorias } = await schemaBodyInserirCategoria.parseAsync(req.body)
      const { empresaId } = await schemaParamEmpresaCategoria.parseAsync(req.params)

      try {
        await novaCategoriaEmpresa(categorias.map((categoria) => ({
          ...categoria,
          empresaId
        })))

        res.status(201).send({
          status: true,
          msg: "Categorias inseridas com sucesso"
        })
      }
      catch (error) {
        res.status(400).send({
          status: false,
          msg: "Falha ao cadastrar categorias!"
        })
      }
    })
  }

  async listarCategoriasDocumento(app: FastifyInstance) {
    const schemaParamEmpresaCategoria = z.object({
      empresaId: z.string().uuid()
    })

    app.get('/:empresaId', async (req, res) => {

      const { empresaId } = await schemaParamEmpresaCategoria.parseAsync(req.params)

      const categorias = await listarCategoriasDocumentoEmpresa(empresaId)

      res.status(200).send(categorias)
    })
  }

  async removerCategoria(app: FastifyInstance) {
    const schemaParamCategoria = z.object({
      id: z.string().uuid()
    })

    app.delete('/:id', async (req, res) => {

      const { id } = await schemaParamCategoria.parseAsync(req.params)

      try {
        await excluirCategoriaDocumento(id)

        res.status(202).send({
          status: true,
          msg: "Categoria removida com sucesso",
        })
      }
      catch (error) {
        res.status(400).send({
          status: false,
          msg: "Falha ao remover categoria!"
        })
      }
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
