import bcrypt from 'bcrypt'

import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import UsuarioRepository from '../repositories/UsuarioRepository'

import EmpresaEntity from './EmpresaEntity'
import PerfilEntity from './PerfilEntity'
import PessoaEntity from './PessoaEntity'

class UsuarioEntity extends PessoaEntity {
  private usuarioId: string
  private email: string
  private senha: string
  private ativo: boolean
  private criadoEm: Date
  private atualizadoEm: Date
  private perfilId: string
  private empresaId: string
  private usuarioRepository: UsuarioRepository

  constructor(
    id?: string,
    email?: string,
    senha?: string,
    ativo?: boolean,
    criadoEm?: Date,
    atualizadoEm?: Date,
    pessoaId?: string,
    nomePessoa?: string,
    perfilId?: string,
    empresaId?: string
  ) {
    super(pessoaId, nomePessoa)

    this.usuarioId = id || ''
    this.email = email || ''
    this.senha = senha || ''
    this.ativo = ativo || false
    this.criadoEm = criadoEm || new Date()
    this.atualizadoEm = atualizadoEm || new Date()
    this.perfilId = perfilId || ''
    this.empresaId = empresaId || ''

    this.usuarioRepository = new UsuarioRepository(this)
  }

  getId(): string {
    return this.usuarioId
  }

  getEmail(): string {
    return this.email
  }

  getSenha(): string {
    return this.senha
  }

  isAtivo(): boolean {
    return this.ativo
  }

  getCriadoEm(): Date {
    return this.criadoEm
  }

  getAtualizadoEm(): Date {
    return this.atualizadoEm
  }

  getPerfilId(): string {
    return this.perfilId
  }

  getEmpresaId(): string {
    return this.empresaId
  }

  private getSenhaCriptografada(senha: string): string {
    return bcrypt.hashSync(senha, 8)
  }

  public async compararSenhaCriptografada(
    senhaInformada: string,
    senhaAntiga: string
  ): Promise<boolean> {
    return await bcrypt.compare(senhaInformada, senhaAntiga)
  }

  async cadastrarUsuario(): Promise<RespostaRequisicaoInterface> {
    const verificaExisteUsuario: UsuarioEntity =
      await this.usuarioRepository.buscarUsuarioPorEmail(this.email)

    if (verificaExisteUsuario.getId() !== '') {
      return {
        status: false,
        msg: 'Já existe um usuário cadastrado com esse e-mail',
      }
    }

    const perfilEntity: PerfilEntity = new PerfilEntity()
    const verficaExistePerfil = await perfilEntity.buscarPerfilPorId(
      this.getPerfilId()
    )

    if (verficaExistePerfil.getId() === '')
      return {
        status: false,
        msg: 'O perfil informado não existe',
      }

    const empresaEntity: EmpresaEntity = new EmpresaEntity()
    const verificaExisteEmpresa =
      await empresaEntity.recuperarDadosEmpresaPorId(this.getEmpresaId())

    if (verificaExisteEmpresa.getIdEmpresa() === '')
      return {
        status: false,
        msg: 'A empresa informada não existe',
      }
    const senhaCriptografada: string = await this.getSenhaCriptografada(
      this.senha
    )

    this.senha = senhaCriptografada

    const cadastraPessoa = await this.cadastrarPessoa()

    if (!cadastraPessoa.status) return cadastraPessoa

    this.setIdPessoa(cadastraPessoa.msg)

    return await this.usuarioRepository.criarUsuario()
  }

  async editarUsuario(id: string): Promise<RespostaRequisicaoInterface> {
    const verificaExisteEmailUsuario: UsuarioEntity =
      await this.usuarioRepository.buscarUsuarioPorEmail(this.email)

    if (verificaExisteEmailUsuario.getId() !== id) {
      return {
        status: false,
        msg: 'Existe usuário cadastrado com esse e-mail',
      }
    }

    const verificaExisteUsuario =
      await this.usuarioRepository.buscarUsuarioPorId(id)

    if (verificaExisteUsuario.getId() === '') {
      return {
        status: false,
        msg: 'Usuário não encontrado',
      }
    }

    this.setIdPessoa(verificaExisteUsuario.getIdPessoa())

    const alteraNomePessoa = await this.modificarPessoa()

    if (!alteraNomePessoa.status) return alteraNomePessoa

    return await this.usuarioRepository.atualizarUsuario(id)
  }

  async desativarUsuario(id: string): Promise<RespostaRequisicaoInterface> {
    const verificaExisteIdUsuario: UsuarioEntity =
      await this.usuarioRepository.buscarUsuarioPorId(id)

    if (verificaExisteIdUsuario.getId() === '') {
      return {
        status: false,
        msg: 'Usuario não encontrado',
      }
    }

    if (!verificaExisteIdUsuario.isAtivo()) {
      return {
        status: false,
        msg: 'Usuario já foi desativado',
      }
    }

    return await this.usuarioRepository.desativarUsuario(id)
  }

  async ativarUsuario(id: string): Promise<RespostaRequisicaoInterface> {
    const verificaExisteIdUsuario: UsuarioEntity =
      await this.usuarioRepository.buscarUsuarioPorId(id)

    if (verificaExisteIdUsuario.getId() === '') {
      return {
        status: false,
        msg: 'Usuario não encontrado',
      }
    }

    if (verificaExisteIdUsuario.isAtivo()) {
      return {
        status: false,
        msg: 'Usuario já está ativo',
      }
    }

    return await this.usuarioRepository.ativarUsuario(id)
  }

  async recuperarDadosUsuarioPorId(id: string): Promise<UsuarioEntity> {
    return await this.usuarioRepository.buscarUsuarioPorId(id)
  }

  async recuperarDadosUsuarioPorEmail(email: string): Promise<UsuarioEntity> {
    return await this.usuarioRepository.buscarUsuarioPorEmail(email)
  }

  async recuperarTodosUsuariosEmpresa(
    empresaId: string
  ): Promise<UsuarioEntity[]> {
    return await this.usuarioRepository.listarUsuariosEmpresa(empresaId)
  }

  async recuperarUsuariosPorPerfil(perfilId: string): Promise<UsuarioEntity[]> {
    return await this.usuarioRepository.listarUsuariosPorPerfil(perfilId)
  }

  async alterarSenha(
    id: string,
    senhaAntiga: string
  ): Promise<RespostaRequisicaoInterface> {
    const verificaExisteUsuario = await this.recuperarDadosUsuarioPorId(id)

    if (verificaExisteUsuario.getId() === '') {
      return {
        status: false,
        msg: 'Usuário não encontrado',
      }
    }

    if (
      !(await this.compararSenhaCriptografada(
        senhaAntiga,
        verificaExisteUsuario.getSenha()
      ))
    ) {
      return {
        status: false,
        msg: 'Senha antiga incorreta',
      }
    }

    const senhaCriptografada: string = await this.getSenhaCriptografada(
      this.senha
    )

    this.senha = senhaCriptografada

    return this.usuarioRepository.atualizarSenhaUsuario(id)
  }
}

export default UsuarioEntity
