import { PrismaClient } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const prisma = new PrismaClient()

export async function clienteRoutes(app: FastifyInstance) {

  app.post('/', async (req, res) => {
    const schemaBody = z.object({
      documento: z.string().min(11, 'Documento inválido'),
      nome: z.string().min(2, 'Nome obrigatório'),
      endereco: z
        .object({
          logradouro: z.string(),
          bairro: z.string(),
          cidade: z.string(),
          estado: z.string(),
          numero: z.string(),
          complemento: z.string().optional(),
          cep: z.string(),
        })
        .optional(),

      telefones: z
        .array(
          z.object({
            numero: z.string().min(10, 'Número inválido'),
          })
        )
        .optional(),

      emails: z
        .array(
          z.object({
            email: z.string().email('E-mail inválido'),
          })
        )
        .optional(),
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente: empresa } = req.user

      const {
        documento, nome, endereco, telefones, emails
      } = await schemaBody.parseAsync(req.body)

      const pessoaClienteCriada = await prisma.pessoa.create({
        data: {
          nome,
          Endereco: endereco ? {
            create: {
              logradouro: endereco.logradouro,
              bairro: endereco.bairro,
              cidade: endereco.cidade,
              estado: endereco.estado,
              numero: endereco.numero,
              complemento: endereco.complemento,
              cep: endereco.cep,
            },
          } : undefined,
          TelefonePessoa: {
            connectOrCreate: telefones?.map(telefone => ({
              where: { numero: telefone.numero },
              create: { numero: telefone.numero },
            }))
          },
          EmailPessoa: {
            connectOrCreate: emails?.map(email => ({
              where: { email: email.email },
              create: { email: email.email },
            }))
          },
          Cliente: {
            create: {
              documento,
              empresaId: empresa,
            }
          }
        },
        include: {
          Cliente: true,
          Endereco: true,
          TelefonePessoa: true,
          EmailPessoa: true,
        },
      })

      return res.status(201).send({
        status: true,
        msg: 'Cliente cadastrado com sucesso',
        dados: {
          id: pessoaClienteCriada.Cliente?.id,
          documento: pessoaClienteCriada.Cliente?.documento,
          nome: pessoaClienteCriada.nome,
          endereco: pessoaClienteCriada.Endereco,
          telefones: pessoaClienteCriada.TelefonePessoa.map(t => t.numero),
          emails: pessoaClienteCriada.EmailPessoa.map(e => e.email),
        },
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao cadastrar cliente',
        dados: null,
        error,
      })
    }
  })

  app.get('/', async (req, res) => {
    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente: empresa } = req.user

      const clientes = await prisma.cliente.findMany({
        where: { excluido: false, empresaId: empresa },
        include: {
          pessoa: true
        },
        orderBy: {
          pessoa: {
            nome: 'asc',
          }
        },
      })

      return res.send({
        status: true,
        msg: 'Clientes encontrados',
        dados: clientes.map((cli) => ({
          id: cli.id,
          documento: cli.documento,
          nome: cli.pessoa.nome
        })),
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao listar clientes',
        dados: null,
        error,
      })
    }
  })

  app.get('/:id', async (req, res) => {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente: empresa } = req.user

      const { id } = await schemaParam.parseAsync(req.params)

      const cliente = await prisma.cliente.findUnique({
        where: { id, empresaId: empresa },
        include: {
          pessoa: {
            include: {
              Endereco: true,
              TelefonePessoa: true,
              EmailPessoa: true,
            },
          },
        },
      })
      
      if (!cliente || cliente.excluido) {
        return res.status(404).send({
          status: false,
          msg: 'Cliente não encontrado',
          dados: null,
        })
      }

      return res.send({
        status: true,
        msg: 'Cliente encontrado',
        dados: {
          documento: cliente.documento,
          pessoa: {
            id: cliente.pessoa.id,
            nome: cliente.pessoa.nome,
            endereco: cliente.pessoa.Endereco,
            emails: cliente.pessoa.EmailPessoa,
            telefones: cliente.pessoa.TelefonePessoa
          }
        },
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao buscar cliente',
        dados: null,
        error,
      })
    }
  })

  app.put('/:id', async (req, res) => {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    const schemaBody = z.object({
      documento: z.string().min(11).optional(),
      nome: z.string().min(2, 'Nome obrigatório').optional(),
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente: empresa } = req.user

      const { id } = await schemaParam.parseAsync(req.params)
      const data = await schemaBody.parseAsync(req.body)

      const cliente = await prisma.cliente.update({
        where: { id, empresaId: empresa },
        data: {
          documento: data.documento,
          pessoa: {
            update: {
              nome: data.nome,
            },
          },
        },
      })

      return res.send({
        status: true,
        msg: 'Cliente atualizado com sucesso',
        dados: cliente,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao atualizar cliente',
        dados: null,
        error,
      })
    }
  })

  app.delete('/:id', async (req, res) => {
    const schemaParam = z.object({
      id: z.string().uuid(),
    })

    try {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente: empresa } = req.user

      const { id } = await schemaParam.parseAsync(req.params)

      const cliente = await prisma.cliente.update({
        where: { id, empresaId: empresa },
        data: {
          excluido: true,
        },
      })

      return res.send({
        status: true,
        msg: 'Cliente excluído com sucesso',
        dados: cliente,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao excluir cliente',
        dados: null,
        error,
      })
    }
  })

  app.post('/:id/telefone', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente } = req.user

    const schemaBody = z.object({
      numero: z.string(),
      codigoArea: z.string(),
    })

    const schemaParams = z.object({ id: z.string().uuid() })

    const { numero, codigoArea } = await schemaBody.parseAsync(req.body)
    const { id } = await schemaParams.parseAsync(req.params)

    try {
      const dadosCliente = await prisma.cliente.findUniqueOrThrow({
        where: {
          id,
          empresaId: cliente,
        },
        select: {
          pessoaId: true,
        },
      })

      const salvaTelefone = await prisma.telefonePessoa.create({
        data: {
          pessoaId: dadosCliente.pessoaId,
          numero: `${codigoArea}${numero}`,
        },
      })

      return res.status(201).send({
        status: true,
        msg: 'Telefone adicionado com sucesso!',
        dados: salvaTelefone,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao adicionar telefone',
        error,
      })
    }
  })

  app.post('/:id/email', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente } = req.user

    const schemaBody = z.object({ email: z.string().email() })
    const schemaParams = z.object({ id: z.string().uuid() })

    const { email } = await schemaBody.parseAsync(req.body)
    const { id } = await schemaParams.parseAsync(req.params)

    try {
      const dadosCliente = await prisma.cliente.findUniqueOrThrow({
        where: {
          id,
          empresaId: cliente,
        },
        select: {
          pessoaId: true,
        },
      })

      const salvaEmail = await prisma.emailPessoa.create({
        data: {
          pessoaId: dadosCliente.pessoaId,
          email,
        },
      })

      return res.status(201).send({
        status: true,
        msg: 'Email adicionado com sucesso!',
        dados: salvaEmail,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao adicionar email',
        error,
      })
    }
  })
}
