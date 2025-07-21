import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  adicionarDocumentoContrato,
  atualizarContratacao,
  buscarContratacaoPorId,
  criarContratacao,
  demitirColaborador,
  listarColaboradoresPorCargo,
  listarContratacaoAtivas,
  listarContratacoes,
  listarDocumentosContrato,
  removerDocumentoContrato,
  transferirColaborador,
} from './services/ContratacaoService'

export async function ContratacaoRoutes(app: FastifyInstance) {
  
  const enderecoSchema = z.object({
    logradouro: z.string().min(1, 'Logradouro é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    estado: z.string().min(1, 'Estado é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    cep: z.string().min(8, 'CEP deve ter pelo menos 8 caracteres'),
  })

  const telefoneSchema = z.object({
    numero: z
      .string()
      .min(10, 'Número de telefone deve ter pelo menos 10 dígitos'),
  })

  const emailSchema = z.object({
    email: z.string().email('Email inválido'),
  })

  const documentoContratoSchema = z.object({
    documento: z.string().min(1, 'Nome do documento é obrigatório'),
  })

  const bodySchema = z.object({
    admitidoEm: z.string().transform(str => new Date(str)),
    cargoId: z.string().uuid('ID do cargo deve ser um UUID válido'),
    colaborador: z.object({
      documento: z
        .string()
        .min(11, 'CPF deve ter 11 dígitos')
        .max(11, 'CPF deve ter 11 dígitos'),
      pessoa: z.object({
        nome: z.string().min(1, 'Nome é obrigatório'),
        endereco: enderecoSchema.optional(),
        telefones: z.array(telefoneSchema).optional(),
        emails: z.array(emailSchema).optional(),
      }),
    }),
    documentosContrato: z.array(documentoContratoSchema).optional(),
  })

  const updateBodySchema = z.object({
    admitidoEm: z
      .string()
      .transform(str => new Date(str))
      .optional(),
    demitidoEm: z
      .string()
      .transform(str => new Date(str))
      .optional(),
    cargoId: z.string().uuid('ID do cargo deve ser um UUID válido').optional(),
    documentosContrato: z.array(documentoContratoSchema).optional(),
  })

  const paramIdSchema = z.object({
    id: z.string().uuid('ID deve ser um UUID válido'),
  })

  const querySchema = z.object({
    ativas: z
      .string()
      .optional()
      .transform(val => val === 'true'),
  })

  // Criar contratação
  app.post('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const dados = await bodySchema.parseAsync(req.body)
    const { cliente, id: usuarioId } = req.user

    try {
      await criarContratacao({
        ...dados,
        empresaId: cliente,
        usuariosId: usuarioId,
      })

      return res.status(201).send({
        status: true,
        msg: 'Contratação realizada com sucesso!',
      })
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: error.message,
      })
    }
  })

  // Listar contratações
  app.get('/', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { ativas } = await querySchema.parseAsync(req.query)
    const { cliente } = req.user

    const contratacoes = ativas
      ? await listarContratacaoAtivas(cliente)
      : await listarContratacoes(cliente)

    return res.send({
      status: true,
      dados: contratacoes.map(contratacao => ({
        id: contratacao.id,
        admitidoEm: contratacao.admitidoEm,
        demitidoEm: contratacao.demitidoEm,
        colaborador: {
          id: contratacao.colaborador.id,
          documento: contratacao.colaborador.documento,
          nome: contratacao.colaborador.pessoa.nome,
        },
        cargo: {
          id: contratacao.cargo.id,
          nome: contratacao.cargo.nome,
        },
        responsavel: {
          id: contratacao.usuario.id,
          nome: contratacao.usuario.pessoa.nome,
        },
      })),
    })
  })

  // Buscar contratação por ID
  app.get('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const contratacao = await buscarContratacaoPorId(id)

    if (!contratacao) {
      return res.status(404).send({
        status: false,
        msg: 'Contratação não encontrada',
      })
    }

    return res.send({
      status: true,
      dados: {
        id: contratacao.id,
        admitidoEm: contratacao.admitidoEm,
        demitidoEm: contratacao.demitidoEm,
        colaborador: {
          id: contratacao.colaborador.id,
          documento: contratacao.colaborador.documento,
          pessoa: {
            nome: contratacao.colaborador.pessoa.nome,
            endereco: contratacao.colaborador.pessoa.Endereco,
            telefones: contratacao.colaborador.pessoa.TelefonePessoa,
            emails: contratacao.colaborador.pessoa.EmailPessoa,
          },
        },
        cargo: {
          id: contratacao.cargo.id,
          nome: contratacao.cargo.nome,
          atribuicoes: contratacao.cargo.atribuicoes,
          superior: contratacao.cargo.superior,
          experienciaMinima: contratacao.cargo.experienciaMinima,
          escolaridadeMinima: contratacao.cargo.escolaridadeMinima,
        },
        responsavel: {
          nome: contratacao.usuario.pessoa.nome,
        },
      },
    })
  })

  // Atualizar contratação
  app.put('/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const dados = await updateBodySchema.parseAsync(req.body)

    try {
      const contratacao = await atualizarContratacao(id, dados)

      return res.send({
        status: true,
        msg: 'Contratação atualizada com sucesso!',
        dados: {
          id: contratacao.id,
          colaborador: {
            nome: contratacao.colaborador.pessoa.nome,
          },
          cargo: {
            nome: contratacao.cargo.nome,
          },
        },
      })
    } catch (error) {
      return res.status(400).send({
        status: false,
        msg: error.message,
      })
    }
  })

  // Demitir colaborador
  app.patch('/:id/demitir', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const demissaoSchema = z.object({
      dataDemissao: z.string().transform(str => new Date(str)),
    })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { dataDemissao } = await demissaoSchema.parseAsync(req.body)

    await demitirColaborador(id, dataDemissao)

    return res.send({
      status: true,
      msg: 'Colaborador demitido com sucesso!',
    })
  })

  // Transferir colaborador
  app.patch('/:id/transferir', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const transferenciaSchema = z.object({
      novoCargoId: z.string().uuid('ID do novo cargo deve ser um UUID válido'),
    })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { novoCargoId } = await transferenciaSchema.parseAsync(req.body)

    await transferirColaborador(id, novoCargoId)

    return res.send({
      status: true,
      msg: 'Colaborador transferido com sucesso!',
    })
  })

  app.get('/cargo/:cargoId/colaboradores', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cargoId } = await z
      .object({
        cargoId: z.string().uuid('ID do cargo deve ser um UUID válido'),
      })
      .parseAsync(req.params)

    const colaboradores = await listarColaboradoresPorCargo(cargoId)

    return res.send({
      status: true,
      dados: colaboradores.map(contratacao => ({
        id: contratacao.id,
        admitidoEm: contratacao.admitidoEm,
        colaborador: {
          id: contratacao.colaborador.id,
          documento: contratacao.colaborador.documento,
          nome: contratacao.colaborador.pessoa.nome,
        },
        responsavel: {
          id: contratacao.usuario.id,
          nome: contratacao.usuario.pessoa.nome,
        },
      })),
    })
  })

  // Adicionar documento ao contrato
  app.post('/:id/documentos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)
    const { documento } = await documentoContratoSchema.parseAsync(req.body)

    const novoDocumento = await adicionarDocumentoContrato(id, documento)

    return res.status(201).send({
      status: true,
      msg: 'Documento adicionado com sucesso!',
      dados: {
        id: novoDocumento.id,
        documento: novoDocumento.documento,
      },
    })
  })

  // Remover documento do contrato
  app.delete('/documentos/:documentoId', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const documentoIdSchema = z.object({
      documentoId: z.string().transform(val => Number.parseInt(val, 10)),
    })

    const { documentoId } = await documentoIdSchema.parseAsync(req.params)

    await removerDocumentoContrato(documentoId)

    return res.send({
      status: true,
      msg: 'Documento removido com sucesso!',
    })
  })

  app.get('/:id/documentos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { id } = await paramIdSchema.parseAsync(req.params)

    const documentos = await listarDocumentosContrato(id)

    return res.send({
      status: true,
      dados: documentos.map(doc => ({
        id: doc.id,
        documento: doc.documento,
      }))
    })
  })
}
