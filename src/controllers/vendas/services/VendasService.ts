import { format } from "date-fns"
import { ptBR } from 'date-fns/locale'
import puppeteer from "puppeteer"
import QRCode from 'qrcode'
import { prisma } from "../../../services/PrismaClientService"
import { formatarValorMoeda } from "../utils/NumeroUtil"

interface ItemVenda {
  produtosServicosId: string
  quantidade: number
}

interface NovaVendaParams {
  permiteEntregaParcial: boolean
  prazoEntrega: Date
  condicoes?: string | null
  codigo: string
  numPedido: number
  clienteId: string
  usuarioId: string
  empresaId: string
  frete?: string
  armazenamento?: string
  localEntrega?: string
  formaPagamento?: string
  imposto?: string
  itens: ItemVenda[]
}

export async function criarVenda({
  permiteEntregaParcial,
  prazoEntrega,
  condicoes,
  codigo,
  numPedido,
  clienteId,
  usuarioId,
  empresaId,
  frete,
  armazenamento,
  localEntrega,
  formaPagamento,
  imposto,
  itens,
}: NovaVendaParams) {
  const vendaCriada = await prisma.venda.create({
    data: {
      permiteEntregaParcial,
      prazoEntrega,
      condicoes,
      codigo,
      numPedido,
      frete,
      armazenamento,
      localEntrega,
      formaPagamento,
      imposto,
      clientesId: clienteId,
      usuariosId: usuarioId,
      empresasId: empresaId,
      itensVenda: {
        createMany: {
          data: itens.map((item) => ({
            produtosServicosId: item.produtosServicosId,
            quantidade: item.quantidade,
          })),
        },
      },
    },
  })

  return vendaCriada
}

export async function cancelarVenda(vendaId: string, empresaId: string) {
  const venda = await prisma.venda.updateMany({
    where: {
      id: vendaId,
      empresasId: empresaId,
      cancelado: false,
    },
    data: {
      cancelado: true,
    },
  })

  return venda
}

export async function buscarVendaPorClienteId(clienteId: string, empresaId: string) {
  const venda = await prisma.venda.findMany({
    where: {
      clientesId: clienteId,
      empresasId: empresaId,
    },
    include: {
      expedicoes: true,
      usuario: {
        include: {
          pessoa: true,
        },
      },
      cliente: {
        include: {
          pessoa: true,
        },
      },
      itensVenda: {
        include: {
          produtoServico: true,
        },
      },
    },
    orderBy: {
      cadastradoEm: 'desc',
    }
  })

  return venda
}

export async function buscarVendaPorEmpresa(empresaId: string) {
  const venda = await prisma.venda.findMany({
    where: {
      empresasId: empresaId,
    },
    include: {
      expedicoes: true,
      usuario: {
        include: {
          pessoa: true,
        },
      },
      cliente: {
        include: {
          pessoa: true,
        },
      },
      itensVenda: {
        include: {
          produtoServico: true,
        },
      },
    },
    orderBy: {
      cadastradoEm: 'desc',
    }
  })

  return venda
}

