import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import FuncaoEntity from '../../entities/FuncaoEntity'
import PerfilEntity from '../../entities/PerfilEntity'
import type { FuncaoInterface } from '../../interfaces/ModulosSistemaInterface'

class PerfilController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.criarPerfil, {
      prefix: '/api/admin/perfil',
    })
    fastify.register(this.editarPerfil, { prefix: '/api/admin/perfil' })
    fastify.register(this.buscarPerfil, { prefix: '/api/admin/perfil' })
    fastify.register(this.excluirPerfil, { prefix: '/api/admin/perfil' })
    fastify.register(this.vincularFuncao, {
      prefix: '/api/admin/perfil',
    })
    fastify.register(this.desvincularFuncao, {
      prefix: '/api/admin/perfil',
    })
    fastify.register(this.listarPermissoesPerfil, { prefix: '/api/admin/perfil' })
  }

  async criarPerfil(app: FastifyInstance) {
    const schemaPerfil = z.object({
      nome: z.string().min(1, {
        message: 'O nome do perfil é obrigatório',
      }),
      administrativo: z.boolean().default(false),
      empresa: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({
          message: 'Id da empresa inválido',
        }),
    })

    app.post('/', async (req, reply) => {
      try {
        const { nome, administrativo, empresa } = schemaPerfil.parse(req.body)

        const perfilEntity = new PerfilEntity(null, nome, administrativo)

        const cadastraPerfil = await perfilEntity.cadastrarPerfil(empresa)

        if (cadastraPerfil.status) {
          reply.status(201).send(cadastraPerfil)
        } else {
          reply.status(400).send({
            status: false,
            msg: 'Erro ao cadastrar perfil',
          })
        }
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: error,
        })
      }
    })
  }

  async editarPerfil(app: FastifyInstance) {
    const schemaPerfil = z.object({
      nome: z.string().min(1, {
        message: 'O nome do perfil é obrigatório',
      }),
      administrativo: z.boolean().default(false),
    })

    const schemaParams = z.object({
      id: z
        .string()
        .uuid({
          message: 'O id é inválido!',
        })
        .min(1, {
          message: 'O id do perfil é obrigatório',
        }),
    })

    app.put('/:id', async (req, reply) => {
      try {
        const { id } = schemaParams.parse(req.params)
        const { nome, administrativo } = schemaPerfil.parse(req.body)

        const perfilEntity = new PerfilEntity(id, nome, administrativo)

        const atualizaPerfil = await perfilEntity.atualizarPerfil(id)

        if (atualizaPerfil.status) {
          reply.status(200).send({
            status: true,
            msg: 'Dados perfil atualizado com sucesso!',
          })
        } else {
          reply.status(400).send({
            status: false,
            msg: 'Erro ao atualizar perfil',
          })
        }
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: error,
        })
      }
    })
  }

  async buscarPerfil(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string()
        .uuid({
          message: 'O id é inválido!',
        })
        .min(1, {
          message: 'O id do perfil é obrigatório',
        }),
    })

    app.get('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)

      const perfilEntity = new PerfilEntity(id)

      const perfil: PerfilEntity = await perfilEntity.buscarPerfilPorId(id)

      if (!perfil)
        return reply.status(400).send({
          status: false,
          msg: 'Perfil não encontrado',
        })

      return reply.status(200).send({
        id: perfil.getId(),
        nome: perfil.getNome(),
        administrativo: perfil.isAdministrativo(),
      })
    })
  }

  async listarPermissoesPerfil(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string()
        .uuid({
          message: 'O id é inválido!',
        })
        .min(1, {
          message: 'O id do perfil é obrigatório',
        }),
    })

    app.get('/:id/permissoes', async req => {
      const { id } = schemaParams.parse(req.params)

      const funcaoEntity = new FuncaoEntity()
      const permissoes: FuncaoInterface[] =
        await funcaoEntity.listarPermissaoFuncaoPerfil(id)

      return permissoes
    })
  }

  async excluirPerfil(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string()
        .uuid({
          message: 'O id é inválido!',
        })
        .min(1, {
          message: 'O id do perfil é obrigatório',
        }),
    })

    app.delete('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)

      const perfilEntity = new PerfilEntity(id)

      const excluiPerfil = await perfilEntity.excluirPerfil(id)

      if (excluiPerfil.status) {
        reply.status(200).send(excluiPerfil)
      } else {
        reply.status(400).send({
          status: false,
          msg: 'Erro ao excluir perfil',
        })
      }
    })
  }

  async vincularFuncao(app: FastifyInstance) {
    const schemaFuncao = z.array(
      z.object({
        idFuncao: z
          .string({
            required_error: 'Id da função é obrigatório!',
          })
          .uuid({
            message: 'Id da função é inválido!',
          }),
      })
    )

    const schemaParams = z.object({
      id: z
        .string()
        .uuid({
          message: 'O id é inválido!',
        })
        .min(1, {
          message: 'O id do perfil é obrigatório',
        }),
    })

    app.post('/:id/vincular/funcao', async (req, reply) => {
      try {
        const { id } = schemaParams.parse(req.params)
        const permissoes = schemaFuncao.parse(req.body)

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const promises: Array<any> = []

        const perfilEntity = new PerfilEntity()

        // biome-ignore lint/complexity/noForEach: <explanation>
        permissoes.forEach(permissao => {
          promises.push(
            perfilEntity.vincularPermissoesFuncaoPerfil(id, permissao.idFuncao)
          )
        })

        await Promise.all(promises)

        reply.status(201).send({
          status: true,
          msg: 'Permissões vinculados com sucesso!',
        })
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: error,
        })
      }
    })
  }

  async desvincularFuncao(app: FastifyInstance) {
    const schemaBody = z.array(
      z.object({
        idFuncao: z
          .string()
          .uuid({
            message: 'O id é inválido!',
          })
          .min(1, {
            message: 'O id do perfil é obrigatório',
          }),
      })
    )

    const schemaParams = z.object({
      id: z
        .string()
        .uuid({
          message: 'O id é inválido!',
        })
        .min(1, {
          message: 'O id do perfil é obrigatório',
        }),
    })

    app.delete('/:id/remover/funcao', async (req, reply) => {
      try {
        const { id } = schemaParams.parse(req.params)
        const permissoes = schemaBody.parse(req.body)

        const perfilEntity = new PerfilEntity()

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const promises: Array<any> = []

        // biome-ignore lint/complexity/noForEach: <explanation>
        permissoes.forEach(permissao => {
          promises.push(
            perfilEntity.desvincularPermissoesFuncaoPerfil(
              id,
              permissao.idFuncao
            )
          )
        })

        await Promise.all(promises)

        reply.status(200).send({
          status: true,
          msg: 'Permissões removidos com sucesso!',
        })
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: error,
        })
      }
    })
  }
}

export default PerfilController
