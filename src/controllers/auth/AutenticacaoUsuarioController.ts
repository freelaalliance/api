import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import Autenticacao from '../../entities/Autenticacao'
import AutenticacaoAdmin from '../../entities/AutenticacaoAdmin'

class AutenticacaoController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.login, {
      prefix: 'usuario',
    })

    fastify.register(this.logout, {
      prefix: 'usuario',
    })

    fastify.register(this.loginAdmin, {
      prefix: 'api/admin',
    })

    fastify.register(this.logoutAdmin, {
      prefix: 'api/admin',
    })
  }

  private async login(app: FastifyInstance) {
    const schemaLogin = z.object({
      email: z.string({
        required_error: 'Necessário informar o email',
      }),
      senha: z.string({
        required_error: 'Necessário informar a senha',
      }),
    })

    app.post('/login', async (req, reply) => {
      const { email, senha } = schemaLogin.parse(req.body)

      const autenticacaoClass = new Autenticacao(email, senha)

      const autentica = await autenticacaoClass.autenticar()

      if (autentica.status && autentica.payload) {
        try {
          const tokenJWT = await reply.jwtSign(autentica.payload)

          reply
            .setCookie('sessionUser', tokenJWT, {
              path: '/',
              maxAge: 60 * 60 * 24 * 1,
              domain: process.env.ENV_DOMAIN,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            })
            .send({
              status: true,
              msg: 'Usuário autenticado',
            })
        } catch {
          reply.code(500).send()
        }
      } else {
        reply.code(401).send({
          status: false,
          msg: autentica.msg,
        })
      }
    })
  }

  private async logout(app: FastifyInstance) {
    app.post('/logout', async (_req, reply) => {
      try {
        reply.clearCookie('sessionUser', {
          path: '/',
          domain: process.env.ENV_DOMAIN,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })

        return reply.status(200).send({
          status: true,
          msg: 'Logout realizado com sucesso',
        })
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao realizar logout',
        })
      }
    })
  }

  private async loginAdmin(app: FastifyInstance) {
    const schemaLogin = z.object({
      email: z.string({
        required_error: 'Necessário informar o email',
      }).email({
        message: 'Email inválido',
      }),
      senha: z.string({
        required_error: 'Necessário informar a senha',
      }),
    })

    app.post('/login', async (req, reply) => {
      const { email, senha } = schemaLogin.parse(req.body)

      const autenticacaoAdmin = new AutenticacaoAdmin(email, senha)

      const autentica = await autenticacaoAdmin.autenticar()

      if (autentica.status && autentica.payload) {
        try {
          const tokenJWT = await reply.jwtSign(autentica.payload)

          reply
            .setCookie('sessionAdmin', tokenJWT, {
              path: '/',
              maxAge: 60 * 60 * 24 * 1,
              domain: process.env.ENV_DOMAIN,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            })
            .send({
              status: true,
              msg: 'Administrador autenticado com sucesso',
            })
        } catch (error) {
          reply.code(500).send({
            status: false,
            msg: 'Erro ao gerar token de autenticação',
          })
        }
      } else {
        reply.code(401).send({
          status: false,
          msg: autentica.msg,
        })
      }
    })
  }

  private async logoutAdmin(app: FastifyInstance) {
    app.post('/logout', async (_req, reply) => {
      try {
        reply.clearCookie('sessionAdmin', {
          path: '/',
          domain: process.env.ENV_DOMAIN,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })

        return reply.status(200).send({
          status: true,
          msg: 'Logout administrativo realizado com sucesso',
        })
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao realizar logout',
        })
      }
    })
  }
}

export default AutenticacaoController
