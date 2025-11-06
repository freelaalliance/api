/* eslint-disable no-new */
import cron from 'node-cron'

import Servidor from './controllers/ServerController'
import { AdministradorCalibracaoController } from './controllers/administrativo/CalibracaoController'
import { AdministradorComprasAdminController } from './controllers/administrativo/ComprasAdminController'
import { AdministradorComprasController } from './controllers/administrativo/ComprasController'
import { AdministradorDocumentosController } from './controllers/administrativo/DocumentosController'
import EmpresaController from './controllers/administrativo/EmpresaController'
import { AdministradorExpedicaoController } from './controllers/administrativo/ExpedicaoController'
import { AdministradorManutencaoController } from './controllers/administrativo/ManutencaoController'
import PerfilController from './controllers/administrativo/PerfilController'
import { AdministradorRecebimentosController } from './controllers/administrativo/RecebimentosController'
import { AdministradorRhController } from './controllers/administrativo/RhController'
import UsuarioController from './controllers/administrativo/UsuarioController'
import { AdministradorVendasController } from './controllers/administrativo/VendasController'
import AutenticacaoController from './controllers/auth/AutenticacaoUsuarioController'
import AutorizacaoUsuario from './controllers/auth/AutorizacaoUsuarioController'
import InstrumentosController from './controllers/calibracao/InstrumentosController'
import RelatorioCalibracaoController from './controllers/calibracao/RelatoriosCalibracaoController'
import ComprasController from './controllers/compras/Compras'
import FornecedorController from './controllers/compras/Fornecedor'
import RelatorioComprasController from './controllers/compras/Relatorio'
import { CategoriasDocumentosController } from './controllers/documentos/categorias'
import { DocumentosController } from './controllers/documentos/documentos'
import EquipamentoController from './controllers/manutencao/EquipamentoController'
import InspecaoEquipamentoController from './controllers/manutencao/InspecaoEquipamentoController'
import ManutencaoEquipamentoController from './controllers/manutencao/ManutencaoEquipamentoController'
import { emailRoutes } from './controllers/pessoa/EmailServicoController'
import { enderecoRoutes } from './controllers/pessoa/EnderecoServicoController'
import { telefoneRoutes } from './controllers/pessoa/TelefoneServicoController'
import { AnalyticsRhRoutes } from './controllers/rh/AnalyticsRhController'
import { CargosRoutes } from './controllers/rh/CargosController'
import { ContratacaoRoutes } from './controllers/rh/ContratacaoController'
import { TreinamentosColaboradorRoutes } from './controllers/rh/TreinamentoContratacoesController'
import { TreinamentosRoutes } from './controllers/rh/TreinamentosController'
import ModuloController from './controllers/sistema/ModuloController'
import { itensAvaliacaoExpedicaoRoutes } from './controllers/vendas/AvaliacaoExpedicaoServicoController'
import { clienteRoutes } from './controllers/vendas/ClientesServicoController'
import { expedicaoRoutes } from './controllers/vendas/ExpedicaoServicoController'
import { produtoServicoRoutes } from './controllers/vendas/ProdutoServicoController'
import { vendasRoutes } from './controllers/vendas/VendaServicoController'
import { notificarVencimentoCalibracao } from './jobs/calibracao/VencimentoCalibracaoJob'
import { itensAvaliacaoAdminExpedicaoRoutes } from './controllers/administrativo/ExpedicaoServicoController'

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
new AdministradorCalibracaoController(server.servico)
new AdministradorComprasAdminController(server.servico)
new AdministradorRecebimentosController(server.servico)
new AdministradorExpedicaoController(server.servico)
new AdministradorManutencaoController(server.servico)
new AdministradorRhController(server.servico)
new AdministradorVendasController(server.servico)
new AdministradorDocumentosController(server.servico)

server.servico.register(vendasRoutes)
server.servico.register(produtoServicoRoutes)
server.servico.register(expedicaoRoutes,
  { prefix: '/vendas/expedicao' })
server.servico.register(clienteRoutes,
  { prefix: '/pessoa/clientes', })
server.servico.register(itensAvaliacaoExpedicaoRoutes,
  { prefix: '/admin/vendas/expedicao', })
server.servico.register(itensAvaliacaoAdminExpedicaoRoutes,
  { prefix: '/api/admin/vendas/expedicao', })
server.servico.register(enderecoRoutes,
  { prefix: '/pessoa' })
server.servico.register(emailRoutes,
  { prefix: '/pessoa' })
server.servico.register(telefoneRoutes,
  { prefix: '/pessoa' })

server.servico.register(TreinamentosRoutes,
  { prefix: '/rh/treinamentos' },
)

server.servico.register(CargosRoutes,
  { prefix: '/rh/cargos' },
)

server.servico.register(TreinamentosColaboradorRoutes,
  { prefix: '/rh/contrato/treinamentos' },
)

server.servico.register(ContratacaoRoutes,
  { prefix: '/rh/contratacoes' },
)

server.servico.register(AnalyticsRhRoutes,
  { prefix: '/rh' },
)

cron.schedule('0 2 1 * *', () =>
  notificarVencimentoCalibracao())

server.inicializar()
