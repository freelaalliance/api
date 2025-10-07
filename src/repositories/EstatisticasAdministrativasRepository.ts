import { prisma } from '../services/PrismaClientService'

interface EstatisticasAdministrativasInterface {
  totalEmpresas: number
  totalUsuariosAtivos: number
  totalModulosEmUso: number
  empresasRecentesCadastradas: number
  modulosMaisUtilizados: Array<{
    nome: string
    quantidade: number
  }>
}

class EstatisticasAdministrativasRepository {
  async buscarEstatisticasGerais(): Promise<EstatisticasAdministrativasInterface> {
    // Contar total de empresas ativas
    const totalEmpresas = await prisma.empresa.count({
      where: {
        excluido: false,
      },
    })

    // Contar total de usuários ativos
    const totalUsuariosAtivos = await prisma.usuario.count({
      where: {
        ativo: true,
      },
    })

    // Contar módulos em uso (vinculados a pelo menos uma empresa)
    const modulosEmUso = await prisma.moduloEmpresa.findMany({
      select: {
        moduloId: true,
      },
      distinct: ['moduloId'],
    })

    const totalModulosEmUso = modulosEmUso.length

    // Contar empresas cadastradas nos últimos 30 dias
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() - 30)

    const empresasRecentesCadastradas = await prisma.empresa.count({
      where: {
        excluido: false,
        criadoEm: {
          gte: dataLimite,
        },
      },
    })

    // Buscar módulos mais utilizados (top 5)
    const modulosMaisUtilizados = await prisma.moduloEmpresa.groupBy({
      by: ['moduloId'],
      _count: {
        moduloId: true,
      },
      orderBy: {
        _count: {
          moduloId: 'desc',
        },
      },
      take: 5,
    })

    // Buscar nomes dos módulos mais utilizados
    const modulosComNome = await Promise.all(
      modulosMaisUtilizados.map(async (modulo) => {
        const moduloData = await prisma.modulo.findUnique({
          where: {
            id: modulo.moduloId,
          },
          select: {
            nome: true,
          },
        })

        return {
          nome: moduloData?.nome || 'Módulo não encontrado',
          quantidade: modulo._count.moduloId,
        }
      })
    )

    return {
      totalEmpresas,
      totalUsuariosAtivos,
      totalModulosEmUso,
      empresasRecentesCadastradas,
      modulosMaisUtilizados: modulosComNome,
    }
  }
}

export default EstatisticasAdministrativasRepository
