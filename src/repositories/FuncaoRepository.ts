import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import FuncaoEntity from '../entities/FuncaoEntity'
import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

import type { FuncaoInterface } from './../interfaces/ModulosSistemaInterface'

class FuncaoRepository {
  private funcaoEntity: FuncaoEntity

  constructor(funcaoEntity: FuncaoEntity) {
    this.funcaoEntity = funcaoEntity
  }

  async inserirFuncao(): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.funcao.create({
        data: {
          nome: this.funcaoEntity.getNomeFuncao(),
          url: this.funcaoEntity.getUrlFuncao(),
          moduloId: this.funcaoEntity.getIdModulo(),
        },
      })

      return {
        status: true,
        msg: 'Funcao cadastrado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }

      return { status: false, msg: 'Erro ao processar o cadastro da funcao' }
    }
  }

  async atualizarFuncao(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.funcao.update({
        where: {
          id,
        },
        data: {
          nome: this.funcaoEntity.getNomeFuncao(),
          url: this.funcaoEntity.getUrlFuncao(),
          moduloId: this.funcaoEntity.getIdModulo(),
        },
      })

      return {
        status: true,
        msg: 'Funcao atualizado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Erro ao processar a atualização da funcao',
      }
    }
  }

  async deletarFuncao(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.funcao.delete({
        where: {
          id,
        },
      })

      return {
        status: true,
        msg: 'Funcao deletado com sucesso',
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: err.message }
      }
      return {
        status: false,
        msg: 'Erro ao processar a exclusão da funcao',
      }
    }
  }

  async listarFuncaoModulo(moduloId: string): Promise<FuncaoEntity[]> {
    const funcao = await prisma.funcao.findMany({
      where: {
        moduloId,
      },
      include: {
        modulo: true,
      },
    })

    if (funcao.length === 0) return []

    return funcao.map(funcao => {
      return new FuncaoEntity(
        funcao.id,
        funcao.nome,
        funcao.url,
        funcao.moduloId
      )
    })
  }

  async buscarFuncao(id: string): Promise<FuncaoEntity> {
    const funcao = await prisma.funcao.findUnique({
      where: {
        id,
      },
      include: {
        modulo: true,
      },
    })

    if (funcao) {
      return new FuncaoEntity(
        funcao.id,
        funcao.nome,
        funcao.url,
        funcao.modulo.id,
        funcao.modulo.nome
      )
    }

    return new FuncaoEntity()
  }

  async listarFuncoesPermitidosPerfil(
    perfilId: string
  ): Promise<FuncaoInterface[]> {
    const funcoesPerfil = await prisma.perfilPermissaFuncao.findMany({
      where: {
        perfilId,
      },
      include: {
        funcao: {
          include: {
            modulo: true,
          },
        },
      },
      orderBy: {
        funcao: {
          modulo: {
            nome: 'asc',
          },
        },
      },
    })

    if (funcoesPerfil.length === 0) return []

    return funcoesPerfil.map(({ funcao }) => {
      return {
        id: funcao.id,
        nome: funcao.nome,
        url: funcao.url,
        moduloId: funcao.modulo.id,
        moduloNome: funcao.modulo.nome,
      }
    })
  }

  async listarFuncoesModuloPerfil(perfilId: string, moduloId: string) {
    const funcoesPerfil = await prisma.perfilPermissaFuncao.findMany({
      where: {
        perfilId,
        funcao: {
          moduloId,
        },
      },
      include: {
        funcao: true,
      },
      orderBy: {
        funcao: {
          modulo: {
            nome: 'asc',
          },
        },
      },
    })

    if (funcoesPerfil.length === 0) return []

    return funcoesPerfil.map(({ funcao }) => {
      return {
        id: funcao.id,
        nome: funcao.nome,
        url: funcao.url,
      }
    })
  }
}

export default FuncaoRepository
