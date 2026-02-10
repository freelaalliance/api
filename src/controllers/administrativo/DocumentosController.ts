import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { excluirCategoriaDocumento, listarCategoriasDocumentoEmpresa, novaCategoriaEmpresa } from '../../repositories/Documentos/CategoriaRepository'
import { cadastrarDocumento, getDocumentosEmpresa, getUsuariosAcessoModuloDocumentos, removerDocumentoEmpresa } from '../../repositories/Documentos/DocumentoRepository'
import { prisma } from '../../services/PrismaClientService'

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

    fastifyInstance.register(this.excluirDocumento, {
      prefix: '/api/admin/documentos',
    })

    fastifyInstance.register(this.cadastrarCategoriasDocumento, {
      prefix: '/api/admin/documentos/categorias'
    })

    fastifyInstance.register(this.removerCategoria, {
      prefix: '/api/admin/documentos/categorias'
    })

    fastifyInstance.register(this.novoDocumento, {
      prefix: '/api/admin/documentos',
    })

    fastifyInstance.register(this.listarPastasPorEmpresa, {
      prefix: '/api/admin/documentos/pastas',
    })

    fastifyInstance.register(this.criarPasta, {
      prefix: '/api/admin/documentos/pastas',
    })
  }

  async novoDocumento(app: FastifyInstance) {
    const schemaNovoDocumentoForm = z.object({
      nome: z.string({
        required_error: 'Codigo do documento é obrigatório',
      }),
      descricaoDocumento: z.string({
        required_error: 'Descrição do documento é obrigatória',
      }),
      copias: z.coerce
        .number({
          required_error: 'Campo de cópias é obrigatório',
          invalid_type_error: 'Campo de cópias deve ser um número',
        })
        .refine(value => value >= 0, {
          message: 'O número de cópias não pode ser negativo',
        })
        .default(0),
      recuperacao: z.string({
        required_error: 'Campo de recuperação é obrigatório',
      }),
      elegibilidade: z.string({
        required_error: 'Campo de elegibilidade é obrigatório',
      }),
      disposicao: z.string({
        required_error: 'Campo de disposição é obrigatório',
      }),
      retencao: z.coerce.date(),
      uso: z.string({
        required_error: 'Campo uso é obrigatório',
      }),
      categoriaDocumento: z
        .string({
          required_error: 'Campo categoria é obrigatório',
        })
        .uuid(),
      usuariosAcessos: z
        .array(
          z.object({
            id: z.string().uuid(),
            nome: z.string(),
            email: z.string().email(),
          })
        )
        .default([]),
      arquivo: z.string(),
      numeroRevisao: z.coerce.number().optional(),
      dataRevisao: z.coerce.date().optional(),
      empresaId: z.string().uuid().optional()
    })

    app.post('/empresa', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id } = await z.object({
        id: z.string().uuid(),
      }).parseAsync(req.user)

      if (!id) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

      const {
        nome,
        descricaoDocumento,
        copias,
        recuperacao,
        elegibilidade,
        disposicao,
        retencao,
        uso,
        categoriaDocumento,
        usuariosAcessos,
        arquivo,
        dataRevisao,
        numeroRevisao,
        empresaId
      } = await schemaNovoDocumentoForm.parseAsync(req.body)

      try {
        if (!empresaId) {
          res.status(400).send({
            status: false,
            msg: 'Erro ao cadastrar documento!',
          })
          return
        }

        await cadastrarDocumento({
          nome,
          descricaoDocumento,
          copias,
          recuperacao,
          elegibilidade,
          disposicao,
          retencao,
          uso,
          categoriaDocumento,
          empresaId,
          usuarioId: id,
          usuariosAcessos,
          dataRevisao,
          numeroRevisao,
          arquivo,
        })

        res.status(201).send({
          status: true,
          msg: 'Documento criado com sucesso!'
        })
      }
      catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao cadastrar documento!',
        })
      }
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
          })),
          pasta: documento.pastaDocumento ? {
            id: documento.pastaDocumento.id,
            nome: documento.pastaDocumento.nome,
          } : null,
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

  async excluirDocumento(app: FastifyInstance) {
    const schemaParamDocumento = z.object({
      id: z.string().uuid(),
      idEmpresa: z.string().uuid()
    })

    app.delete('/:id/empresa/:idEmpresa', async (req, res) => {

      const { id, idEmpresa } = await schemaParamDocumento.parseAsync(req.params)

      try {

        await removerDocumentoEmpresa(idEmpresa, id)

        res.status(200).send({
          status: true,
          msg: 'Documento excluído com sucesso!',
        })
      }
      catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao excluir documento!',
        })
      }
    })
  }

  async listarPastasPorEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    app.get('/empresa/:empresaId', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { empresaId } = await schemaParams.parseAsync(req.params)

      try {
        const pastas = await prisma.pastaDocumento.findMany({
          where: {
            empresaId,
            excluido: false,
          },
          orderBy: {
            nome: 'asc',
          },
          select: {
            id: true,
            nome: true,
            empresaId: true,
            _count: {
              select: {
                documentos: {
                  where: {
                    excluido: false,
                  },
                },
              },
            },
          },
        })

        return res.status(200).send(pastas.map(pasta => ({
          id: pasta.id,
          nome: pasta.nome,
          empresaId: pasta.empresaId,
        })))
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao listar pastas!',
        })
      }
    })
  }

  async criarPasta(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z.string().uuid(),
    })

    const schemaNovaPasta = z.object({
      nome: z.string({
        required_error: 'Nome da pasta é obrigatório',
      }).min(1, 'Nome da pasta não pode ser vazio'),
    })

    app.post('/empresa/:empresaId', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { empresaId } = await schemaParams.parseAsync(req.params)

      const { nome } = await schemaNovaPasta.parseAsync(req.body)

      try {
        const pasta = await prisma.pastaDocumento.create({
          data: {
            nome,
            empresaId,
          },
        })

        return res.status(201).send({
          status: true,
          msg: 'Pasta criada com sucesso!',
          data: {
            id: pasta.id,
            nome: pasta.nome,
            empresaId: pasta.empresaId,
          },
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao criar pasta!',
        })
      }
    })
  }

}
