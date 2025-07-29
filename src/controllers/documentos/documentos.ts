import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { cadastraRevisaoDocumento, cadastrarDocumento, getDocumentosEmpresa, getDocumentosUsuario, getUsuariosAcessoModuloDocumentos, removerDocumentoEmpresa } from '../../repositories/Documentos/DocumentoRepository'

export class DocumentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.novoDocumento, {
      prefix: '/documentos',
    })
    fastifyInstance.register(this.novaRevisaoDocumento, {
      prefix: '/documentos',
    })
    fastifyInstance.register(this.listarDocumentosEmpresa, {
      prefix: '/documentos',
    })
    fastifyInstance.register(this.listarDocumentosUsuarioEmpresa, {
      prefix: '/documentos',
    })
    fastifyInstance.register(this.excluirDocumento, {
      prefix: '/documentos',
    })
    fastifyInstance.register(this.getUsuariosAcessosModuloDocumentos, {
      prefix: '/documentos',
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
      empresaId: z.string().uuid().optional()
    })

    app.post('/', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id, cliente } = req.user

      if (!cliente) {
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
        empresaId
      } = await schemaNovoDocumentoForm.parseAsync(req.body)

      try {
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
          empresaId: empresaId ?? cliente,
          usuarioId: id,
          usuariosAcessos,
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

  async novaRevisaoDocumento(app: FastifyInstance) {
    const schemaNovaRevisaoDocumentoForm = z.object({
      arquivo: z.string({
        required_error: 'Arquivo é obrigatório',
      }),
    })

    const schemaParamDocumentoRevisao = z.object({
      id: z.string().uuid()
    })

    app.post('/revisao/:id', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id: usuarioId, cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

      const { id: documentoId } = await schemaParamDocumentoRevisao.parseAsync(req.params)
      const { arquivo } = await schemaNovaRevisaoDocumentoForm.parseAsync(req.body)

      try {

        await cadastraRevisaoDocumento({
          id: documentoId,
          arquivo,
          empresaId: cliente,
          usuarioId,
        })

        res.status(201).send({
          status: true,
          msg: 'Revisão cadastrada com sucesso!',
        })
      } catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao cadastrar revisão!',
        })
      }
    })
  }

  async listarDocumentosEmpresa(app: FastifyInstance) {
    const schemaFiltroEmpresa = z.object({
      id: z.string().uuid().optional()
    })

    app.get('/empresa', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const {id} = await schemaFiltroEmpresa.parseAsync(req.query)

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

      try {
        const documentos = await getDocumentosEmpresa(id ?? cliente)

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

  async listarDocumentosUsuarioEmpresa(app: FastifyInstance) {
    app.get('/usuario', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id, cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

      try {
        const documentos = await getDocumentosUsuario(id, cliente)

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

  async excluirDocumento(app: FastifyInstance) {
    const schemaParamDocumento = z.object({
      id: z.string().uuid(),
      idEmpresa: z.string().uuid()
    })

    app.delete('/:id/empresa/:idEmpresa', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      if (!cliente) {
        res.status(401).send({
          status: true,
          msg: 'Sessão encerrada!',
        })
        return
      }

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

  async getUsuariosAcessosModuloDocumentos(app: FastifyInstance) {
    app.get('/permissoes/usuarios', async (req, res) => {
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
        const usuarios = await getUsuariosAcessoModuloDocumentos(cliente)

        res.status(200).send(usuarios.map((usuario) => ({
          id: usuario.id,
          nome: usuario.pessoa.nome,
          email: usuario.email,
        })),
        )
      } catch (error) {
        res.status(500).send({
          status: false,
          msg: 'Erro ao listar usuários!',
        })
      }
    })
  }
}
