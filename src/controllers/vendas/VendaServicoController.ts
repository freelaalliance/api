import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'
import { getNumeroPedido } from '../compras/utils/CompraUtil'
import { buscarVendaPorClienteId, buscarVendaPorId, buscarVendasPendente, cancelarVenda, criarVenda, gerarPdfVendaHTML } from './services/VendasService'

export const emailPessoaSchema = z.object({
  email: z.string().email(),
})

export const telefonePessoaSchema = z.object({
  numero: z.string().min(8).max(12),
})

export const enderecoSchema = z.object({
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string().nullable().optional(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string(),
  cep: z.string(),
})

export const PessoaSchema = z.object({
  nome: z.string(),
  Endereco: enderecoSchema,
  TelefonePessoa: z.array(telefonePessoaSchema),
  EmailPessoa: z.array(emailPessoaSchema),
})

const ProdutoServicoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string(),
  tipo: z.enum(['PRODUTO', 'SERVICO']),
  preco: z.coerce.number(),
})

const ItemVendaSchema = z.object({
  quantidade: z.number(),
  produtoServico: ProdutoServicoSchema,
})

const ClienteSchema = z.object({
  id: z.string(),
  documento: z.string(),
  observacoes: z.string().nullable(),
  pessoa: PessoaSchema,
})

const VendaDetalhadaSchema = z.object({
  id: z.string(),
  numPedido: z.coerce.number(),
  codigo: z.string(),
  condicoes: z.string().nullable(),
  permiteEntregaParcial: z.boolean(),
  prazoEntrega: z.coerce.date(),
  cliente: ClienteSchema,
  itensVenda: z.array(ItemVendaSchema),
  cadastradoEm: z.coerce.date()
})


