import UsuarioEntity from '../entities/UsuarioEntity'
import { RespostaAutenticacaoInterface } from '../interfaces/ResponseInterface'

export type AutenticacaoUsuarioType = {
  id: string
  cliente: string
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

  async autenticar(): Promise<RespostaAutenticacaoInterface> {
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
        usuarioEntity.getSenha(),
      ))
    ) {
      return {
        status: false,
        msg: 'Senha incorreta',
      }
    }

    return {
      status: true,
      msg: 'Usuário autenticado',
      payload: {
        id: usuarioEntity.getId(),
        cliente: usuarioEntity.getEmpresaId(),
      },
    }
  }
}

export default Autenticacao
