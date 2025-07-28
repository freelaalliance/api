import { prisma } from '../../../services/PrismaClientService'

interface PlanosTreinamento {
  nome: string
}

interface TreinamentoData {
  nome: string
  tipo: 'integracao' | 'capacitacao'
  planos: Array<PlanosTreinamento>
  empresa: string
}

export async function criarTreinamento({ nome, tipo, planos, empresa }: TreinamentoData) {
  const novoTreinamento = await prisma.treinamento.create({
    data: {
      nome,
      tipo,
      empresasId: empresa,
      planos: {
        createMany: {
          data: planos
        }
      },
    },
  })

  return novoTreinamento
}

export async function listarTreinamentos() {
  const treinamentos = await prisma.treinamento.findMany({
    include: {
      planos: {
        where: {
          excluido: false,
        }
      },
    },
    orderBy: {
      nome: 'asc'
    },
    where: {
      excluido: false,
    },
  })
  return treinamentos
}

export async function atualizarTreinamento(id: string, data: Omit<TreinamentoData, 'empresa' | 'planos'>) {
  const treinamentoAtualizado = await prisma.treinamento.update({
    where: { id },
    data: {
      nome: data.nome,
      tipo: data.tipo
    },
  })
  return treinamentoAtualizado
}

export async function deletarTreinamento(id: string) {
  await prisma.treinamento.update({
    where: { id },
    data: {
      excluido: true,
    },
  })
}

export async function deletarPlanoTreinamento(id: number) {
  await prisma.planoTreinamento.update({
    where: { id },
    data: {
      excluido: true,
    },
  })
}

export async function listarPlanosTreinamento(treinamentoId: string) {
  const planos = await prisma.planoTreinamento.findMany({
    where: {
      treinamentosId: treinamentoId,
      excluido: false,
    },
    orderBy: {
      nome: 'asc',
    },
  })

  return planos
}

export async function criarPlanoTreinamento(treinamentoId: string, nome: string) {
  const novoPlano = await prisma.planoTreinamento.create({
    data: {
      nome,
      treinamentosId: treinamentoId,
    },
  })

  return novoPlano
}

export async function listarTreinamentosIntegracaoCargo(cargoId: string, empresaId: string) {
  return await prisma.treinamentosIntegracaoCargos.findMany({
    where: {
      treinamento: {
        tipo: 'integracao',
        empresasId: empresaId,
        excluido: false,
      },
      cargosId: cargoId
    },
    select: {
      treinamento: true
    }
  })
}

export async function listarTreinamentosCapacitacaoCargo(empresaId: string) {
  return await prisma.treinamento.findMany({
    where: {
      tipo: 'capacitacao',
      empresasId: empresaId,
      excluido: false,
    },
  })
}