export interface InstrumentoInterface {
  id: string
  codigo: string
  nome: string
  localizacao: string
  marca: string
  resolucao: string
  frequencia: number
  repeticao: number
  empresaId: string
  criadoEm: Date
  atualizacao: Date
  excluido: boolean
}

export interface CalibracaoInterface {
  id: string
  numeroCertificado: string
  erroEncontrado: string
  incertezaTendenciaEncontrado: string
  toleranciaEstabelicida: string
  observacao: string | null
  certificado: string
  status: string
  realizadoEm: Date
  criadoEm: Date
  atualizadoEm: Date
  excluido: boolean
  usuarioId: string
  instrumentoId: string
}

export interface AgendaInstrumentoInterface {
  id: string
  agendadoPara: Date
  instrumentoId: string
}

export interface FiltrosRelatorioPropsInterface {
  status?: string
  calibradoDe?: Date
  calibradoAte?: Date
  codigoInstrumento?: string
  localizacaoInstrumento?: string
}
