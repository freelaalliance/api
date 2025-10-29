import type { FastifyInstance } from 'fastify';
import { listarCategoriasDocumentoEmpresa } from '../../repositories/Documentos/CategoriaRepository';

export class CategoriasDocumentosController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.listarCategoriasDocumentoEmpresa, { prefix: '/documentos/categorias' })
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
