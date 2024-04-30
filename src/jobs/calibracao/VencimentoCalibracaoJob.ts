import { axiosInstance } from '../../services/AxiosClient'
import { prisma } from '../../services/PrismaClientService'

type DisparoEmailType = {
  assunto: string
  remetente: string
  destinatario: string
  enderecoRemetente: string
  enderecoDestinatario: string
  mensagem: string
}

export async function notificarVencimentoCalibracao() {
  const moduloCalibracao = await prisma.modulo.findFirst({
    where: {
      url: {
        contains: '/modulo/calibracao',
      },
    },
  })

  const listaCalibracoesVencendo = await prisma.agenda.findMany({
    select: {
      agendadoPara: true,
      instrumento: {
        select: {
          nome: true,
          codigo: true,
          id: true,
          empresaId: true,
        },
      },
    },
    where: {
      instrumento: {
        excluido: false,
        empresa: {
          excluido: false,
        },
      },
      agendadoPara: {
        lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  })

  const mensagensParaDisparo: DisparoEmailType[] = []

  for (const calibracaoInstrumento of listaCalibracoesVencendo) {
    const verificaExisteCalibracaoRealizada = await prisma.calibracao.findFirst(
      {
        select: {
          id: true,
        },
        where: {
          excluido: false,
          realizadoEm: {
            lte: new Date(
              calibracaoInstrumento.agendadoPara.getFullYear(),
              calibracaoInstrumento.agendadoPara.getMonth() + 1,
              0,
            ),
            gte: new Date(
              calibracaoInstrumento.agendadoPara.getFullYear(),
              calibracaoInstrumento.agendadoPara.getMonth(),
              0,
            ),
          },
          instrumentoId: calibracaoInstrumento.instrumento.id,
        },
      },
    )

    if (!verificaExisteCalibracaoRealizada) {
      const usuariosPermissaoModulo = await prisma.usuario.findMany({
        select: {
          id: true,
          email: true,
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
        where: {
          perfil: {
            PerfilPermissaFuncao: {
              some: {
                funcao: {
                  moduloId: moduloCalibracao?.id,
                },
              },
            },
            administrativo: true,
          },
          empresaId: calibracaoInstrumento.instrumento.empresaId,
          ativo: true,
        },
      })

      const ultimaCalibracaoInstrumentoRealizada =
        await prisma.calibracao.findFirst({
          select: {
            numeroCertificado: true,
          },
          where: {
            excluido: false,
            instrumentoId: calibracaoInstrumento.instrumento.id,
          },
          orderBy: {
            realizadoEm: 'desc',
          },
        })

      for (const usuario of usuariosPermissaoModulo) {
        mensagensParaDisparo.push({
          assunto: 'Vencimento de Calibração',
          remetente: 'Alliance Sistemas',
          destinatario: usuario.pessoa.nome,
          enderecoRemetente: process.env.ENV_EMAIL_REMETENTE ?? '',
          enderecoDestinatario: usuario.email,
          mensagem: `Caro usuário, o certificado de nº ${ultimaCalibracaoInstrumentoRealizada?.numeroCertificado} vence no dia ${calibracaoInstrumento.agendadoPara.toLocaleString('pt-BR')}. Fique atento aos prazos planejados para nova calibração.`,
        })
      }
    }
  }

  const urlBase = process.env.ENV_URL_BASE_EMAIL ?? 'http://localhost:3334/'
  const tokenBase = process.env.ENV_TOKEN_EMAIL ?? 'token@exemplo.com'

  const response = await axiosInstance.post(
    `${urlBase}/email/enviar`,
    {
      email: mensagensParaDisparo,
    },
    {
      headers: {
        Authorization: `Bearer ${tokenBase}`,
      },
    },
  )

  console.log(response.status + ' - ' + response.statusText)
}
