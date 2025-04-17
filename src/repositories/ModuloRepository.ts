import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import ModuloEntity from '../entities/ModuloEntity'
import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

import type {
  ModuloEmpresaInteface,
  ModuloInterface,
} from './../interfaces/ModulosSistemaInterface'

class ModuloRespository {
  private moduloEntity: ModuloEntity

  constructor(moduloEntity: ModuloEntity) {
    this.moduloEntity = moduloEntity
  }

  async inserirModulo(): Promise<RespostaRequisicaoInterface> {
    try {
      const verificaExisteModulo: ModuloInterface | null =
        await prisma.modulo.findUnique({
          where: {
            url: this.moduloEntity.getUrlModulo(),
          },
        })

      if (verificaExisteModulo)
        return {
          status: false,
          msg: 'Não é possível cadastrar o módulo, pois já existe um módulo com este URL!',
        }

      const salvaModulo = await prisma.modulo.create({
        data: {
          nome: this.moduloEntity.getNomeModulo(),
          url: this.moduloEntity.getUrlModulo(),
        },
      })

      return {
        status: true,
        msg: salvaModulo.id,
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }

      return { status: false, msg: 'Erro ao processar o cadastro do modulo' }
    }
  }

  async atualizarModulo(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.modulo.update({
        where: {
          id,
        },
        data: {
          nome: this.moduloEntity.getNomeModulo(),
          url: this.moduloEntity.getUrlModulo(),
        },
      })

      return {
        status: true,
        msg: 'Modulo atualizado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Erro ao processar a atualização do modulo',
      }
    }
  }

  async deletarModulo(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.modulo.delete({
        where: {
          id,
        },
      })

      return {
        status: true,
        msg: 'Modulo deletado com sucesso',
      }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: err.message }
      }
      return {
        status: false,
        msg: 'Erro ao processar a exclusão do modulo',
      }
    }
  }

  async listarModulos(): Promise<ModuloEntity[]> {
    const modulos: ModuloInterface[] = await prisma.modulo.findMany()

    if (modulos.length === 0) return []

    return modulos.map((modulo: ModuloInterface) => {
      return new ModuloEntity(modulo.id, modulo.nome, modulo.url)
    })
  }

  async buscarModulo(id: string): Promise<ModuloEntity> {
    const modulo: ModuloInterface | null = await prisma.modulo.findUnique({
      where: {
        id,
      },
    })

    if (modulo) {
      return new ModuloEntity(modulo.id, modulo.nome, modulo.url)
    }

    return new ModuloEntity()
  }

  async listarModulosEmpresa(id: string): Promise<Array<ModuloInterface>> {
    const modulosEmpresa: (ModuloEmpresaInteface & {
      modulo: ModuloInterface
    })[] = await prisma.moduloEmpresa.findMany({
      where: {
        empresaId: id,
      },
      include: {
        modulo: true,
      },
    })

    if (modulosEmpresa.length === 0) {
      return []
    }

    return modulosEmpresa.map(({ modulo }) => {
      return {
        id: modulo.id,
        nome: modulo.nome,
        url: modulo.url,
      }
    })
  }

  async buscarModuloEmpresa(urlModulo: string) {
    return await prisma.modulo.findMany({
      where: {
        url: urlModulo,
      },
    })
  }
}

export default ModuloRespository