export async function vendasRoutes(app: FastifyInstance) {
  app.post('/vendas/cliente/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const schemaParam = z.object({
      id: z.string().uuid(),
    })
    const schemaBody = z.object({
      itens: z
        .array(
          z.object({
            produtosServicosId: z.string().uuid(),
            quantidade: z.number().min(1)
          })
        )
        .min(1, { message: 'É necessário pelo menos um item' }),
      condicoes: z.string().optional().nullable(),
      permiteEntregaParcial: z.boolean().default(false),
      prazoEntrega: z.coerce.date({
        required_error: 'Obrigatório informar o prazo de entrega',
      }),
      codigo: z.string()
    })

    try {
      const { id: clienteId } = await schemaParam.parseAsync(req.params)
      const { itens, condicoes, codigo, permiteEntregaParcial, prazoEntrega } = await schemaBody.parseAsync(
        req.body
      )
      const { id: usuarioId, cliente: empresaId } = req.user

      const numPedido = getNumeroPedido()
      const codigoVenda = `${codigo}-${numPedido}`

      const venda = await criarVenda({
        clienteId,
        empresaId,
        usuarioId,
        prazoEntrega,
        permiteEntregaParcial,
        itens,
        codigo: codigoVenda.toUpperCase(),
        numPedido,
        condicoes
      })

      return res.status(201).send({
        status: true,
        msg: 'Venda criada com sucesso!',
        dados: venda,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao criar venda',
        error,
      })
    }
  })

  app.get('/vendas/cliente/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    try {
      const { id } = await schemaParams.parseAsync(req.params)
      const { cliente: empresaId } = req.user

      const vendas = await buscarVendaPorClienteId(id, empresaId)

      if (!vendas) {
        return res.status(404).send({
          status: false,
          msg: 'Venda não encontrada',
        })
      }

      return res.status(200).send({
        status: true,
        dados: vendas.map((venda) => ({
          id: venda.id,
          codigo: venda.codigo,
          numeroPedido: venda.numPedido,
          dataCadastro: venda.cadastradoEm,
          usuario: venda.usuario.pessoa.nome,
          prazoEntrega: venda.prazoEntrega,
          permiteEntregaParcial: venda.permiteEntregaParcial,
          condicoes: venda.condicoes,
          expedido: venda.expedido,
          qtdExpedicoes: venda.expedicoes.length
        })),
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao consultar venda',
        error,
      })
    }
  })

  app.get('/vendas/:id/cliente', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = await schemaParams.parseAsync(req.params)
    const { cliente: empresa } = req.user;

    if (empresa) {
      const venda = await prisma.venda.findUnique({
        where: {
          id,
          empresasId: empresa,
          cancelado: false
        },
        include: {
          cliente: {
            include: {
              pessoa: {
                include: {
                  EmailPessoa: true,
                  Endereco: true,
                  TelefonePessoa: true
                }
              }
            }
          },
          itensVenda: {
            include: {
              produtoServico: true
            }
          },
        },
      });

      if (!venda) {
        return res.status(404).send({ status: false, msg: 'Venda não encontrada' });
      }

      return res.send({ status: true, dados: VendaDetalhadaSchema.parse(venda) });
    }

    return res.status(401).send({
      status: false,
      msg: 'Usuario não autenticado'
    })

  });


  app.delete('/vendas/:id', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    try {
      const { id } = await schemaParams.parseAsync(req.params)
      const { cliente: empresaId } = req.user

      const cancelada = await cancelarVenda(id, empresaId)

      return res.status(200).send({
        status: true,
        msg: 'Venda cancelada com sucesso!',
        dados: cancelada,
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao cancelar venda',
        error,
      })
    }
  })

  app.get('/vendas/:id/pdf', async (req, res) => {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user

    const { id: vendaId } = await schemaParams.parseAsync(req.params)

    const venda = await buscarVendaPorId(vendaId, empresaId)

    const pdfVenda = await gerarPdfVendaHTML(venda)

    res.header('Content-Type', 'application/pdf');
    res.header(
      'Content-Disposition',
      `attachment; filename="venda-${vendaId}.pdf"`
    );
    res.send(pdfVenda);
  })

  app.get('/estatisticas/vendas/cliente-top', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente: empresaId } = req.user

    const topCliente = await prisma.venda.groupBy({
      by: ['clientesId'],
      where: {
        empresasId: empresaId,
        cancelado: false,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          cadastradoEm: 'desc',
        },
      },
      take: 1,
    })

    if (topCliente.length === 0) {
      return res.send({
        status: true,
        msg: 'Nenhuma venda encontrada',
        dados: null,
      })
    }

    const clienteDetalhes = await prisma.cliente.findUnique({
      where: { id: topCliente[0].clientesId },
      include: {
        pessoa: true,
      },
    })

    return res.send({
      status: true,
      msg: 'Cliente com mais vendas',
      dados: {
        totalVendas: topCliente[0]._count._all,
        cliente: clienteDetalhes?.pessoa.nome,
      },
    })
  })

  app.get('/estatisticas/vendas/produto-top', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    const { cliente: empresaId } = req.user

    const topProduto = await prisma.itensVenda.groupBy({
      by: ['produtosServicosId'],
      where: {
        venda: {
          empresasId: empresaId,
          cancelado: false,
        },
      },
      _sum: {
        quantidade: true,
      },
      orderBy: {
        _sum: {
          quantidade: 'desc',
        },
      },
      take: 1,
    })

    if (topProduto.length === 0) {
      return res.send({
        status: true,
        msg: 'Nenhuma venda encontrada',
        dados: null,
      })
    }

    const produto = await prisma.produtoServico.findUnique({
      where: { id: topProduto[0].produtosServicosId },
    })

    return res.send({
      status: true,
      msg: 'Produto ou serviço mais vendido',
      dados: {
        totalVendido: topProduto[0]._sum.quantidade,
        nome: produto?.nome,
      },
    })
  })

  app.get('/estatisticas/empresa/clientes', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user
    const totalClientes = await prisma.cliente.count({ where: { empresaId, excluido: false } })
    return res.send({ status: true, dados: { totalClientes } })
  })

  app.get('/estatisticas/empresa/produtos', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })
    const { cliente: empresaId } = req.user
    const totalProdutos = await prisma.produtoServico.count({ where: { empresaId } })
    return res.send({ status: true, dados: { totalProdutos } })
  })

  app.get('/vendas/pendentes/expedicao', async (req, res) => {
    await req.jwtVerify({ onlyCookie: true })

    try {
      const { cliente: empresaId } = req.user

      const vendas = await buscarVendasPendente(empresaId)

      if (!vendas) {
        return res.status(404).send({
          status: false,
          msg: 'Venda não encontrada',
        })
      }

      return res.status(200).send({
        status: true,
        dados: vendas.map((venda) => ({
          id: venda.id,
          codigo: venda.codigo,
          numeroPedido: venda.numPedido,
          dataCadastro: venda.cadastradoEm,
          usuario: venda.usuario.pessoa.nome,
          prazoEntrega: venda.prazoEntrega,
          permiteEntregaParcial: venda.permiteEntregaParcial,
          condicoes: venda.condicoes,
          expedido: venda.expedido,
          qtdExpedicoes: venda.expedicoes.length
        })),
      })
    } catch (error) {
      return res.status(500).send({
        status: false,
        msg: 'Erro ao consultar venda',
        error,
      })
    }
  })
}