export async function buscarVendaPorId(vendaId: string, empresaId: string) {
  const venda = await prisma.venda.findUniqueOrThrow({
    where: { id: vendaId, cancelado: false, empresasId: empresaId },
    include: {
      usuario: {
        include: {
          pessoa: true,
        },
      },
      empresa: {
        include: {
          pessoa: {
            include: {
              Endereco: true,
            },
          },
        },
      },
      cliente: {
        include: {
          pessoa: {
            include: {
              EmailPessoa: true,
              Endereco: true,
              TelefonePessoa: true,
            }
          },
        },
      },
      itensVenda: {
        include: {
          produtoServico: true,
        },
      },
    },
  })

  if (!venda) {
    throw new Error('Venda não encontrada')
  }

  const itens = venda.itensVenda.map((item) => ({
    nome: item.produtoServico.nome,
    descricao: item.produtoServico.descricao,
    quantidade: item.quantidade,
    precoUnitario: Number(item.produtoServico.preco),
    totalItem: (Number(item.produtoServico.preco) * Number(item.quantidade)) as number,
  }))

  const total = itens.reduce(
    (acc, item) => acc + item.totalItem,
    0
  )

  return {
    codigoVenda: venda.codigo,
    numeroVenda: venda.numPedido,
    entregaParcial: venda.permiteEntregaParcial,
    prazoEntrega: venda.prazoEntrega,
    condicoes: venda.condicoes,
    frete: venda.frete,
    armazenamento: venda.armazenamento,
    localEntrega: venda.localEntrega,
    formaPagamento: venda.formaPagamento,
    imposto: venda.imposto,
    expedido: venda.expedido,
    cancelado: venda.cancelado,
    dataVenda: venda.cadastradoEm,
    usuario: venda.usuario.pessoa.nome,
    empresa: {
      nome: venda.empresa.pessoa.nome,
      documento: venda.empresa.cnpj,
      endereco: venda.empresa.pessoa.Endereco
        ? {
          logradouro: venda.empresa.pessoa.Endereco.logradouro,
          numero: venda.empresa.pessoa.Endereco.numero,
          complemento: venda.empresa.pessoa.Endereco.complemento,
          bairro: venda.empresa.pessoa.Endereco.bairro,
          cidade: venda.empresa.pessoa.Endereco.cidade,
          estado: venda.empresa.pessoa.Endereco.estado,
          cep: venda.empresa.pessoa.Endereco.cep,
        }
        : null,
    },
    cliente: {
      nome: venda.cliente.pessoa.nome,
      documento: venda.cliente.documento,
      observacoes: venda.cliente.observacoes,
      endereco: venda.cliente.pessoa.Endereco,
    },
    itens,
    total,
  }
}

interface EnderecoVendaPdf {
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
}

interface ItemVendaPdf {
  nome: string
  descricao: string
  quantidade: number
  precoUnitario: number
  totalItem: number
}

interface DadosVendaPdf {
  numeroVenda: number
  codigoVenda: string
  permiteEntregaParcial: boolean
  prazoEntrega: Date
  condicoes: string | null
  dataVenda: Date
  frete: string | null
  armazenamento: string | null
  localEntrega: string | null
  formaPagamento: string | null
  imposto: string | null
  expedido: boolean
  cancelado: boolean | null
  usuario: string
  empresa: {
    nome: string
    documento: string
    endereco: EnderecoVendaPdf | null
  }
  cliente: {
    nome: string
    documento: string
    observacoes: string | null
  }
  itens: ItemVendaPdf[]
  total: number
}

function formatarEnderecoVenda(endereco: EnderecoVendaPdf | null): string {
  if (!endereco) return 'Endereço não informado'

  const partes = [
    endereco.logradouro,
    endereco.numero ? `, ${endereco.numero}` : '',
    endereco.complemento ? ` - ${endereco.complemento}` : '',
  ].join('')

  const partes2 = [
    endereco.bairro,
    endereco.cidade ? `, ${endereco.cidade}` : '',
    endereco.estado ? ` - ${endereco.estado}` : '',
  ].join('')

  const cep = endereco.cep ? `CEP: ${endereco.cep}` : ''

  return `${partes}<br/>${partes2}<br/>${cep}`
}

function obterStatusVenda(expedido: boolean, cancelado: boolean | null): string {
  if (cancelado) return '<span style="color: #dc3545;">Cancelado</span>'
  if (expedido) return '<span style="color: #28a745;">Expedido</span>'
  return '<span style="color: #ffc107;">Pendente</span>'
}

