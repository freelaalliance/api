import { prisma } from '../../services/PrismaClientService'

export interface ItemAvaliacao {
  id: string
  descricao: string
  ativo: boolean
  empresaId: string
}

export type SalvarItemAvaliacaoProps = Pick<ItemAvaliacao, 'descricao'>

export type ItemAvaliacaoEmpresaProps = Pick<ItemAvaliacao, 'empresaId'>

export type AtualizaItemAvaliacaoEmpresaProps = Omit<
  ItemAvaliacao,
  'ativo' | 'empresaId'
>

export type AtualizaStatusItemAvaliacaoProps = Pick<
  ItemAvaliacao,
  'id' | 'ativo'
>

export async function salvarNovoItemAvalicao(
  itens: Array<SalvarItemAvaliacaoProps>,
  empresaId: string
) {
  await prisma.itensAvaliativosRecebimentoEmpresa.createMany({
    data: itens.map(item => ({
      descricao: item.descricao,
      empresaId,
    })),
  })
}

export async function buscarItensAvaliacaoRecebimentoEmpresa({
  empresaId,
}: ItemAvaliacaoEmpresaProps) {
  return await prisma.itensAvaliativosRecebimentoEmpresa.findMany({
    select: {
      id: true,
      descricao: true,
      ativo: true,
    },
    where: {
      empresaId,
    },
  })
}

export async function atualizarDescricaoItem({
  id,
  descricao,
}: AtualizaItemAvaliacaoEmpresaProps) {
  await prisma.itensAvaliativosRecebimentoEmpresa.update({
    where: {
      id,
    },
    data: {
      descricao,
    },
  })
}

export async function atualizarStatusItemAvaliacao({
  id,
  ativo,
}: AtualizaStatusItemAvaliacaoProps) {
  await prisma.itensAvaliativosRecebimentoEmpresa.update({
    where: {
      id,
    },
    data: {
      ativo,
    },
  })
}

export async function buscarItensAvaliacaoRecebimentoAtivoEmpresa({
  empresaId,
}: ItemAvaliacaoEmpresaProps) {
  return await prisma.itensAvaliativosRecebimentoEmpresa.findMany({
    select: {
      id: true,
      descricao: true,
    },
    where: {
      empresaId,
      ativo: true,
    },
  })
}
