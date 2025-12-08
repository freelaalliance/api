import type { FastifyReply, FastifyRequest } from 'fastify'

export async function verificarPermissaoAdmin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Verifica o token JWT no cookie sessionAdmin
    const payload = await request.jwtVerify<{
      id: string
      cliente: string
      isAdmin: boolean
    }>({ onlyCookie: true })

    console.log('Payload do token:', payload)

    // Verifica se o usuário tem permissão administrativa
    if (!payload.isAdmin) {
      return reply.code(403).send({
        status: false,
        msg: 'Acesso negado. Permissões administrativas necessárias.',
      })
    }

    // Usuário autenticado e com permissões de admin
    return
  } catch (error) {
    return reply.code(401).send({
      status: false,
      msg: 'Não autorizado. Token inválido ou expirado.',
    })
  }
}
