import type { FastifyInstance } from 'fastify'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
import { z } from 'zod'
import { prisma } from '../../services/PrismaClientService'
import { getNumeroPedido } from '../compras/utils/CompraUtil'
import { buscarVendaPorClienteId, buscarVendaPorId, cancelarVenda, criarVenda } from './services/VendasService'

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
      observacao: z.string().optional().nullable(),
      permiteEntregaParcial: z.boolean().default(false),
      prazoEntrega: z.coerce.date({
        required_error: 'Obrigatório informar o prazo de entrega',
      }),
      codigo: z.string()
    })

    try {
      const { id: clienteId } = await schemaParam.parseAsync(req.params)
      const { itens, observacao, codigo, permiteEntregaParcial, prazoEntrega } = await schemaBody.parseAsync(
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
        condicoes: observacao
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
          usuario: venda.usuario.pessoa.nome,
          prazoEntrega: venda.prazoEntrega,
          permiteEntregaParcial: venda.permiteEntregaParcial,
          condicoes: venda.condicoes,
          itens: venda.itensVenda.map((item) => ({
            produtoServicoId: item.produtoServico.id,
            quantidade: item.quantidade,
            precoUnitario: item.produtoServico.preco,
            totalItem: (Number(item.produtoServico.preco) * Number(item.quantidade)),
          })),
          observacao: venda.condicoes
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

    // Cria PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const drawText = (text: string, x: number, y: number, size = 12) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      })
    }

    let cursorY = 760

    drawText(`Venda: ${venda.codigoVenda}`, 50, cursorY)
    cursorY -= 20

    drawText(`Cliente: ${venda.cliente.nome}`, 50, cursorY)
    cursorY -= 20
    drawText(`Documento: ${venda.cliente.documento}`, 50, cursorY)
    cursorY -= 20
    drawText(`E-mail: ${venda.cliente.email}`, 50, cursorY)
    cursorY -= 40

    drawText('Itens:', 50, cursorY)
    cursorY -= 20

    for (const item of venda.itens) {
      drawText(
        `- ${item.descricao} (${item.quantidade} x R$ ${item.precoUnitario.toFixed(2)})`,
        60,
        cursorY
      )
      cursorY -= 20
    }

    cursorY -= 10
    drawText(`Total: R$ ${venda.total.toFixed(2)}`, 50, cursorY)
    cursorY -= 60

    // Gera QR Code
    const qrCodeBase64 = await QRCode.toDataURL(venda.codigoVenda)
    const qrImageBytes = Buffer.from(qrCodeBase64.split(',')[1], 'base64')
    const qrImage = await pdfDoc.embedPng(qrImageBytes)
    const qrDims = qrImage.scale(0.5)

    page.drawImage(qrImage, {
      x: 400,
      y: cursorY,
      width: qrDims.width,
      height: qrDims.height,
    })

    const pdfBytes = await pdfDoc.save()

    res
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="venda-${vendaId}.pdf"`)
      .send(Buffer.from(pdfBytes))
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
        cliente: clienteDetalhes,
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
        produto,
      },
    })
  })
}
