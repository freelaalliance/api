import bcrypt from 'bcrypt'

import { prisma } from '../../src/services/PrismaClientService'

async function seed() {
  const criaEmpresa = prisma.empresa.upsert({
    where: { id: '00c99ee1-eccf-4d71-88fa-2e1d2c085867' },
    update: {
      cnpj: '16755495000107',
      pessoa: {
        update: {
          nome: 'Alliance',
          Endereco: {
            upsert: {
              create: {
                logradouro: 'Rua Teste',
                numero: '123',
                bairro: 'Bairro Teste',
                cidade: 'Cidade Teste',
                estado: 'SP',
                cep: '12345-678',
                complemento: 'Complemento Teste',
              },
              update: {
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
    },
    create: {
      id: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      cnpj: '16755495000107',
      pessoa: {
        create: {
          nome: 'Alliance',
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

  const criaPerfil = prisma.perfil.upsert({
    where: { id: '477140dc-efa9-460b-8178-9d9bbe7ed0c5' },
    update: {
      nome: 'Administrador',
      administrativo: true,
      empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
    },
    create: {
      id: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
      nome: 'Administrador',
      administrativo: true,
      empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
    },
  })

  const pessoaUsuario = prisma.pessoa.upsert({
    where: { id: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4' },
    update: {
      nome: 'Usuario Alliance',
    },
    create: {
      id: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4',
      nome: 'Usuario Alliance',
    },
  })

  const criaUsuario = prisma.usuario.upsert({
    where: { id: '58e52268-445e-4c01-b8d9-d84d9a07f811' },
    update: {
      email: 'alliance@alliance.net',
      senha: bcrypt.hashSync('mudar@123', 8),
      ativo: true,
      perfilId: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
      empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      pessoaId: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4',
    },
    create: {
      id: '58e52268-445e-4c01-b8d9-d84d9a07f811',
      email: 'alliance@alliance.net',
      senha: bcrypt.hashSync('mudar@123', 8),
      ativo: true,
      perfilId: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
      empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
      pessoaId: '1cb25fa9-bacf-498d-b1e4-be4fd8c4a9b4',
    },
  })

  const modulosData = [
    {
      id: 'bdd37c9e-e8a3-4df6-8a79-f86db4b3d57f',
      nome: 'Calibração',
      url: '/modulo/calibracao/painel',
    },
    {
      id: '0b917870-1142-4703-983c-475564b05527',
      nome: 'Manutenção',
      url: '/modulo/manutencao/[id]',
    },
    {
      id: '267bcd33-55fe-4c04-ba24-c88f1c35f224',
      nome: 'Compras',
      url: '/modulo/compras/[id]/painel',
    },
    {
      id: '5974b902-728f-4a4d-8df4-a787e91e101d',
      nome: 'Documentos',
      url: '/modulo/documentos/[id]/painel',
    },
    {
      id: '572a442d-2a51-4b40-a401-4299b0b94869',
      nome: 'Expedição',
      url: '/modulo/expedicao/[id]/painel',
    },
    {
      id: '69b6e9cd-5036-4988-9d39-e2536655513e',
      nome: 'Recebimentos',
      url: '/modulo/recebimentos/[id]/painel',
    },
    {
      id: '47c1c557-3d20-4bb7-9241-5a27de229994',
      nome: 'RH',
      url: '/modulo/rh/[id]/painel',
    },
    {
      id: '6944a9cb-fb02-4b00-9566-ddd05a1c1c44',
      nome: 'Vendas',
      url: '/modulo/vendas/[id]/painel',
    },
  ]

  const criaModulosApp = modulosData.map((modulo) =>
    prisma.modulo.upsert({
      where: { id: modulo.id },
      update: {
        nome: modulo.nome,
        url: modulo.url,
      },
      create: modulo,
    })
  )

  const funcoesData = [
    {
      id: '96a32115-7a12-4768-9276-493268379751',
      nome: 'Painel',
      moduloId: 'bdd37c9e-e8a3-4df6-8a79-f86db4b3d57f',
      url: '/modulo/calibracao/painel',
    },
    {
      id: '2c07f0c1-6b1b-4915-9d37-aacba2771e95',
      nome: 'Painel',
      moduloId: '0b917870-1142-4703-983c-475564b05527',
      url: '/modulo/manutencao/[id]',
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
      id: '69cdd583-2cfa-438c-9bb9-703b996911cd',
      nome: 'Painel',
      moduloId: '5974b902-728f-4a4d-8df4-a787e91e101d',
      url: '/modulo/documentos/[id]/painel',
    },
    {
      id: '873edf0a-5e11-4943-ac5e-21999b01d14a',
      nome: 'Novo Documento',
      moduloId: '5974b902-728f-4a4d-8df4-a787e91e101d',
      url: '/modulo/documentos/[id]/novo',
    },
    {
      id: '316b0540-4594-4806-8f5d-1c73e0734450',
      nome: 'Painel',
      moduloId: '572a442d-2a51-4b40-a401-4299b0b94869',
      url: '/modulo/expedicao/[id]/painel',
    },
    {
      id: '67ab7f78-4bb1-41e2-9af3-b68d6fcc2ac0',
      nome: 'Expedições',
      moduloId: '572a442d-2a51-4b40-a401-4299b0b94869',
      url: '/modulo/expedicao/[id]/expedicoes',
    },
    {
      id: '417db4a6-6384-4eee-8ab0-b56ac1f3dd10',
      nome: 'Painel',
      moduloId: '69b6e9cd-5036-4988-9d39-e2536655513e',
      url: '/modulo/recebimentos/[id]/painel',
    },
    {
      id: '97f02920-19ed-4442-a014-f28f39272fe5',
      nome: 'Recebimentos',
      moduloId: '69b6e9cd-5036-4988-9d39-e2536655513e',
      url: '/modulo/recebimentos/[id]/recebimento',
    },
    {
      id: '43f63eec-7473-4ed2-9476-777350f98841',
      nome: 'Painel',
      moduloId: '47c1c557-3d20-4bb7-9241-5a27de229994',
      url: '/modulo/rh/[id]/painel',
    },
    {
      id: '16253414-d74c-4a9e-88e2-9fb472ec6141',
      nome: 'Cargos',
      moduloId: '47c1c557-3d20-4bb7-9241-5a27de229994',
      url: '/modulo/rh/[id]/cargos',
    },
    {
      id: '7820aa23-a866-40cf-ae79-93d5c2dc5bff',
      nome: 'Colaboradores',
      moduloId: '47c1c557-3d20-4bb7-9241-5a27de229994',
      url: '/modulo/rh/[id]/colaboradores',
    },
    {
      id: '8ee90707-000b-4344-801d-0fad68ebc12e',
      nome: 'Treinamentos',
      moduloId: '47c1c557-3d20-4bb7-9241-5a27de229994',
      url: '/modulo/rh/[id]/treinamentos',
    },
    {
      id: '3177d825-30a6-4aa1-b4d7-2747ac14f782',
      nome: 'Painel',
      moduloId: '6944a9cb-fb02-4b00-9566-ddd05a1c1c44',
      url: '/modulo/vendas/[id]/painel',
    },
    {
      id: '74c699a2-59c5-45dc-9674-af55aa1504e2',
      nome: 'Clientes',
      moduloId: '6944a9cb-fb02-4b00-9566-ddd05a1c1c44',
      url: '/modulo/vendas/[id]/clientes',
    },
    {
      id: '6e1c557b-b4fd-4344-be08-d4b2ee673a93',
      nome: 'Produtos',
      moduloId: '6944a9cb-fb02-4b00-9566-ddd05a1c1c44',
      url: '/modulo/vendas/[id]/produtos',
    },
  ]

  const criaFuncoesModulo = funcoesData.map((funcao) =>
    prisma.funcao.upsert({
      where: { id: funcao.id },
      update: {
        nome: funcao.nome,
        moduloId: funcao.moduloId,
        url: funcao.url,
      },
      create: funcao,
    })
  )

  const vinculaFuncoesAoPerfil = funcoesData.map((funcao) =>
    prisma.perfilPermissaFuncao.upsert({
      where: {
        perfilId_funcaoId: {
          perfilId: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
          funcaoId: funcao.id,
        },
      },
      update: {},
      create: {
        perfilId: '477140dc-efa9-460b-8178-9d9bbe7ed0c5',
        funcaoId: funcao.id,
      },
    })
  )

  const vinculaModulosEmpresa = modulosData.map((modulo) =>
    prisma.moduloEmpresa.upsert({
      where: {
        empresaId_moduloId: {
          empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
          moduloId: modulo.id,
        },
      },
      update: {},
      create: {
        empresaId: '00c99ee1-eccf-4d71-88fa-2e1d2c085867',
        moduloId: modulo.id,
      },
    })
  )

  await prisma.$transaction([
    criaEmpresa,
    criaPerfil,
    pessoaUsuario,
    criaUsuario,
    ...criaModulosApp,
    ...criaFuncoesModulo,
    ...vinculaFuncoesAoPerfil,
    ...vinculaModulosEmpresa,
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
