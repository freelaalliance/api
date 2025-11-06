import fastifyCookie, { type FastifyCookieOptions } from '@fastify/cookie'
import cors from '@fastify/cors'
import fastifyJwt, { type FastifyJWTOptions } from '@fastify/jwt'
import fastify, { type FastifyInstance } from 'fastify'

import type { AutenticacaoUsuarioType } from '../entities/Autenticacao'

class Servidor {
  public servico: FastifyInstance
  private host: string
  private port: number

  constructor(host: string, port: number) {
    this.host = host
    this.port = port

    this.servico = fastify({
      logger: false,
      bodyLimit: 30 * 1024 * 1024,
    })

    this.servico.register(cors, {
      origin: true,
      credentials: true,
    })

    this.servico.register(fastifyCookie, {
      secret: process.env.ENV_COOKIE_SECRET,
      hook: 'onRequest',
    } as FastifyCookieOptions)

    this.servico.register(fastifyJwt, {
      formatUser: (sessaoUsuario: AutenticacaoUsuarioType) => {
        return {
          id: sessaoUsuario.id,
          cliente: sessaoUsuario.cliente
        }
      },
      secret: process.env.ENV_JWT_SECRET,
      cookie: {
        cookieName: 'sessionUser',
        signed: false,
      },
      messages: {
        badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
        badCookieRequestErrorMessage: 'Cookie could not be parsed in request',
        noAuthorizationInHeaderMessage:
          'No Authorization was found in request.headers',
        noAuthorizationInCookieMessage:
          'No Authorization was found in request.cookies',
        authorizationTokenExpiredMessage: 'Authorization token expired',
        authorizationTokenUntrusted: 'Untrusted authorization token',
        authorizationTokenUnsigned: 'Unsigned authorization token',
        // for the below message you can pass a sync function that must return a string as shown or a string
        authorizationTokenInvalid: err => {
          return `Authorization token is invalid: ${err.message}`
        },
      },
    } as FastifyJWTOptions)
  }

  inicializar() {
    this.servico
      .listen({
        host: this.host,
        port: this.port,
      })
      .then(() => {
        console.log(`🚀 Servidor online na porta: ${this.port}`)
      })
      .catch((error: string) => {
        console.log(`🪲 Erro ao inicializar o servidor: ${error}`)
        process.exit(1)
      })
  }
}
export default Servidor
