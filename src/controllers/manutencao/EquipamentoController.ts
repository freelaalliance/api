import { FastifyInstance } from "fastify"
import {
  consultarAgendaEquipamento,
  inserirNovoEquipamento,
  inserirPecaEquipamento,
  listarEquipamentosEmpresa,
  listarPecasEquipamento,
  modificarDadosEquipamento,
  modificarPecaEquipamento,
  removerEquipamento,
  removerPecaEquipamento
} from "../../repositories/Manutencao/EquipamentoRepository"

import { z } from "zod"

class EquipamentoController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.criarEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.equipamentosEmpresa, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.pecasEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.atualizarEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.adicionarPecaEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.atualizarPecaEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.excluirPecaEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.excluirEquipamento, {
      prefix: '/equipamento'
    })

    fastifyInstance.register(this.buscarAgendaEquipamento, {
      prefix: '/equipamento'
    })
  }

  async criarEquipamento(app: FastifyInstance) {
    const schemaBody = z.object({
      codigo: z.string(),
      nome: z.string(),
      especificacao: z.string().optional(),
      frequencia: z.coerce.number().default(0),
      pecas: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional()
      }))
    })

    app.post('/', async (req, res) => {
      await req.jwtVerify()
      const {
        codigo,
        nome,
        especificacao,
        frequencia,
        pecas
      } = await schemaBody.parseAsync(req.body)

      const { cliente } = req.user
      const salvaEquipamento = await inserirNovoEquipamento({
        codigo,
        nome,
        especificacao,
        frequencia,
        empresaId: cliente,
        pecas
      })

      if (salvaEquipamento) {
        res.status(201).send(salvaEquipamento)
      }

      res.status(500)
    })
  }

  async equipamentosEmpresa(app: FastifyInstance) {
    app.get('/todos', async (req, res) => {
      await req.jwtVerify()
      const { cliente } = req.user

      const equipamentos = await listarEquipamentosEmpresa({
        empresaId: cliente
      })

      res.status(200).send(equipamentos)
    })
  }

  async pecasEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'O id do equipamento é obrigatório',
        })
        .uuid({
          message: 'Id do equipamento é inválido!',
        }),
    })

    app.get('/:id/pecas', async (req, res) => {
      await req.jwtVerify()
      const { id } = await schemaParams.parseAsync(req.params)
      const { cliente } = req.user

      const pecas = await listarPecasEquipamento({
        id,
        empresaId: cliente
      })

      res.status(200).send(pecas)
    })
  }

  async atualizarEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do equipamento',
        })
        .uuid({
          message: 'Id do equipamento é inválido!',
        }),
    })

    const schemaBody = z.object({
      nome: z.string().optional(),
      codigo: z.string().optional(),
      especificacao: z.string().optional(),
      frequencia: z.number().optional(),
    })

    app.put('/:id', async (req, res) => {
      await req.jwtVerify()
      const { id } = await schemaParams.parseAsync(req.params)
      const { cliente } = req.user
      const {
        nome,
        codigo,
        especificacao,
        frequencia
      } = await schemaBody.parseAsync(req.body)

      const equipamento = await modificarDadosEquipamento({
        id,
        nome,
        codigo,
        especificacao,
        frequencia,
        empresaId: cliente
      })

      res.status(200).send(equipamento)
    })
  }

  async atualizarPecaEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      idEquipamento: z
        .string({
          required_error: 'Necessário informar o id do equipamento',
        })
        .uuid({
          message: 'Id do equipamento é inválido!',
        }),
      idPeca: z
        .string({
          required_error: 'Necessário informar o id da peça',
        })
        .uuid({
          message: 'Id da peça é inválido!',
        }),
    })

    const schemaBody = z.object({
      nome: z.string(),
      descricao: z.string().optional(),
    })

    app.put('/:idEquipamento/peca/:idPeca', async (req, res) => {
      const { idEquipamento, idPeca } = await schemaParams.parseAsync(req.params)
      const { nome, descricao } = await schemaBody.parseAsync(req.body)

      const atualizaDadosPeca = await modificarPecaEquipamento({
        id: idPeca,
        descricao,
        nome,
        equipamentoId: idEquipamento
      })

      res.status(200).send(atualizaDadosPeca)
    })
  }

  async adicionarPecaEquipamento(app: FastifyInstance) {
    
    const schemaBody = z.object({
      pecas: z.array(z.object({
        nome: z.string(),
        descricao: z.string().optional(),
        equipamentoId: z.string()
      }))
    })

    app.post('/pecas', async (req, res) => {
      const { pecas } = await schemaBody.parseAsync(req.body)

      const novaPeca = await inserirPecaEquipamento(pecas)

      res.status(201).send(novaPeca)
    })
  }

  async excluirPecaEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da peça',
        })
        .uuid({
          message: 'Id da peça é inválido!',
        }),
    })

    app.delete('/peca/:id', async (req, res) => {
      await req.jwtVerify()
      const { id } = await schemaParams.parseAsync(req.params)

      const { cliente } = req.user

      await removerPecaEquipamento({
        id,
        empresaId: cliente
      })

      res.status(204).send()
    })
  }

  async excluirEquipamento(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'O id do equipamento é obrigatório',
        })
        .uuid({
          message: 'Id do equipamento é inválido!',
        }),
    })

    app.delete('/:id', async (req, res) => {
      await req.jwtVerify()
      const { id } = await schemaParams.parseAsync(req.params)

      const { cliente } = req.user

      await removerEquipamento({
        id,
        empresaId: cliente
      })

      res.status(204).send()
    })
  }

  async buscarAgendaEquipamento(app: FastifyInstance){
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id do equipamento',
        })
        .uuid({
          message: 'Id do equipamento é inválido!',
        }),
    })

    app.get('/:id/agenda', async (req, res) => {
      await req.jwtVerify()
      const { id } = await schemaParams.parseAsync(req.params)
      const { cliente } = req.user

      const agendaEquipamento = await consultarAgendaEquipamento({
        id,
        empresaId: cliente
      })

      res.status(200).send(agendaEquipamento)
    })
  }
}

export default EquipamentoController