/* eslint-disable no-new */
import cron from 'node-cron'

import EmpresaController from './controllers/administrativo/EmpresaController'
import PerfilController from './controllers/administrativo/PerfilController'
import UsuarioController from './controllers/administrativo/UsuarioController'
import AutenticacaoController from './controllers/auth/AutenticacaoUsuarioController'
import AutorizacaoUsuario from './controllers/auth/AutorizacaoUsuarioController'
import InstrumentosController from './controllers/calibracao/InstrumentosController'
import RelatorioCalibracaoController from './controllers/calibracao/RelatoriosCalibracaoController'
import ComprasController from './controllers/compras/Compras'
import FornecedorController from './controllers/compras/Fornecedor'
import RelatorioComprasController from './controllers/compras/Relatorio'
import EquipamentoController from './controllers/manutencao/EquipamentoController'
import InspecaoEquipamentoController from './controllers/manutencao/InspecaoEquipamentoController'
import ManutencaoEquipamentoController from './controllers/manutencao/ManutencaoEquipamentoController'
import Servidor from './controllers/ServerController'
import ModuloController from './controllers/sistema/ModuloController'
import { notificarVencimentoCalibracao } from './jobs/calibracao/VencimentoCalibracaoJob'
import { AdministradorComprasController } from './controllers/administrativo/ComprasController'
import { CategoriasDocumentosController } from './controllers/documentos/categorias'
import { DocumentosController } from './controllers/documentos/documentos'
import { vendasRoutes } from './controllers/vendas/VendaServicoController'
import { produtoServicoRoutes } from './controllers/vendas/ProdutoServicoController'
import { expedicaoRoutes } from './controllers/vendas/ExpedicaoServicoController'
import { clienteRoutes } from './controllers/vendas/ClientesServicoController'
import { itensAvaliacaoExpedicaoRoutes } from './controllers/vendas/AvaliacaoExpedicaoServicoController'
import { enderecoRoutes } from './controllers/pessoa/EnderecoServicoController'
import { emailRoutes } from './controllers/pessoa/EmailServicoController'
import { telefoneRoutes } from './controllers/pessoa/TelefoneServicoController'

const server = new Servidor(
  process.env.ENV_HOST_SERVER || '0.0.0.0',
  Number(process.env.ENV_PORT_SERVER) || 3333,
)

new AutenticacaoController(server.servico)
new AutorizacaoUsuario(server.servico)
new EmpresaController(server.servico)
new PerfilController(server.servico)
new UsuarioController(server.servico)
new ModuloController(server.servico)
new InstrumentosController(server.servico)
new RelatorioCalibracaoController(server.servico)
new EquipamentoController(server.servico)
new InspecaoEquipamentoController(server.servico)
new ManutencaoEquipamentoController(server.servico)
new FornecedorController(server.servico)
new ComprasController(server.servico)
new RelatorioComprasController(server.servico)
new AdministradorComprasController(server.servico)
new CategoriasDocumentosController(server.servico)
new DocumentosController(server.servico)

server.servico.register(vendasRoutes)
server.servico.register(produtoServicoRoutes)
server.servico.register(expedicaoRoutes, {
  prefix: '/vendas/expedicao'
})
server.servico.register(clienteRoutes, {
  prefix: '/pessoa/clientes',
})
server.servico.register(itensAvaliacaoExpedicaoRoutes, {
  prefix: '/admin/vendas/expedicao',
})
server.servico.register(enderecoRoutes, {
  prefix: '/pessoa'
})
server.servico.register(emailRoutes, {
  prefix: '/pessoa'
})
server.servico.register(telefoneRoutes, {
  prefix: '/pessoa'
})

cron.schedule('0 2 1 * *', () => {
  notificarVencimentoCalibracao()
})

server.inicializar()
