import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import PerfilEntity from '../entities/PerfilEntity'
import { PerfilInterface } from '../interfaces/PerfilInterface'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

class PerfilRepository {
  private perfilEntity: PerfilEntity

  constructor(perfilEntity: PerfilEntity) {
    this.perfilEntity = perfilEntity
  }

  async criarPerfil(empresa: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.perfil.create({
        data: {
          nome: this.perfilEntity.getNome(),
          administrativo: this.perfilEntity.isAdministrativo(),
          empresaId: empresa,
        },
      })
      return {
        status: true,
        msg: 'Perfil criado com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return { status: false, msg: 'Perfil não foi criado, tente novamente!' }
    }
  }

  async atualizarPerfil(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.perfil.update({
        where: { id },
        data: {
          nome: this.perfilEntity.getNome(),
          administrativo: this.perfilEntity.isAdministrativo(),
        },
      })
      return {
        status: true,
        msg: 'Perfil atualizado com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Perfil não foi atualizado, tente novamente!',
      }
    }
  }

  async excluirPerfil(perfilId: string): Promise<RespostaRequisicaoInterface> {
    try {
      const excluiPermissoesPerfil = prisma.perfilPermissaFuncao.deleteMany({
        where: { perfilId },
      })
      const excluiUsuariosVinculadosPerfil = prisma.usuario.deleteMany({
        where: { perfilId },
      })
      const excluiPerfil = prisma.perfil.delete({
        where: { id: perfilId },
      })

      await prisma.$transaction([
        excluiPermissoesPerfil,
        excluiUsuariosVinculadosPerfil,
        excluiPerfil,
      ])

      return {
        status: true,
        msg: 'Perfil excluído com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Perfil não foi excluído, tente novamente!',
      }
    }
  }

  async listarPerfilempresa(empresaId: string): Promise<PerfilInterface[]> {
    const perfil: PerfilInterface[] | null = await prisma.perfil.findMany({
      where: {
        empresaId,
      },
    })

    if (!perfil) return []

    return perfil
  }

  async buscarPerfilPorId(id: string): Promise<PerfilEntity> {
    const perfil: PerfilInterface | null = await prisma.perfil.findUnique({
      where: {
        id,
      },
    })

    if (!perfil) return new PerfilEntity()

    return new PerfilEntity(perfil.id, perfil.nome, perfil.administrativo)
  }

  async vincularPermissoesFuncaoPerfil(
    perfilId: string,
    funcaoId: string,
  ): Promise<RespostaRequisicaoInterface> {
    try {
      const verificaExisteVinculo = await prisma.perfilPermissaFuncao.findFirst(
        {
          where: {
            perfilId,
            funcaoId,
          },
        },
      )

      if (verificaExisteVinculo)
        return {
          status: false,
          msg: 'Não é possível vincular o perfil, pois já tem vinculo com esta função!',
        }

      await prisma.perfilPermissaFuncao.create({
        data: {
          perfilId,
          funcaoId,
        },
      })
      return {
        status: true,
        msg: 'Permissão vinculada com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Permissão não foi vinculada, tente novamente!',
      }
    }
  }

  async desvincularPermissoesFuncaoPerfil(
    perfilId: string,
    funcaoId: string,
  ): Promise<RespostaRequisicaoInterface> {
    try {
      const verificaExisteVinculo = await prisma.perfilPermissaFuncao.findFirst(
        {
          where: {
            perfilId,
            funcaoId,
          },
        },
      )

      if (!verificaExisteVinculo)
        return {
          status: false,
          msg: 'Não é possível desvincular o perfil, pois não tem vinculo com esta função!',
        }

      await prisma.perfilPermissaFuncao.deleteMany({
        where: {
          perfilId,
          funcaoId,
        },
      })
      return {
        status: true,
        msg: 'Permissão desvinculada com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Permissão não foi desvinculada, tente novamente!',
      }
    }
  }

  async buscarModulosPerfil(perfilId: string) {
    const permissaoPerfis = await prisma.funcao.findMany({
      distinct: 'moduloId',
      include: {
        modulo: {
          select: {
            id: true,
            nome: true,
            url: true,
          },
        },
        PerfilPermissaFuncao: {
          include: {
            perfil: true,
          },
        },
      },
      where: {
        PerfilPermissaFuncao: {
          some: {
            perfilId,
          },
        },
      },
      orderBy: {
        modulo: {
          nome: 'asc',
        },
      },
    })

    return permissaoPerfis
  }

  async verificarPermissaoFuncaoPerfil(perfilId: string, funcaoId: string) {
    return await prisma.perfilPermissaFuncao.findFirst({
      where: {
        perfilId,
        funcaoId,
      },
    })
  }
}

export default PerfilRepository
