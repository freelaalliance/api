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
  itens,
}: NovaVendaParams) {
  const vendaCriada = await prisma.venda.create({
    data: {
      permiteEntregaParcial,
      prazoEntrega,
      condicoes,
      codigo,
      numPedido,
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

export async function buscarVendaPorId(vendaId: string, empresaId: string) {
  const venda = await prisma.venda.findUniqueOrThrow({
    where: { id: vendaId, cancelado: false, empresasId: empresaId },
    include: {
      usuario: {
        include: {
          pessoa: true,
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
    dataVenda: venda.cadastradoEm,
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

export async function gerarPdfVendaHTML(dados: {
  codigoVenda: string;
  numeroVenda: number
  entregaParcial: boolean;
  prazoEntrega: Date;
  condicoes: string | null;
  dataVenda: Date;
  cliente: {
    nome: string;
    documento: string;
    observacoes: string | null;
    endereco: {
      numero: string;
      logradouro: string;
      complemento: string | null;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      id: string;
      atualizadoEm: Date;
      criadoEm: Date;
      pessoaId: string;
      excluido: boolean;
    } | null;
  };
  itens: {
    nome: string;
    descricao: string;
    quantidade: number;
    precoUnitario: number;
    totalItem: number;
  }[];
  total: number;
}) {

  const qrCodeBase64 = await QRCode.toDataURL(dados.codigoVenda)

  const html = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { margin: 0; }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .info-venda {
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .section {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2>Detalhes da Venda #${dados.numeroVenda}</h2>
          <div class="info-venda">
            <strong>Código:</strong> ${dados.codigoVenda}<br/>
            <strong>Data da venda:</strong> ${format(dados.dataVenda, 'Pp', { locale: ptBR })}
          </div>
        </div>
        <div>
          <img src="${qrCodeBase64}" alt="QR Code" width="150" height="150" />
        </div>
      </div>

      <div class="section">
        <h3>Cliente</h3>
        <div><strong>Nome:</strong> ${dados.cliente.nome}</div>
        <div><strong>Documento:</strong> ${dados.cliente.documento}</div>
        <div><strong>Observações:</strong> ${dados.cliente.observacoes ?? 'Nenhuma informação disponível'}</div>
      </div>

      <div class="section">
        <h3>Endereço</h3>
           <div>
             ${dados.cliente.endereco?.logradouro}, ${dados.cliente.endereco?.numero}<br/>
             ${dados.cliente.endereco?.bairro}, ${dados.cliente.endereco?.cidade} - ${dados.cliente.endereco?.estado}<br/>
             CEP: ${dados.cliente.endereco?.cep}
           </div>
      </div>

      <div class="section">
        <h3>Itens da Venda</h3>
        <table>
            <thead>
              <tr><th>#</th><th>Nome</th><th>Qtd.</th><th>Preço</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${dados.itens.map((item, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${item.nome}</td>
                  <td>${item.quantidade}</td>
                  <td>${formatarValorMoeda(item.precoUnitario)}</td>
                  <td>${(formatarValorMoeda(item.precoUnitario * item.quantidade))}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="4"><strong>Total Geral</strong></td>
                <td><strong>R$ ${formatarValorMoeda(dados.total)}</strong></td>
              </tr>
            </tbody>
          </table>
      </div>

      <div class="section">
        <h3>Complementos</h3>
        <div><strong>Entrega parcial:</strong> ${dados.entregaParcial ? 'Sim' : 'Não'}</div>
        <div><strong>Prazo de entrega:</strong> ${format(dados.prazoEntrega, 'P', { locale: ptBR })}</div>
        <div><strong>Observações:</strong> ${dados.condicoes || '—'}</div>
      </div>
    </body>
  </html>
`;

  const browser = await puppeteer.launch({
    headless: 'shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/chromium-browser',
  });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdf;
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
