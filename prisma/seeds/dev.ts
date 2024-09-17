import bcrypt from 'bcrypt'

import { prisma } from '../../src/services/PrismaClientService'

async function seed() {
  const criaEmpresa = prisma.empresa.create({
    data: {
      id: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      cnpj: '16755495000107',
      pessoa: {
        create: {
          nome: 'Empresa Dev',
          Endereco: {
            create: {
              logradouro: 'Rua Teste',
              numero: '123',
              bairro: 'Bairro Teste',
              cidade: 'Cidade Teste',
              estado: 'SP',
              cep: '12345-678',
              complemento: 'Complemento Teste',
            },
          },
        },
      },
    },
  })

  const criaPerfil = prisma.perfil.create({
    data: {
      id: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
      nome: 'Administrador',
      administrativo: true,
      empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
    },
  })

  const pessoaUsuario = prisma.pessoa.create({
    data: {
      id: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4',
      nome: 'Usuario Dev',
    },
  })

  const criaUsuario = prisma.usuario.create({
    data: {
      id: '58e52268-445e-4c01-b8d9-d84d9a07f811',
      email: 'teste@example.com',
      senha: bcrypt.hashSync('mudar@123', 8),
      ativo: true,
      perfilId: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
      empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      pessoaId: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4',
    },
  })

  const criaModulosApp = prisma.modulo.createMany({
    data: [
      {
        id: '61f07c1a-053f-46a7-b74a-73718f78cf87',
        nome: 'Administrativo',
        url: '/modulo/administrativo/empresa',
      },
      {
        id: 'bdd37c9e-e8a3-4df6-8a79-f86db4b3d57f',
        nome: 'Calibração',
        url: '/modulo/calibracao/painel',
      },
      {
        id: '0b917870-1142-4703-983c-475564b05527',
        nome: 'Manutenção',
        url: '/modulo/manutencao',
      },
      {
        id: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
        nome: 'Compras',
        url: '/modulo/compras/[id]/painel',
      },
    ],
  })

  const criaFuncoesModulo = prisma.funcao.createMany({
    data: [
      {
        id: '169db97c-ba8a-4f8b-b2e8-82d44849c9e8',
        nome: 'Empresas',
        moduloId: '61f07c1a-053f-46a7-b74a-73718f78cf87',
        url: '/modulo/administrativo/empresa',
      },
      {
        id: '96a32115-7a12-4768-9276-493268379751',
        nome: 'Painel',
        moduloId: 'bdd37c9e-e8a3-4df6-8a79-f86db4b3d57f',
        url: '/modulo/calibracao/painel',
      },
      {
        id: '2c07f0c1-6b1b-4915-9d37-aacba2771e95',
        nome: 'Equipamentos',
        moduloId: '0b917870-1142-4703-983c-475564b05527',
        url: '/modulo/manutencao',
      },
      {
        id: 'b100168b-d945-4fe2-ade6-7c4fbe2f2f16',
        nome: 'Painel',
        moduloId: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
        url: '/modulo/compras/[id]/painel',
      },
      {
        id: 'fe8dcd57-938b-45c6-a9f9-eed4b2a42db2',
        nome: 'Fornecedores',
        moduloId: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
        url: '/modulo/compras/[id]/fornecedor',
      },
      {
        id: '56d21fe0-38c0-415a-b7c8-eeeb06fbb64b',
        nome: 'Pedidos',
        moduloId: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
        url: '/modulo/compras/[id]/pedido',
      },
      {
        id: '5eaa6870-0d41-40b3-977f-f842bd0ea17b',
        nome: 'Recebimentos',
        moduloId: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
        url: '/modulo/compras/[id]/recebimento',
      },
    ],
  })

  const vinculaModulosEmpresa = prisma.moduloEmpresa.createMany({
    data: [
      {
        moduloId: '61f07c1a-053f-46a7-b74a-73718f78cf87',
        empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      },
      {
        moduloId: 'bdd37c9e-e8a3-4df6-8a79-f86db4b3d57f',
        empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      },
      {
        moduloId: '0b917870-1142-4703-983c-475564b05527',
        empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      },
      {
        moduloId: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
        empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      },
    ],
  })

  const vinculaFuncoesModuloPerfilUsuario = prisma.perfilPermissaFuncao.create({
    data: {
      perfilId: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
      funcaoId: '169db97c-ba8a-4f8b-b2e8-82d44849c9e8',
    },
  })

  await prisma.$transaction([
    criaEmpresa,
    criaPerfil,
    pessoaUsuario,
    criaUsuario,
    criaModulosApp,
    criaFuncoesModulo,
    vinculaModulosEmpresa,
    vinculaFuncoesModuloPerfilUsuario,
  ])
}

seed()
  .catch((error) => {
    console.error('Erro ao executar seed:', error)
    process.exit(1)
  })
  .then(() => {
    console.log('Seed realizado com sucesso!')
  })
