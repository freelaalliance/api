import { FastifyInstance } from 'fastify'
import { z } from 'zod'

import Autenticacao from '../../entities/Autenticacao'

class AutenticacaoController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.login, {
      prefix: 'usuario',
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
              domain: 'alliancequality.net',
              secure: false,
              sameSite: true,
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
}

export default AutenticacaoController
