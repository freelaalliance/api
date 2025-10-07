import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import FuncaoEntity from '../../entities/FuncaoEntity'
import ModuloEntity from '../../entities/ModuloEntity'

class ModuloController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.criarModulo, {
      prefix: '/modulo',
    })

    fastify.register(this.atualizarModulo, {
      prefix: '/modulo',
    })

    fastify.register(this.listarModulos, {
      prefix: '/api/modulo',
    })

    fastify.register(this.buscarModulo, {
      prefix: '/modulo',
    })

    fastify.register(this.buscarFuncao, {
      prefix: '/funcao',
    })

    fastify.register(this.listarFuncoesModulo, {
      prefix: '/api/modulo',
    })

    fastify.register(this.adicionarFuncaoModulo, {
      prefix: '/modulo',
    })
  }

  async criarModulo(app: FastifyInstance) {
    const schemaModulo = z.object({
      nome: z.string().min(1, {
        message: 'O nome do modulo é obrigatório',
      }),
      url: z.string({
        required_error: 'Necessário informar a url do modulo',
      }),
      funcoes: z.array(
        z.object({
          nome: z.string().min(1, {
            message: 'O nome da função é obrigatório',
          }),
          url: z.string({
            required_error: 'Necessário informar a url da função',
          }),
        })
      ),
    })

    app.post('/', async (req, reply) => {
      const { nome, url, funcoes } = schemaModulo.parse(req.body)

      const moduloEntity = new ModuloEntity(undefined, nome, url)

      const salvaModulo = await moduloEntity.cadastrarModulo()

      if (!salvaModulo.status) return reply.code(500).send(salvaModulo)

      const funcaoEntity = new FuncaoEntity()

      // biome-ignore lint/complexity/noForEach: <explanation>
      funcoes.forEach(async funcao => {
        funcaoEntity.setNomeFuncao(funcao.nome)
        funcaoEntity.setUrlFuncao(funcao.url)
        funcaoEntity.setIdModulo(salvaModulo.msg)

        const salvaFuncao = await funcaoEntity.cadastrarFuncao()

        if (!salvaFuncao.status) return reply.code(500).send(salvaFuncao)
      })

      reply.code(201)
    })
  }

  async atualizarModulo(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do modulo',
        })
        .uuid({ message: 'O id do modulo é inválido!' }),
    })

    const schemaModulo = z.object({
      nome: z.string().min(1, {
        message: 'O nome do modulo é obrigatório',
      }),
      url: z
        .string({
          required_error: 'Necessário informar a url do modulo',
        })
        .url({
          message: 'A url do modulo é inválido',
        }),
    })

    app.put('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)
      const { nome, url } = schemaModulo.parse(req.body)

      const moduloEntity = new ModuloEntity(id, nome, url)

      const modificaModulo = await moduloEntity.atualizarModulo(id)

      if (!modificaModulo.status) return reply.code(500).send(modificaModulo)

      reply.code(200)
    })
  }

  async atualizarFuncao(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da função',
        })
        .uuid({ message: 'O id da função é inválido!' }),
    })

    const schemaFuncao = z.object({
      nome: z.string().min(1, {
        message: 'O nome da função é obrigatório',
      }),
      url: z
        .string({
          required_error: 'Necessário informar a url da função',
        })
        .url({
          message: 'A url da função é inválido',
        }),
    })

    app.put('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)
      const { nome, url } = schemaFuncao.parse(req.body)

      const funcaoEntity = new FuncaoEntity(id, nome, url)

      const modificaFuncao = await funcaoEntity.atualizarFuncao(id)

      if (!modificaFuncao.status) return reply.code(500).send(modificaFuncao)

      reply.code(200)
    })
  }

  async listarModulos(app: FastifyInstance) {
    app.get('/all', async () => {
      const moduloEntity = new ModuloEntity()
      const listaModulos = await moduloEntity.consultarTodosModulos()

      return listaModulos.map(modulo => {
        return {
          id: modulo.getIdModulo(),
          nome: modulo.getNomeModulo(),
          url: modulo.getUrlModulo(),
        }
      })
    })
  }

  async listarFuncoesModulo(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do modulo',
        })
        .uuid({ message: 'O id do modulo é inválido!' }),
    })

    app.get('/:id/funcoes', async req => {
      const { id } = schemaParams.parse(req.params)

      const funcaoEntity = new FuncaoEntity()
      const listaFuncoesModulo = await funcaoEntity.listarFuncaoModulo(id)

      return listaFuncoesModulo.map(funcao => {
        return {
          id: funcao.getIdFuncao(),
          nome: funcao.getNomeFuncao(),
          url: funcao.getUrlFuncao(),
        }
      })
    })
  }

  async buscarModulo(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do modulo',
        })
        .uuid({ message: 'O id do modulo é inválido!' }),
    })

    app.get('/:id', async req => {
      const { id } = schemaParams.parse(req.params)

      const moduloEntity = new ModuloEntity()
      const dadosModulo = await moduloEntity.consultarModulo(id)

      return {
        id: dadosModulo.getIdModulo(),
        nome: dadosModulo.getNomeModulo(),
        url: dadosModulo.getUrlModulo(),
      }
    })
  }

  async buscarFuncao(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da função',
        })
        .uuid({ message: 'O id da função é inválido!' }),
    })

    app.get('/:id', async req => {
      const { id } = schemaParams.parse(req.params)

      const funcaoEntity = new FuncaoEntity()
      const dadosFuncao = await funcaoEntity.buscarFuncao(id)

      return {
        id: dadosFuncao.getIdFuncao(),
        nome: dadosFuncao.getNomeFuncao(),
        url: dadosFuncao.getUrlFuncao(),
        idModulo: dadosFuncao.getIdModulo(),
      }
    })
  }

  async adicionarFuncaoModulo(app: FastifyInstance) {
    const schemaFuncaoModulo = z.object({
      nome: z.string().min(1, {
        message: 'O nome da função é obrigatório',
      }),
      url: z.string({
        required_error: 'Necessário informar a url da função',
      }),
    })

    const schemaParamModulo = z.object({
      id: z
        .string({
          required_error: 'Obrigatório informar o id do módulo',
        })
        .uuid({
          message: 'Id do módulo inválido',
        }),
    })

    app.post('/:id/funcao', async (req, reply) => {
      const { id } = await schemaParamModulo.parseAsync(req.params)
      const { nome, url } = await schemaFuncaoModulo.parseAsync(req.body)

      const funcaoEntity = new FuncaoEntity()

      funcaoEntity.setNomeFuncao(nome)
      funcaoEntity.setUrlFuncao(url)
      funcaoEntity.setIdModulo(id)

      const salvaFuncao = await funcaoEntity.cadastrarFuncao()

      return reply.status(201).send(salvaFuncao)
    })
  }
}

export default ModuloController
