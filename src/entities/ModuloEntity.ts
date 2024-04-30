import { ModuloInterface } from '../interfaces/ModulosSistemaInterface'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import ModuloRepository from '../repositories/ModuloRepository'

class ModuloEntity {
  protected idModulo: string
  protected nomeModulo: string
  protected urlModulo: string

  private moduloRepository: ModuloRepository

  constructor(id?: string, nome?: string, url?: string) {
    this.idModulo = id || ''
    this.nomeModulo = nome || ''
    this.urlModulo = url || ''

    this.moduloRepository = new ModuloRepository(this)
  }

  getIdModulo(): string {
    return this.idModulo
  }

  setIdModulo(idModulo: string): void {
    this.idModulo = idModulo
  }

  getNomeModulo(): string {
    return this.nomeModulo
  }

  setNomeModulo(nomeModulo: string): void {
    this.nomeModulo = nomeModulo
  }

  getUrlModulo(): string {
    return this.urlModulo
  }

  async cadastrarModulo(): Promise<RespostaRequisicaoInterface> {
    return await this.moduloRepository.inserirModulo()
  }

  async atualizarModulo(
    idModulo: string,
  ): Promise<RespostaRequisicaoInterface> {
    const verificaExisteModulo = await this.consultarModulo(idModulo)

    if (verificaExisteModulo.getIdModulo() === '')
      return {
        status: false,
        msg: 'Modulo não encontrado, tente novamente!',
      }

    return await this.moduloRepository.atualizarModulo(idModulo)
  }

  async consultarModulo(idModulo: string): Promise<ModuloEntity> {
    return await this.moduloRepository.buscarModulo(idModulo)
  }

  async consultarTodosModulos(): Promise<Array<ModuloEntity>> {
    return await this.moduloRepository.listarModulos()
  }

  async listarModulosVinculadosEmpresa(
    idEmpresa: string,
  ): Promise<ModuloInterface[]> {
    return await this.moduloRepository.listarModulosEmpresa(idEmpresa)
  }
}

export default ModuloEntity
