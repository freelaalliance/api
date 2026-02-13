import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import puppeteer from 'puppeteer'
import QRCode from 'qrcode'

interface EnderecoCompraPdf {
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
}

interface ItemCompraPdf {
  descricao: string
  quantidade: number
}

interface DadosCompraPdf {
  numPedido: number
  codigo: string
  permiteEntregaParcial: boolean
  prazoEntrega: Date
  condicoesEntrega: string | null
  cadastradoEm: Date
  frete: string | null
  armazenamento: string | null
  localEntrega: string | null
  formaPagamento: string | null
  imposto: string | null
  recebido: boolean
  cancelado: boolean
  usuario: string
  empresa: {
    nome: string
    documento: string
    endereco: EnderecoCompraPdf | null
  }
  fornecedor: {
    nome: string
    documento: string
  }
  itens: ItemCompraPdf[]
}

function formatarEndereco(endereco: EnderecoCompraPdf | null): string {
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

function obterStatusPedido(recebido: boolean, cancelado: boolean): string {
  if (cancelado) return '<span style="color: #dc3545;">Cancelado</span>'
  if (recebido) return '<span style="color: #28a745;">Recebido</span>'
  return '<span style="color: #ffc107;">Pendente</span>'
}

export async function gerarPdfCompraHTML(dados: DadosCompraPdf) {
  const qrCodeBase64 = await QRCode.toDataURL(String(dados.numPedido))

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
          <h2>Pedido de Compra #${dados.numPedido}</h2>
          <div class="info-pedido">
            <div><strong>Código:</strong> ${dados.codigo}</div>
            <div><strong>Data do pedido:</strong> ${format(dados.cadastradoEm, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
            <div class="status-badge"><strong>Status:</strong> ${obterStatusPedido(dados.recebido, dados.cancelado)}</div>
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
          <div class="campo"><strong>Endereço:</strong><br/>${formatarEndereco(dados.empresa.endereco)}</div>
        </div>

        <div class="section">
          <div class="section-title">Fornecedor</div>
          <div class="campo"><strong>Nome:</strong> ${dados.fornecedor.nome}</div>
          <div class="campo"><strong>Documento:</strong> ${dados.fornecedor.documento}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Itens do Pedido</div>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">#</th>
              <th>Descrição</th>
              <th style="width: 100px;">Quantidade</th>
            </tr>
          </thead>
          <tbody>
            ${dados.itens
      .map(
        (item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.descricao}</td>
                <td>${item.quantidade}</td>
              </tr>
            `
      )
      .join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Condições e Logística</div>
        <div class="grid">
          <div>
            <div class="campo"><strong>Entrega parcial:</strong> ${dados.permiteEntregaParcial ? 'Sim' : 'Não'}</div>
            <div class="campo"><strong>Prazo de entrega:</strong> ${format(dados.prazoEntrega, 'P', { locale: ptBR })}</div>
            <div class="campo"><strong>Condições de entrega:</strong> ${dados.condicoesEntrega || '—'}</div>
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
