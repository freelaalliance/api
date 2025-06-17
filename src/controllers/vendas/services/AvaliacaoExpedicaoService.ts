import { prisma } from "../../../services/PrismaClientService"

export async function criarItemAvaliacao(dados: {
  itens: Array<{ pergunta: string }>,
  empresasId: string
}) {
  return await prisma.itensAvaliacaoExpedicao.createMany({
    data: dados.itens.map(item => ({
      pergunta: item.pergunta,
      empresasId: dados.empresasId,
    })),
  })
}

export async function listarItensPorEmpresa(empresaId: string) {
  return await prisma.itensAvaliacaoExpedicao.findMany({
    where: { empresasId: empresaId, excluido: false },
  })
}

export async function atualizarItemAvaliacao(id: number, pergunta: string) {
  return await prisma.itensAvaliacaoExpedicao.update({
    where: { id },
    data: { pergunta },
  })
}

export async function removerItemAvaliacao(id: number) {
  return await prisma.itensAvaliacaoExpedicao.update({
    where: { id },
    data: { excluido: true },
  })
}