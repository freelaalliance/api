import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import PessoaEntity from '../entities/PessoaEntity'
import { PessoaInterface } from '../interfaces/PessoaInterface'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

class PessoaRepository {
  private pessoaEntity: PessoaEntity

  constructor(pessoaEntity: PessoaEntity) {
    this.pessoaEntity = pessoaEntity
  }

  async criarPessoa(): Promise<RespostaRequisicaoInterface> {
    try {
      const cadastraPessoa = await prisma.pessoa.create({
        data: {
          nome: this.pessoaEntity.getNomePessoa(),
        },
      })

      return {
        status: true,
        msg: cadastraPessoa.id,
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
        msg: 'Pessoa não foi cadastrada, tente novamente!',
      }
    }
  }

  async buscarPessoa(id: string): Promise<PessoaEntity> {
    const dadosPessoa: PessoaInterface | null = await prisma.pessoa.findUnique({
      where: {
        id,
      },
    })

    if (dadosPessoa) return new PessoaEntity(dadosPessoa.nome)

    return new PessoaEntity()
  }

  async editarPessoa(): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.pessoa.update({
        where: {
          id: this.pessoaEntity.getIdPessoa(),
        },
        data: {
          nome: this.pessoaEntity.getNomePessoa(),
        },
      })

      return {
        status: true,
        msg: 'Pessoa editada com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }

      return {
        status: false,
        msg: 'Pessoa não foi atualizada, tente novamente!',
      }
    }
  }
}

export default PessoaRepository
