import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import EmpresaEntity from '../entities/EmpresaEntity'
import { PessoaEmpresaInterface } from '../interfaces/PessoaInterface'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

import { PessoaInterface } from './../interfaces/PessoaInterface'

class EmpresaRepository {
  private empresaEntity: EmpresaEntity

  constructor(empresaEntity: EmpresaEntity) {
    this.empresaEntity = empresaEntity
  }

  async buscarEmpresaPorCnpj(cnpj: string): Promise<EmpresaEntity> {
    const dadosEmpresa:
      | (PessoaEmpresaInterface & { pessoa: PessoaInterface })
      | null = await prisma.empresa.findUnique({
      where: {
        cnpj,
      },
      include: { pessoa: true },
    })

    if (dadosEmpresa)
      return new EmpresaEntity(
        dadosEmpresa.id,
        dadosEmpresa.cnpj,
        dadosEmpresa.imagemLogo,
        new Date(dadosEmpresa.criadoEm),
        new Date(dadosEmpresa.atualizadoEm),
        dadosEmpresa.excluido,
        dadosEmpresa.pessoa.id,
        dadosEmpresa.pessoa.nome,
      )

    return new EmpresaEntity()
  }

  async buscarEmpresa(id: string): Promise<EmpresaEntity> {
    const dadosEmpresa:
      | (PessoaEmpresaInterface & { pessoa: PessoaInterface })
      | null = await prisma.empresa.findUnique({
      where: {
        id,
      },
      include: { pessoa: true },
    })

    if (dadosEmpresa)
      return new EmpresaEntity(
        dadosEmpresa.id,
        dadosEmpresa.cnpj,
        dadosEmpresa.imagemLogo,
        new Date(dadosEmpresa.criadoEm),
        new Date(dadosEmpresa.atualizadoEm),
        dadosEmpresa.excluido,
        dadosEmpresa.pessoa.id,
        dadosEmpresa.pessoa.nome,
      )

    return new EmpresaEntity()
  }

  async criarEmpresa(): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.empresa.create({
        data: {
          cnpj: this.empresaEntity.getCnpj(),
          imagemLogo: this.empresaEntity.getImagemLogo(),
          excluido: this.empresaEntity.estaExcluido(),
          pessoaId: this.empresaEntity.getIdPessoa(),
        },
      })

      return {
        status: true,
        msg: 'Empresa cadastrada com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          status: false,
          msg: error.message,
        }
      }
      return {
        status: false,
        msg: 'Empresa não foi cadastrada, tente novamente!',
      }
    }
  }

  async editarEmpresa(): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.empresa.update({
        where: {
          id: this.empresaEntity.getIdEmpresa(),
        },
        data: {
          cnpj: this.empresaEntity.getCnpj(),
          imagemLogo: this.empresaEntity.getImagemLogo(),
          pessoaId: this.empresaEntity.getIdPessoa(),
        },
      })

      return {
        status: true,
        msg: 'Empresa editada com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Empresa não foi atualizado, tente novamente!',
      }
    }
  }

  async deletarEmpresa(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.empresa.update({
        where: {
          id,
        },
        data: {
          excluido: this.empresaEntity.estaExcluido(),
        },
      })

      return {
        status: true,
        msg: 'Empresa deletada com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          status: false,
          msg: error.message,
        }
      }
      return {
        status: false,
        msg: 'Empresa não foi excluida, tente novamente!',
      }
    }
  }

  async recuperarListaEmpresa(): Promise<EmpresaEntity[]> {
    const dadosEmpresa:
      | (PessoaEmpresaInterface & { pessoa: PessoaInterface })[]
      | null = await prisma.empresa.findMany({
      where: {
        excluido: false,
      },
      include: { pessoa: true },
      orderBy: {
        pessoa: {
          nome: 'asc',
        },
      },
    })

    if (dadosEmpresa)
      return dadosEmpresa.map(
        (empresa) =>
          new EmpresaEntity(
            empresa.id,
            empresa.cnpj,
            empresa.imagemLogo,
            new Date(empresa.criadoEm),
            new Date(empresa.atualizadoEm),
            empresa.excluido,
            empresa.pessoa.id,
            empresa.pessoa.nome,
          ),
      )

    return []
  }

  async vincularModulosEmpresa(
    empresaId: string,
    moduloId: string,
  ): Promise<RespostaRequisicaoInterface> {
    try {
      const verificaExisteVinculoModulo = await prisma.moduloEmpresa.findMany({
        where: {
          empresaId,
          moduloId,
        },
      })

      if (verificaExisteVinculoModulo.length > 0)
        return {
          status: false,
          msg: 'Esta empresa já está vinculado a esse modulo',
        }

      await prisma.moduloEmpresa.create({
        data: {
          empresaId,
          moduloId,
        },
      })
      return {
        status: true,
        msg: 'Modulos vinculados com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Modulos não foram vinculados, tente novamente!',
      }
    }
  }

  async desvincularModulosEmpresa(
    empresaId: string,
    moduloId: string,
  ): Promise<RespostaRequisicaoInterface> {
    try {
      const verificaExisteVinculoModulo = await prisma.moduloEmpresa.findMany({
        where: {
          empresaId,
          moduloId,
        },
      })

      if (verificaExisteVinculoModulo.length === 0)
        return {
          status: false,
          msg: 'Esta empresa não está vinculado a esse modulo',
        }

      await prisma.moduloEmpresa.deleteMany({
        where: {
          empresaId,
          moduloId,
        },
      })
      return {
        status: true,
        msg: 'Modulos desvinculados com sucesso!',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Modulos não foram desvinculados, tente novamente!',
      }
    }
  }
}

export default EmpresaRepository
