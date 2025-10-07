import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  adicionarTreinamentoCargo,
  atualizarCargo,
  buscarCargoPorId,
  criarCargo,
  excluirCargo,
  listarCargosEmpresa,
  listarColaboradoresAtivosCargo,
  listarTreinamentosCargo,
  removerTreinamentoCargo
} from './services/CargosService'

const reqUserSchema = z.object({
  id: z.string().uuid(),
  cliente: z.string().uuid(),
})

export async function CargosRoutes(app: FastifyInstance) {
  const bodySchema = z.object({
    nome: z.string().min(1, 'Nome do cargo é obrigatório'),
    atribuicoes: z.string().min(1, 'Atribuições são obrigatórias'),
    superior: z.boolean().default(false),
    experienciaMinima: z.string().min(1, 'Experiência mínima é obrigatória'),
    escolaridadeMinima: z.string().min(1, 'Escolaridade mínima é obrigatória'),
    treinamentos: z.array(
      z.object({
        id: z.string().uuid('ID do treinamento deve ser um UUID válido')
      })
    ).optional().default([])
  })

  const updateBodySchema = z.object({
    nome: z.string().min(1, 'Nome do cargo é obrigatório'),
    atribuicoes: z.string().min(1, 'Atribuições são obrigatórias'),
    superior: z.boolean().optional(),
    experienciaMinima: z.string().min(1, 'Experiência mínima é obrigatória').optional(),
    escolaridadeMinima: z.string().min(1, 'Escolaridade mínima é obrigatória').optional(),
    treinamentos: z.array(
      z.object({
        id: z.string().uuid('ID do treinamento deve ser um UUID válido')
      })
    ).optional()
  })

  const paramIdSchema = z.object({
    id: z.string().uuid('ID deve ser um UUID válido')
  })

  // Criar cargo
  app.post('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { nome, atribuicoes, superior, experienciaMinima, escolaridadeMinima, treinamentos } =
      await bodySchema.parseAsync(req.body)

    const { cliente } = await reqUserSchema.parseAsync(req.user)

    await criarCargo({
      nome,
      atribuicoes,
      superior,
      experienciaMinima,
      escolaridadeMinima,
      empresasId: cliente,
      treinamentos
    })

    return res.status(201).send({
      status: true,
      msg: 'Cargo criado com sucesso!',
    })
  })

  // Listar cargos da empresa
  app.get('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente } = await reqUserSchema.parseAsync(req.user)

    const cargos = await listarCargosEmpresa(cliente)

    return res.send({
      status: true,
      dados: cargos.map(cargo => ({
        id: cargo.id,
        nome: cargo.nome,
        atribuicoes: cargo.atribuicoes,
        superior: cargo.superior,
        experienciaMinima: cargo.experienciaMinima,
        escolaridadeMinima: cargo.escolaridadeMinima,
        treinamentos: cargo.treinamentosIntegracaoCargos.map(t => ({
          id: t.treinamento.id,
          nome: t.treinamento.nome
        }))
      }))
    })
  })

  // Buscar cargo por ID
  app.get('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const cargo = await buscarCargoPorId(id)

    if (!cargo) {
      return res.status(404).send({
        status: false,
        msg: 'Cargo não encontrado'
      })
    }

    return res.send({
      status: true,
      dados: {
        id: cargo.id,
        nome: cargo.nome,
        atribuicoes: cargo.atribuicoes,
        superior: cargo.superior,
        experienciaMinima: cargo.experienciaMinima,
        escolaridadeMinima: cargo.escolaridadeMinima,
        treinamentos: cargo.treinamentosIntegracaoCargos.map(t => ({
          id: t.treinamento.id,
          nome: t.treinamento.nome,
          tipo: t.treinamento.tipo
        }))
      }
    })
  })

  // Atualizar cargo
  app.put('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const dados = await updateBodySchema.parseAsync(req.body)

    await atualizarCargo(id, dados)

    return res.send({
      status: true,
      msg: 'Cargo atualizado com sucesso!',
    })
  })

  // Excluir cargo
  app.delete('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    try {
      await excluirCargo(id)

      return res.send({
        status: true,
        msg: 'Cargo excluído com sucesso!'
      })
    } catch (error: unknown) {
      return res.status(400).send({
        status: false,
        msg: (error as Error).message
      })
    }
  })

  // Listar treinamentos do cargo
  app.get('/:id/treinamentos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const cargo = await listarTreinamentosCargo(id)

    if (!cargo) {
      return res.status(404).send({
        status: false,
        msg: 'Cargo não encontrado'
      })
    }

    return res.send({
      status: true,
      dados: cargo.treinamentosIntegracaoCargos.map(t => ({
        id: t.treinamento.id,
        nome: t.treinamento.nome,
        tipo: t.treinamento.tipo
      }))
    })
  })

  // Adicionar treinamento ao cargo
  app.post('/:id/treinamentos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const treinamentoBodySchema = z.object({
      treinamentoId: z.string().uuid('ID do treinamento deve ser um UUID válido')
    })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { treinamentoId } = await treinamentoBodySchema.parseAsync(req.body)

    try {
      await adicionarTreinamentoCargo(id, treinamentoId)

      return res.status(201).send({
        status: true,
        msg: 'Treinamento adicionado ao cargo com sucesso!',
      })
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: (error as Error).message
      })
    }
  })

  // Remover treinamento do cargo
  app.delete('/:id/treinamentos/:treinamentoId', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const paramsSchema = z.object({
      id: z.string().uuid('ID do cargo deve ser um UUID válido'),
      treinamentoId: z.string().uuid('ID do treinamento deve ser um UUID válido')
    })

    const { id, treinamentoId } = await paramsSchema.parseAsync(req.params)

    await removerTreinamentoCargo(id, treinamentoId)

    return res.send({
      status: true,
      msg: 'Treinamento removido do cargo com sucesso!'
    })
  })

  // Listar colaboradores ativos do cargo
  app.get('/:id/colaboradores', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const colaboradores = await listarColaboradoresAtivosCargo(id)

    return res.send({
      status: true,
      dados: colaboradores.map(contratacao => ({
        id: contratacao.id,
        admitidoEm: contratacao.admitidoEm,
        colaborador: {
          id: contratacao.colaborador.id,
          documento: contratacao.colaborador.documento,
          nome: contratacao.colaborador.pessoa.nome,
          telefones: contratacao.colaborador.pessoa.TelefonePessoa,
          emails: contratacao.colaborador.pessoa.EmailPessoa,
          endereco: contratacao.colaborador.pessoa.Endereco
        },
        treinamentosRealizados: contratacao.treinamentosRealizados.map(tr => ({
          id: tr.id,
          iniciadoEm: tr.iniciadoEm,
          finalizadoEm: tr.finalizadoEm,
          certificado: tr.certificado,
          treinamento: {
            id: tr.treinamento.id,
            nome: tr.treinamento.nome,
            tipo: tr.treinamento.tipo
          }
        }))
      }))
    })
  })
}