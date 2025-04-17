import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import FuncaoEntity from '../../entities/FuncaoEntity'
import PerfilEntity from '../../entities/PerfilEntity'
import UsuarioEntity from '../../entities/UsuarioEntity'

class AutorizacaoUsuario {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.buscarDadosUsuarioAutenticado, {
      prefix: '/usuario',
    })

    fastify.register(this.buscarModulosPerfilUsuario, {
      prefix: '/usuario',
    })

    fastify.register(this.buscarPermissoesPerfilUsuario, {
      prefix: '/usuario/perfil',
    })

    fastify.register(this.verificarPermissaoFuncaoPerfil, {
      prefix: '/usuario/perfil',
    })
  }

  async buscarDadosUsuarioAutenticado(app: FastifyInstance) {
    app.get('/dados', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })

      const usuarioEntity = new UsuarioEntity()

      const dadosUsuarioAutenticado =
        await usuarioEntity.recuperarDadosUsuarioPorId(req.user.id)

      if (dadosUsuarioAutenticado.getId() !== '') {
        reply.send({
          id: dadosUsuarioAutenticado.getId(),
          nome: dadosUsuarioAutenticado.getNomePessoa(),
          email: dadosUsuarioAutenticado.getEmail(),
          perfil: dadosUsuarioAutenticado.getPerfilId(),
        })
      } else {
        reply.send()
      }
    })
  }

  async buscarModulosPerfilUsuario(app: FastifyInstance) {
    app.get('/modulos', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })

      const usuarioEntity = new UsuarioEntity()
      const dadosUsuarioAutenticado =
        await usuarioEntity.recuperarDadosUsuarioPorId(req.user.id)

      const perfilEntity = new PerfilEntity()

      const listaPermissoes = await perfilEntity.buscarModulosPerfil(
        dadosUsuarioAutenticado.getPerfilId()
      )

      reply.send(
        listaPermissoes.map(modulo => {
          return {
            idModulo: modulo.modulo.id,
            nomeModulo: modulo.modulo.nome,
            urlModulo: modulo.modulo.url,
          }
        })
      )
    })
  }

  async buscarPermissoesPerfilUsuario(app: FastifyInstance) {
    const schemaParams = z.object({
      idModulo: z
        .string({
          required_error: 'Necessário informar o id do modulo',
        })
        .uuid({
          message: 'O id do módulo é invalido',
        }),
    })

    app.get('/permissoes/modulo/:idModulo', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })

      const { idModulo } = schemaParams.parse(req.params)

      const usuarioEntity = new UsuarioEntity()
      const dadosUsuarioAutenticado =
        await usuarioEntity.recuperarDadosUsuarioPorId(req.user.id)

      const funcaoEntity = new FuncaoEntity()
      const permissoes = await funcaoEntity.listarFuncoesModuloPerfil(
        dadosUsuarioAutenticado.getPerfilId(),
        idModulo
      )

      reply.send(permissoes)
    })
  }

  async verificarPermissaoFuncaoPerfil(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da função',
        })
        .uuid({
          message: 'O id da função é inválido',
        }),
    })

    app.get('/permissao/:id', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })

      const { id } = schemaParams.parse(req.params)

      const usuarioEntity = new UsuarioEntity()
      const dadosUsuarioAutenticado =
        await usuarioEntity.recuperarDadosUsuarioPorId(req.user.id)

      const perfilEntity = new PerfilEntity()

      const verificaPermissaoPerfil =
        await perfilEntity.verificarPermissaoPerfil(
          dadosUsuarioAutenticado.getPerfilId(),
          id
        )

      if (verificaPermissaoPerfil) {
        reply.status(200).send({
          status: true,
          msg: 'Perfil com permissão de acesso!',
        })
      } else {
        reply.status(401).send({
          status: true,
          msg: 'Perfil não tem permissão de acesso',
        })
      }
    })
  }
}

export default AutorizacaoUsuario
