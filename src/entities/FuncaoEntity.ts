import { FuncaoInterface } from '../interfaces/ModulosSistemaInterface'
import { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import FuncaoRepository from '../repositories/FuncaoRepository'

import ModuloEntity from './ModuloEntity'

class FuncaoEntity extends ModuloEntity {
  private idFuncao: string
  private nomeFuncao: string
  private urlFuncao: string

  private funcaoRepository: FuncaoRepository

  constructor(
    idFuncao?: string,
    nomeFuncao?: string,
    urlFuncao?: string,
    idModulo?: string,
    nomeModulo?: string,
    urlModulo?: string,
  ) {
    super(idModulo, nomeModulo, urlModulo)

    this.idFuncao = idFuncao || ''
    this.nomeFuncao = nomeFuncao || ''
    this.urlFuncao = urlFuncao || ''

    this.funcaoRepository = new FuncaoRepository(this)
  }

  getIdFuncao(): string {
    return this.idFuncao
  }

  setIdFuncao(idFuncao: string): void {
    this.idFuncao = idFuncao
  }

  getNomeFuncao(): string {
    return this.nomeFuncao
  }

  setNomeFuncao(nomeFuncao: string): void {
    this.nomeFuncao = nomeFuncao
  }

  getUrlFuncao(): string {
    return this.urlFuncao
  }

  setUrlFuncao(urlFuncao: string): void {
    this.urlFuncao = urlFuncao
  }

  async cadastrarFuncao(): Promise<RespostaRequisicaoInterface> {
    return await this.funcaoRepository.inserirFuncao()
  }

  async atualizarFuncao(id: string): Promise<RespostaRequisicaoInterface> {
    const verificaExiteFuncao = await this.buscarFuncao(id)

    if (verificaExiteFuncao.getIdFuncao() === '') {
      return {
        status: false,
        msg: 'Funcao não encontrada',
      }
    }

    return await this.funcaoRepository.atualizarFuncao(id)
  }

  async listarFuncaoModulo(moduloId: string): Promise<FuncaoEntity[]> {
    return await this.funcaoRepository.listarFuncaoModulo(moduloId)
  }

  async buscarFuncao(id: string): Promise<FuncaoEntity> {
    return await this.funcaoRepository.buscarFuncao(id)
  }

  async listarPermissaoFuncaoPerfil(
    idPerfil: string,
  ): Promise<FuncaoInterface[]> {
    return await this.funcaoRepository.listarFuncoesPermitidosPerfil(idPerfil)
  }

  async listarFuncoesModuloPerfil(idPerfil: string, idModulo: string) {
    return await this.funcaoRepository.listarFuncoesModuloPerfil(
      idPerfil,
      idModulo,
    )
  }
}

export default FuncaoEntity
