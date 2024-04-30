export interface ModuloInterface {
  id: string
  nome: string
  url: string
}

export interface ModuloEmpresaInteface {
  empresaId: string
  moduloId: string
}

export interface FuncaoInterface {
  id: string
  nome: string
  url: string
  moduloId: string
  moduloNome: string
}

export interface PerfilPermissaoInteface {
  perfilId: string
  funcaoId: string
}

export interface FuncaoPerfilInterface {
  idFuncao: string
}