export async function gerarPdfVendaHTML(dados: DadosVendaPdf) {

  const qrCodeBase64 = await QRCode.toDataURL(String(dados.numeroVenda))

  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 30px;
          font-size: 13px;
          color: #333;
        }
        h2, h3 { margin: 0 0 8px 0; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          border-bottom: 2px solid #333;
          padding-bottom: 16px;
        }
        .header-info { flex: 1; }
        .info-pedido { font-size: 13px; margin-top: 8px; }
        .info-pedido div { margin-bottom: 4px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #f5f5f5;
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        .section {
          margin-top: 20px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
          border-bottom: 1px solid #eee;
          padding-bottom: 4px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .campo { margin-bottom: 6px; }
        .campo strong { color: #555; }
        .status-badge {
          font-weight: bold;
          font-size: 14px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #999;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-info">
          <h2>Pedido de Venda #${dados.numeroVenda}</h2>
          <div class="info-pedido">
            <div><strong>Código:</strong> ${dados.codigoVenda}</div>
            <div><strong>Data da venda:</strong> ${format(dados.dataVenda, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
            <div class="status-badge"><strong>Status:</strong> ${obterStatusVenda(dados.expedido, dados.cancelado)}</div>
          </div>
        </div>
        <div>
          <img src="${qrCodeBase64}" alt="QR Code" width="130" height="130" />
        </div>
      </div>

      <div class="grid">
        <div class="section">
          <div class="section-title">Empresa</div>
          <div class="campo"><strong>Nome:</strong> ${dados.empresa.nome}</div>
          <div class="campo"><strong>CNPJ:</strong> ${dados.empresa.documento}</div>
          <div class="campo"><strong>Endereço:</strong><br/>${formatarEnderecoVenda(dados.empresa.endereco)}</div>
        </div>

        <div class="section">
          <div class="section-title">Cliente</div>
          <div class="campo"><strong>Nome:</strong> ${dados.cliente.nome}</div>
          <div class="campo"><strong>Documento:</strong> ${dados.cliente.documento}</div>
          <div class="campo"><strong>Observações:</strong> ${dados.cliente.observacoes ?? '—'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Itens da Venda</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Nome</th>
              <th style="width: 80px;">Qtd.</th>
              <th style="width: 120px;">Preço Unit.</th>
              <th style="width: 120px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${dados.itens
      .map(
        (item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.nome}</td>
                <td>${item.quantidade}</td>
                <td>${formatarValorMoeda(item.precoUnitario)}</td>
                <td>${formatarValorMoeda(item.totalItem)}</td>
              </tr>
            `
      )
      .join('')}
            <tr>
              <td colspan="4" style="text-align: right;"><strong>Total Geral</strong></td>
              <td><strong>${formatarValorMoeda(dados.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Condições e Logística</div>
        <div class="grid">
          <div>
            <div class="campo"><strong>Entrega parcial:</strong> ${dados.permiteEntregaParcial ? 'Sim' : 'Não'}</div>
            <div class="campo"><strong>Prazo de entrega:</strong> ${format(dados.prazoEntrega, 'P', { locale: ptBR })}</div>
            <div class="campo"><strong>Condições:</strong> ${dados.condicoes || '—'}</div>
            <div class="campo"><strong>Local de entrega:</strong> ${dados.localEntrega || '—'}</div>
          </div>
          <div>
            <div class="campo"><strong>Frete:</strong> ${dados.frete || '—'}</div>
            <div class="campo"><strong>Armazenamento:</strong> ${dados.armazenamento || '—'}</div>
            <div class="campo"><strong>Forma de pagamento:</strong> ${dados.formaPagamento || '—'}</div>
            <div class="campo"><strong>Imposto:</strong> ${dados.imposto || '—'}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} por ${dados.usuario}
      </div>
    </body>
  </html>
`

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  })
  const page = await browser.newPage()
  await page.setContent(html)
  const pdf = await page.pdf({ format: 'A4' })
  await browser.close()

  return pdf
}

export async function buscarVendasPendente(empresaId: string) {
  const venda = await prisma.venda.findMany({
    where: {
      expedicoes: {
        none: {}
      },
      empresasId: empresaId,
    },
    include: {
      expedicoes: true,
      usuario: {
        include: {
          pessoa: true,
        },
      },
      cliente: {
        include: {
          pessoa: true,
        },
      },
      itensVenda: {
        include: {
          produtoServico: true,
        },
      },
    },
    orderBy: {
      cadastradoEm: 'desc',
    }
  })

  return venda
}
