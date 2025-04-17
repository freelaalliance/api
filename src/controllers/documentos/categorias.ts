import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { excluirCategoriaDocumento, listarCategoriasDocumentoEmpresa, novaCategoriaEmpresa } from '../../repositories/Documentos/CategoriaRepository';

export class CategoriasDocumentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.cadastrarCategoriasDocumento, { prefix: '/admin/documentos/categorias' })
    fastifyInstance.register(this.listarCategoriasDocumento, { prefix: '/admin/documentos/categorias' })
    fastifyInstance.register(this.removerCategoria, { prefix: '/admin/documentos/categorias' })
    fastifyInstance.register(this.listarCategoriasDocumentoEmpresa, { prefix: '/documentos/categorias' })
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
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

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
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
      }

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
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
      }

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

  async listarCategoriasDocumentoEmpresa(app: FastifyInstance) {
    app.get('/', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

      try {
        const categorias = await listarCategoriasDocumentoEmpresa(cliente)

        res.status(200).send(categorias)
      }
      catch (error) {
        res.status(400).send({
          status: false,
          msg: "Falha ao listar categorias!"
        })
      }
    })
  }
}
