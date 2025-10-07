import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import UsuarioEntity from '../../entities/UsuarioEntity'

class UsuarioController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.criarUsuario, {
      prefix: '/api/admin/usuarios',
    })
    fastify.register(this.editarUsuario, {
      prefix: '/api/admin/usuarios',
    })
    fastify.register(this.alterarStatus, {
      prefix: '/api/admin/usuarios',
    })
    fastify.register(this.modificarSenha, {
      prefix: '/api/admin/usuarios',
    })
    fastify.register(this.buscarDadosUsuario, {
      prefix: '/api/admin/usuarios',
    })
  }

  async criarUsuario(app: FastifyInstance) {
    const schemaUsuario = z.object({
      nome: z.string().min(1, {
        message: 'O nome é obrigatório',
      }),
      email: z
        .string({
          required_error: 'O email é obrigatório',
        })
        .email({
          message: 'O e-mail informado é inválido',
        }),
      senha: z.string().min(1, { message: 'Obrigatório informar uma senha' }),
      empresa: z
        .string({
          required_error: 'A empresa é obrigatória',
        })
        .uuid({
          message: 'A empresa informada é inválida',
        }),
      perfil: z
        .string({
          required_error: 'O perfil é obrigatório',
        })
        .uuid({
          message: 'O perfil informado é inválido',
        }),
    })

    app.post('/', async (req, reply) => {
      const { nome, email, senha, empresa, perfil } = schemaUsuario.parse(
        req.body
      )

      const usuarioEntity = new UsuarioEntity(
        undefined,
        email,
        senha,
        true,
        new Date(),
        new Date(),
        undefined,
        nome,
        perfil,
        empresa
      )

      const cadastraUsuario = await usuarioEntity.cadastrarUsuario()

      reply.code(cadastraUsuario.status ? 201 : 400).send(cadastraUsuario)
    })
  }

  async editarUsuario(app: FastifyInstance) {
    const schemaUsuario = z.object({
      nome: z.string().min(1, {
        message: 'O nome é obrigatório',
      }),
      email: z
        .string({
          required_error: 'O email é obrigatório',
        })
        .email({
          message: 'O e-mail informado é inválido',
        }),
      perfil: z
        .string({
          required_error: 'O perfil é obrigatório',
        })
        .uuid({
          message: 'O perfil informado é inválido',
        }),
    })

    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'O id do usuario é obrigatório',
        })
        .uuid({
          message: 'O id do usuario informado é inválido',
        }),
    })

    app.put('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)
      const { nome, email, perfil } = schemaUsuario.parse(req.body)

      const usuarioEntity = new UsuarioEntity(
        id,
        email,
        undefined,
        true,
        new Date(),
        new Date(),
        undefined,
        nome,
        perfil,
        undefined
      )

      const alteraUsuario = await usuarioEntity.editarUsuario(id)

      return reply.code(alteraUsuario.status ? 200 : 400).send(alteraUsuario)
    })
  }

  async alterarStatus(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'O id do usuario é obrigatório',
        })
        .uuid({
          message: 'O id do usuario informado é inválido',
        }),
    })

    const schemaStatus = z.object({
      status: z.boolean().default(true),
    })

    app.patch('/:id/status', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)
      const { status } = schemaStatus.parse(req.body)

      const usuarioEntity = new UsuarioEntity(
        id,
        undefined,
        undefined,
        status,
        new Date(),
        new Date(),
        undefined
      )

      const alteraStatus = status
        ? await usuarioEntity.ativarUsuario(id)
        : await usuarioEntity.desativarUsuario(id)

      return reply.code(alteraStatus.status ? 200 : 400).send(alteraStatus)
    })
  }

  async modificarSenha(app: FastifyInstance) {
    const schemaUsuario = z.object({
      novaSenha: z
        .string({
          required_error: 'A senha é obrigatória',
        })
        .trim()
        .min(8, {
          message: 'A senha deve conter no mínimo 8 caracteres',
        })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{8,}$/, {
          message:
            'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula e minúscula e um caracter especial',
        }),
      senhaAntiga: z
        .string({
          required_error: 'Necessário informar a senha antiga!',
        })
        .min(8, { message: 'Necessário informar a senha antiga' }),
    })

    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'O id do usuario é obrigatório',
        })
        .uuid({
          message: 'O id do usuario informado é inválido',
        }),
    })

    app.patch('/:id/senha', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)
      const { novaSenha, senhaAntiga } = schemaUsuario.parse(req.body)

      const usuarioEntity = new UsuarioEntity(
        id,
        undefined,
        novaSenha,
        true,
        new Date(),
        new Date()
      )

      const alteraSenha = await usuarioEntity.alterarSenha(id, senhaAntiga)

      return reply.code(alteraSenha.status ? 200 : 406).send(alteraSenha)
    })
  }

  async buscarDadosUsuario(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'O id do usuario é obrigatório',
        })
        .uuid({
          message: 'O id do usuario informado é inválido',
        }),
    })

    app.get('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)

      const usuarioEntity = new UsuarioEntity()

      const buscaUsuario = await usuarioEntity.recuperarDadosUsuarioPorId(id)

      if (buscaUsuario.getId() === '') {
        reply.code(404)
      } else {
        reply.code(200).send({
          usuario: {
            id: buscaUsuario.getId(),
            status: buscaUsuario.isAtivo(),
            email: buscaUsuario.getEmail(),
            perfil: buscaUsuario.getPerfilId(),
            empresa: buscaUsuario.getEmpresaId(),
          },
          pessoa: {
            nome: buscaUsuario.getNomePessoa(),
          },
        })
      }
    })
  }
}

export default UsuarioController
