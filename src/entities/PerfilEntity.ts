import { PerfilInterface } from '../interfaces/PerfilInterface'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import PerfilRepository from '../repositories/PerfilRepository'

import UsuarioEntity from './UsuarioEntity'

class PerfilEntity {
  private id: string
  private nome: string
  private administrativo: boolean

  private perfilRepository: PerfilRepository

  constructor(id?: string | null, nome?: string, administrativo?: boolean) {
    this.id = id || ''
    this.nome = nome || ''
    this.administrativo = administrativo || false

    this.perfilRepository = new PerfilRepository(this)
  }

  getId(): string {
    return this.id
  }

  getNome(): string {
    return this.nome
  }

  isAdministrativo(): boolean {
    return this.administrativo
  }

  async cadastrarPerfil(empresa: string): Promise<RespostaRequisicaoInterface> {
    return await this.perfilRepository.criarPerfil(empresa)
  }

  async atualizarPerfil(id: string): Promise<RespostaRequisicaoInterface> {
    const verificaPerfilExiste = await this.buscarPerfilPorId(id)

    if (verificaPerfilExiste.getId() === '' || !verificaPerfilExiste)
      return {
        status: false,
        msg: 'Perfil não encontrado, tente novamente!',
      }

    return await this.perfilRepository.atualizarPerfil(id)
  }

  async excluirPerfil(id: string): Promise<RespostaRequisicaoInterface> {
    const verificaPerfilExiste = await this.buscarPerfilPorId(id)

    if (verificaPerfilExiste.getId() === '' || !verificaPerfilExiste)
      return {
        status: false,
        msg: 'Perfil não encontrado, tente novamente!',
      }

    const usuarioEntity = new UsuarioEntity()
    const verificaUsuarioVinculadoPerfil =
      await usuarioEntity.recuperarUsuariosPorPerfil(id)

    if (verificaUsuarioVinculadoPerfil.length > 0) {
      return {
        status: false,
        msg: 'Não é possível excluir o perfil, pois tem vinculo com um ou mais usuarios!',
      }
    }

    return await this.perfilRepository.excluirPerfil(id)
  }

  async listarPerfilEmpresa(empresaId: string): Promise<PerfilInterface[]> {
    return await this.perfilRepository.listarPerfilempresa(empresaId)
  }

  async buscarPerfilPorId(id: string): Promise<PerfilEntity> {
    return await this.perfilRepository.buscarPerfilPorId(id)
  }

  async vincularPermissoesFuncaoPerfil(
    perfilId: string,
    funcaoId: string,
  ): Promise<RespostaRequisicaoInterface> {
    return await this.perfilRepository.vincularPermissoesFuncaoPerfil(
      perfilId,
      funcaoId,
    )
  }

  async desvincularPermissoesFuncaoPerfil(
    perfilId: string,
    funcaoId: string,
  ): Promise<RespostaRequisicaoInterface> {
    return await this.perfilRepository.desvincularPermissoesFuncaoPerfil(
      perfilId,
      funcaoId,
    )
  }

  async buscarModulosPerfil(perfilId: string) {
    return await this.perfilRepository.buscarModulosPerfil(perfilId)
  }

  async verificarPermissaoPerfil(perfilId: string, funcaoId: string) {
    return await this.perfilRepository.verificarPermissaoFuncaoPerfil(
      perfilId,
      funcaoId,
    )
  }
}

export default PerfilEntity
