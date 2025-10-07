import UsuarioEntity from '../entities/UsuarioEntity'
import type { RespostaAutenticacaoInterface } from '../interfaces/ResponseInterface'
import { prisma } from '../services/PrismaClientService'

export type AutenticacaoAdminType = {
  id: string
  cliente: string
  isAdmin: boolean
}

class AutenticacaoAdmin {
  private email: string
  private senha: string

  constructor(email: string, senha: string) {
    this.email = email
    this.senha = senha
  }

  private async recuperarDadosUsuarioAdmin(): Promise<{
    usuario: UsuarioEntity
    isAdmin: boolean
  } | null> {
    const usuarioEntity = new UsuarioEntity()
    const usuario = await usuarioEntity.recuperarDadosUsuarioPorEmail(this.email)

    if (!usuario || usuario.getId() === '') {
      return null
    }

    // Verificar se o perfil do usuário é administrativo
    const perfil = await prisma.perfil.findUnique({
      where: {
        id: usuario.getPerfilId(),
      },
      select: {
        administrativo: true,
      },
    })

    if (!perfil || !perfil.administrativo) {
      return null
    }

    return {
      usuario,
      isAdmin: perfil.administrativo,
    }
  }

  async autenticar(): Promise<RespostaAutenticacaoInterface> {
    const dadosUsuario = await this.recuperarDadosUsuarioAdmin()

    if (!dadosUsuario) {
      return {
        status: false,
        msg: 'Usuário não encontrado ou não possui perfil administrativo',
      }
    }

    const { usuario, isAdmin } = dadosUsuario

    if (!usuario.isAtivo()) {
      return {
        status: false,
        msg: 'Usuário inativo',
      }
    }

    if (
      !(await usuario.compararSenhaCriptografada(
        this.senha,
        usuario.getSenha(),
      ))
    ) {
      return {
        status: false,
        msg: 'Senha incorreta',
      }
    }

    return {
      status: true,
      msg: 'Administrador autenticado com sucesso',
      payload: {
        id: usuario.getId(),
        cliente: usuario.getEmpresaId(),
        isAdmin,
      },
    }
  }
}

export default AutenticacaoAdmin
