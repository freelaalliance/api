import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import EnderecoEntity from '../entities/EnderecoEntity'
import { EnderecoRepositoryInterface } from '../interfaces/EnderecoInterface'
import { prisma } from '../services/PrismaClientService'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'

class EnderecoRepository {
  private enderecoEntity: EnderecoEntity

  constructor(enderecoEntity: EnderecoEntity) {
    this.enderecoEntity = enderecoEntity
  }

  async criarEndereco(): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.endereco.create({
        data: {
          logradouro: this.enderecoEntity.getLogradouro(),
          numero: this.enderecoEntity.getNumero(),
          bairro: this.enderecoEntity.getBairro(),
          cidade: this.enderecoEntity.getCidade(),
          estado: this.enderecoEntity.getEstado(),
          excluido: this.enderecoEntity.getExcluido(),
          cep: this.enderecoEntity.getCep(),
          complemento: this.enderecoEntity.getComplemento(),
          pessoaId: this.enderecoEntity.getPessoaId(),
        },
      })

      return {
        status: true,
        msg: 'Endereço cadastrado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return { status: false, msg: 'Endereço não cadastrado, tente novamente!' }
    }
  }

  async editarEndereco(): Promise<RespostaRequisicaoInterface> {
    try {
      const idEndereco = this.enderecoEntity.getId()

      if (idEndereco !== '') {
        await prisma.endereco.update({
          where: {
            id: idEndereco,
          },
          data: {
            logradouro: this.enderecoEntity.getLogradouro(),
            numero: this.enderecoEntity.getNumero(),
            bairro: this.enderecoEntity.getBairro(),
            cidade: this.enderecoEntity.getCidade(),
            estado: this.enderecoEntity.getEstado(),
            excluido: this.enderecoEntity.getExcluido(),
            cep: this.enderecoEntity.getCep(),
            complemento: this.enderecoEntity.getComplemento(),
            pessoaId: this.enderecoEntity.getPessoaId(),
          },
        })
      }

      return {
        status: true,
        msg: 'Endereço editado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Endereço não foi atualizado, tente novamente!',
      }
    }
  }

  async buscarEndereco(id: string): Promise<EnderecoEntity> {
    const endereco: EnderecoRepositoryInterface | null =
      await prisma.endereco.findUnique({
        where: {
          id,
        },
      })

    if (endereco) {
      return new EnderecoEntity(
        endereco.id,
        endereco.logradouro,
        endereco.bairro,
        endereco.cidade,
        endereco.estado,
        endereco.numero,
        endereco.complemento,
        endereco.cep,
        endereco.excluido,
        endereco.criadoEm,
        endereco.atualizadoEm,
        endereco.pessoaId,
      )
    }

    return new EnderecoEntity()
  }

  async buscarEnderecoPessoa(pessoaId: string): Promise<EnderecoEntity> {
    const endereco: EnderecoRepositoryInterface | null =
      await prisma.endereco.findUnique({
        where: {
          pessoaId,
          excluido: false,
        },
      })

    if (endereco) {
      return new EnderecoEntity(
        endereco.id,
        endereco.logradouro,
        endereco.bairro,
        endereco.cidade,
        endereco.estado,
        endereco.numero,
        endereco.complemento,
        endereco.cep,
        endereco.excluido,
        endereco.criadoEm,
        endereco.atualizadoEm,
        endereco.pessoaId,
      )
    }

    return new EnderecoEntity()
  }

  async deletarEndereco(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.endereco.update({
        where: {
          id,
        },
        data: {
          excluido: true,
        },
      })

      return {
        status: true,
        msg: 'Endereço deletado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return { status: false, msg: error.message }
      }
      return {
        status: false,
        msg: 'Endereço não foi excluído, tente novamente',
      }
    }
  }

  async listarEmpresas(): Promise<EnderecoEntity[]> {
    const enderecos: EnderecoRepositoryInterface[] =
      await prisma.endereco.findMany({
        where: {
          excluido: false,
        },
      })

    if (enderecos) {
      return enderecos.map((endereco: EnderecoRepositoryInterface) => {
        return new EnderecoEntity(
          endereco.id,
          endereco.logradouro,
          endereco.bairro,
          endereco.cidade,
          endereco.estado,
          endereco.numero,
          endereco.complemento,
          endereco.cep,
          endereco.excluido,
          endereco.criadoEm,
          endereco.atualizadoEm,
          endereco.pessoaId,
        )
      })
    }

    return []
  }
}

export default EnderecoRepository
