import UsuarioEntity from '../entities/UsuarioEntity'
import type { RespostaAutenticacaoInterface } from '../interfaces/ResponseInterface'
import PerfilEntity from './PerfilEntity'

export type AutenticacaoUsuarioType = {
  id: string
  cliente: string
  isAdmin: boolean
}

class Autenticacao {
  private email: string
  private senha: string

  constructor(email: string, senha: string) {
    this.email = email
    this.senha = senha
  }

  private async recuperarDadosUsuario(): Promise<UsuarioEntity> {
    const usuarioEntity = new UsuarioEntity()

    return await usuarioEntity.recuperarDadosUsuarioPorEmail(this.email)
  }

  async autenticar(
    adminAuth?: boolean
  ): Promise<RespostaAutenticacaoInterface> {
    const usuarioEntity = await this.recuperarDadosUsuario()

    if (!usuarioEntity) {
      return {
        status: false,
        msg: 'Usuário não encontrado',
      }
    }

    if (
      !(await usuarioEntity.compararSenhaCriptografada(
        this.senha,
        usuarioEntity.getSenha()
      ))
    ) {
      return {
        status: false,
        msg: 'Senha incorreta',
      }
    }

    if (adminAuth) {
      const perfil = new PerfilEntity()
      const perfilDados = await perfil.buscarPerfilPorId(
        usuarioEntity.getPerfilId()
      )

      if (!perfilDados.isAdministrativo()) {
        return {
          status: false,
          msg: 'Usuário não possui permissão administrativa',
        }
      }
    }

    return {
      status: true,
      msg: 'Usuário autenticado',
      payload: {
        id: usuarioEntity.getId(),
        cliente: usuarioEntity.getEmpresaId(),
        isAdmin: adminAuth,
      },
    }
  }
}

export default Autenticacao
