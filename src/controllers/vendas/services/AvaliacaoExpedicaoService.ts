import { prisma } from "../../../services/PrismaClientService"

export async function criarItemAvaliacao(dados: {
  pergunta: string
  empresasId: string
}) {
  return await prisma.itensAvaliacaoExpedicao.create({
    data: dados,
  })
}

export async function listarItensPorEmpresa(empresaId: string) {
  return await prisma.itensAvaliacaoExpedicao.findMany({
    where: { empresasId: empresaId },
  })
}

export async function atualizarItemAvaliacao(id: number, pergunta: string, empresaId: string) {
  return await prisma.itensAvaliacaoExpedicao.update({
    where: { id, empresasId: empresaId },
    data: { pergunta },
  })
}

export async function removerItemAvaliacao(id: number,empresaId: string) {
  return await prisma.itensAvaliacaoExpedicao.delete({
    where: { id, empresasId: empresaId },
  })
}