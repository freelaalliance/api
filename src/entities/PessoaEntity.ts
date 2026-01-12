import type { RespostaRequisicaoInterface } from '../interfaces/ResponseInterface'
import PessoaRepository from '../repositories/PessoaRepository'

class PessoaEntity {
  protected id: string
  protected nome: string
  private pessoaRepository: PessoaRepository

  constructor(id?: string, nome?: string | null) {
    this.id = id || ''
    this.nome = nome || ''

    this.pessoaRepository = new PessoaRepository(this)
  }

  setIdPessoa(id: string) {
    this.id = id
  }

  getIdPessoa(): string {
    return this.id
  }

  setNomePessoa(nome: string) {
    this.nome = nome
  }

  getNomePessoa(): string {
    return this.nome
  }

  protected async cadastrarPessoa(): Promise<RespostaRequisicaoInterface> {
    return await this.pessoaRepository.criarPessoa()
  }

  protected async modificarPessoa(): Promise<RespostaRequisicaoInterface> {
    return await this.pessoaRepository.editarPessoa()
  }

  protected async recuperarDadosPessoa(): Promise<PessoaEntity> {
    if (this.id !== '') {
      return new PessoaEntity()
    }

    return await this.pessoaRepository.buscarPessoa(this.id)
  }

  removerCaracteresEspecialDocumento(documento: string): string {
    return documento.replace(/[^0-9]/g, '')
  }

  validarCNPJ(cnpj: string): boolean {
    const cnpjApenasNumero = cnpj.replace(/[^\d]+/g, '')

    if (cnpjApenasNumero === '') return false

    if (cnpjApenasNumero.length !== 14) return false

    if (
      cnpjApenasNumero === '00000000000000' ||
      cnpjApenasNumero === '11111111111111' ||
      cnpjApenasNumero === '22222222222222' ||
      cnpjApenasNumero === '33333333333333' ||
      cnpjApenasNumero === '44444444444444' ||
      cnpjApenasNumero === '55555555555555' ||
      cnpjApenasNumero === '66666666666666' ||
      cnpjApenasNumero === '77777777777777' ||
      cnpjApenasNumero === '88888888888888' ||
      cnpjApenasNumero === '99999999999999'
    )
      return false

    let tamanho = cnpjApenasNumero.length - 2
    let numeros = cnpjApenasNumero.substring(0, tamanho)
    const digitos = cnpjApenasNumero.substring(tamanho)
    let soma = 0
    let pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--
      if (pos < 2) pos = 9
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== Number(digitos.charAt(0))) return false

    tamanho = tamanho + 1
    numeros = cnpjApenasNumero.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7
    for (let i = tamanho; i >= 1; i--) {
      soma += Number(numeros.charAt(tamanho - i)) * pos--
      if (pos < 2) pos = 9
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
    if (resultado !== Number(digitos.charAt(1))) return false

    return true
  }
}

export default PessoaEntity
