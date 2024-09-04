/* eslint-disable no-new */
import cron from 'node-cron'

import EmpresaController from './controllers/administrativo/EmpresaController'
import PerfilController from './controllers/administrativo/PerfilController'
import UsuarioController from './controllers/administrativo/UsuarioController'
import AutenticacaoController from './controllers/auth/AutenticacaoUsuarioController'
import AutorizacaoUsuario from './controllers/auth/AutorizacaoUsuarioController'
import InstrumentosController from './controllers/calibracao/InstrumentosController'
import RelatorioCalibracaoController from './controllers/calibracao/RelatoriosCalibracaoController'
import EquipamentoController from './controllers/manutencao/EquipamentoController'
import InspecaoEquipamentoController from './controllers/manutencao/InspecaoEquipamentoController'
import ManutencaoEquipamentoController from './controllers/manutencao/ManutencaoEquipamentoController'
import Servidor from './controllers/ServerController'
import ModuloController from './controllers/sistema/ModuloController'
import { notificarVencimentoCalibracao } from './jobs/calibracao/VencimentoCalibracaoJob'

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

cron.schedule('0 2 1 * *', () => {
  notificarVencimentoCalibracao()
})

server.inicializar()
