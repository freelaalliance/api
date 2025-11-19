import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

interface CriarConfiguracaoInput {
  chave: string
  valor: string
  empresaId: string
}

export async function criarConfiguracao(
  data: CriarConfiguracaoInput
): Promise<RespostaRequisicaoInterface> {
  try {
    await prisma.configuracaoEmpresa.upsert({
      where: {
        chave: data.chave,
        empresaId: data.empresaId,
      },
      update: {
        valor: data.valor,
      },
      create: {
        chave: data.chave,
        valor: data.valor,
        empresaId: data.empresaId,
      },
    })

    return {
      status: true,
      msg: 'Configuração criada com sucesso',
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          status: false,
          msg: 'Já existe uma configuração com essa chave',
        }
      }
      if (error.code === 'P2003') {
        return {
          status: false,
          msg: 'Empresa não encontrada',
        }
      }
    }

    return {
      status: false,
      msg: 'Erro ao criar configuração',
    }
  }
}

export async function buscarConfiguracoesPorEmpresa(empresaId: string) {
  try {
    const configuracoes = await prisma.configuracaoEmpresa.findMany({
      where: {
        empresaId,
      },
      select: {
        id: true,
        chave: true,
        valor: true,
      },
      orderBy: {
        chave: 'asc',
      },
    })

    return configuracoes
  } catch (error) {
    return []
  }
}

export async function buscarConfiguracaoPorChave(
  empresaId: string,
  chave: string
) {
  try {
    const configuracao = await prisma.configuracaoEmpresa.findFirst({
      where: {
        empresaId,
        chave,
      },
      select: {
        id: true,
        chave: true,
        valor: true,
        empresaId: true,
      },
    })

    return configuracao
  } catch (error) {
    return null
  }
}

export async function atualizarConfiguracao(
  id: string,
  valor: string
): Promise<RespostaRequisicaoInterface> {
  try {
    await prisma.configuracaoEmpresa.update({
      where: {
        id,
      },
      data: {
        valor,
      },
    })

    return {
      status: true,
      msg: 'Configuração atualizada com sucesso',
    }
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return {
          status: false,
          msg: 'Configuração não encontrada',
        }
      }
    }

    return {
      status: false,
      msg: 'Erro ao atualizar configuração',
    }
  }
}
