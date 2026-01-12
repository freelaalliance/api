import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import UsuarioEntity from '../entities/UsuarioEntity'
import type {
  PessoaInterface,
  PessoaUsuarioInterface,
} from '../interfaces/PessoaInterface'
import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

class UsuarioRepository {
  private usuarioEntity: UsuarioEntity

  constructor(usuarioEntity: UsuarioEntity) {
    this.usuarioEntity = usuarioEntity
  }

  async criarUsuario(): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.usuario.upsert({
        where: {
          email: this.usuarioEntity.getEmail(),
          ativo: false,
        },
        update: {
          email: this.usuarioEntity.getEmail(),
          senha: this.usuarioEntity.getSenha(),
          ativo: this.usuarioEntity.isAtivo(),
          pessoaId: this.usuarioEntity.getIdPessoa(),
          perfilId: this.usuarioEntity.getPerfilId(),
          empresaId: this.usuarioEntity.getEmpresaId(),
        },
        create: {
          email: this.usuarioEntity.getEmail(),
          senha: this.usuarioEntity.getSenha(),
          ativo: this.usuarioEntity.isAtivo(),
          pessoaId: this.usuarioEntity.getIdPessoa(),
          perfilId: this.usuarioEntity.getPerfilId(),
          empresaId: this.usuarioEntity.getEmpresaId(),
        },
      })

      return {
        status: true,
        msg: 'Usuário criado com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          status: false,
          msg: error.message,
        }
      }

      return { status: false, msg: 'Usuario não criado, tente novamente!' }
    }
  }

  async atualizarSenhaUsuario(
    id: string
  ): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.usuario.update({
        where: {
          id,
        },
        data: {
          senha: this.usuarioEntity.getSenha(),
        },
      })

      return {
        status: true,
        msg: 'Senha alterada com sucesso',
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return {
          status: false,
          msg: error.message,
        }
      }

      return { status: false, msg: 'Senha não alterada, tente novamente!' }
    }
  }

  async atualizarUsuario(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.usuario.update({
        where: { id },
        data: {
          email: this.usuarioEntity.getEmail(),
          perfilId: this.usuarioEntity.getPerfilId(),
        },
      })

      return {
        status: true,
        msg: 'Usuário atualizado com sucesso',
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
        msg: 'Usuario não foi alterado, tente novamente!',
      }
    }
  }

  async desativarUsuario(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.usuario.update({
        where: { id },
        data: {
          ativo: false,
        },
      })

      return {
        status: true,
        msg: 'Usuário desativado com sucesso',
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
        msg: 'Usuario não foi desativado, tente novamente!',
      }
    }
  }

  async ativarUsuario(id: string): Promise<RespostaRequisicaoInterface> {
    try {
      await prisma.usuario.update({
        where: { id },
        data: {
          ativo: true,
        },
      })

      return {
        status: true,
        msg: 'Usuário ativado com sucesso',
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
        msg: 'Usuario não foi ativado, tente novamente!',
      }
    }
  }

  async buscarUsuarioPorId(id: string): Promise<UsuarioEntity> {
    const usuario:
      | (PessoaUsuarioInterface & { pessoa: PessoaInterface })
      | null = await prisma.usuario.findUnique({
        where: { id },
        include: {
          pessoa: true,
        },
      })

    if (!usuario) {
      return new UsuarioEntity()
    }

    return new UsuarioEntity(
      usuario.id,
      usuario.email,
      usuario.senha,
      usuario.ativo,
      new Date(usuario.criadoEm),
      new Date(usuario.atualizadoEm),
      usuario.pessoaId,
      usuario.pessoa.nome,
      usuario.perfilId,
      usuario.empresaId
    )
  }

  async buscarUsuarioPorEmail(email: string): Promise<UsuarioEntity> {
    const usuario:
      | (PessoaUsuarioInterface & { pessoa: PessoaInterface })
      | null = await prisma.usuario.findUnique({
        where: { email },
        include: { pessoa: true },
      })

    if (!usuario) {
      return new UsuarioEntity()
    }

    return new UsuarioEntity(
      usuario.id,
      usuario.email,
      usuario.senha,
      usuario.ativo,
      new Date(usuario.criadoEm),
      new Date(usuario.atualizadoEm),
      usuario.pessoa.id,
      usuario.pessoa.nome,
      usuario.perfilId,
      usuario.empresaId
    )
  }

  async listarUsuariosEmpresa(empresaId: string): Promise<UsuarioEntity[]> {
    const usuarios: (PessoaUsuarioInterface & { pessoa: PessoaInterface })[] =
      await prisma.usuario.findMany({
        include: { pessoa: true },
        where: {
          empresaId,
          ativo: true,
        },
      })

    if (usuarios.length === 0) {
      return []
    }

    return usuarios.map(
      (usuario: PessoaUsuarioInterface & { pessoa: PessoaInterface }) => {
        return new UsuarioEntity(
          usuario.id,
          usuario.email,
          usuario.senha,
          usuario.ativo,
          new Date(usuario.criadoEm),
          new Date(usuario.atualizadoEm),
          usuario.pessoa.id,
          usuario.pessoa.nome,
          usuario.perfilId,
          usuario.empresaId
        )
      }
    )
  }

  async listarUsuariosPorPerfil(perfilId: string): Promise<UsuarioEntity[]> {
    const usuarios: (PessoaUsuarioInterface & { pessoa: PessoaInterface })[] =
      await prisma.usuario.findMany({
        where: { perfilId, ativo: true },
        include: { pessoa: true },
      })

    if (usuarios.length === 0) {
      return []
    }

    return usuarios.map(
      (usuario: PessoaUsuarioInterface & { pessoa: PessoaInterface }) => {
        return new UsuarioEntity(
          usuario.id,
          usuario.email,
          usuario.senha,
          usuario.ativo,
          new Date(usuario.criadoEm),
          new Date(usuario.atualizadoEm),
          usuario.pessoa.id,
          usuario.pessoa.nome,
          usuario.perfilId,
          usuario.empresaId
        )
      }
    )
  }
}

export default UsuarioRepository
