import {
  AnexoFornecedorProps,
  EnderecoFornecedorProps,
  NovaAvaliacaoFornecedorProps,
  NovoFornecedorProps,
  TelefoneFornecedorProps,
} from '../../interfaces/Compras/FornecedorInterface'
import { prisma } from '../../services/PrismaClientService'

import { ConsultaFornecedorProps } from './../../interfaces/Compras/FornecedorInterface'

interface empresaProps {
  empresaId: string
}

interface edicaoEnderecoFornecedorProps {
  idFornecedor: string
  empresaId: string
  endereco: EnderecoFornecedorProps
}

interface exclusaoDadosFornecedorProps {
  id: string
  idFornecedor?: string
  empresaId: string
}

interface novoTelefoneProps {
  idFornecedor: string
  empresaId: string
  telefone: TelefoneFornecedorProps
}

interface novoEmailProps {
  idFornecedor: string
  empresaId: string
  email: string
}

interface novoAnexoProps {
  idFornecedor: string
  empresaId: string
  anexo: AnexoFornecedorProps
}

export async function cadastrarFornecedor({
  nome,
  documento,
  critico,
  aprovado,
  empresaId,
  enderecoFornecedor,
  telefoneFornecedor,
  emailFornecedor,
  anexos,
}: NovoFornecedorProps) {
  const insereFornecedor = await prisma.pessoa.create({
    select: {
      nome: true,
      Fornecedor: {
        select: {
          id: true,
          documento: true,
          critico: true,
          aprovado: true,
          desempenho: true,
        },
      },
    },
    data: {
      nome,
      Endereco: {
        create: {
          logradouro: enderecoFornecedor.logradouro,
          numero: enderecoFornecedor.numero,
          bairro: enderecoFornecedor.bairro,
          cidade: enderecoFornecedor.cidade,
          estado: enderecoFornecedor.estado,
          cep: enderecoFornecedor.cep,
          complemento: enderecoFornecedor.complemento,
        },
      },
      TelefonePessoa: {
        createMany: {
          data: telefoneFornecedor,
        },
      },
      EmailPessoa: {
        createMany: {
          data: emailFornecedor,
        },
      },
      Fornecedor: {
        create: {
          empresaId,
          critico,
          aprovado,
          documento,
          DocumentosFornecedor: {
            createMany: {
              data: anexos,
            },
          },
        },
      },
    },
  })

  return {
    id: insereFornecedor.Fornecedor?.id,
    nome: insereFornecedor.nome,
    documento: insereFornecedor.Fornecedor?.documento,
    critico: insereFornecedor.Fornecedor?.critico,
    aprovado: insereFornecedor.Fornecedor?.aprovado,
    desempenho: insereFornecedor.Fornecedor?.desempenho,
  }
}

export async function salvarAvaliacaoFornecedor({
  fornecedorId,
  nota,
  validade,
  aprovado,
  usuarioId,
}: NovaAvaliacaoFornecedorProps) {
  const avaliacaoFornecedor = prisma.avaliacoesFornecedor.create({
    data: {
      fornecedorId,
      usuarioId,
      nota,
      validade,
      aprovado,
    },
  })

  const atualizaStatusFornecedor = prisma.fornecedor.update({
    where: {
      id: fornecedorId,
    },
    data: {
      aprovado,
      ultimaAvaliacao: new Date(),
    },
  })

  await prisma.$transaction([avaliacaoFornecedor, atualizaStatusFornecedor])
}

export async function recuperarFornecedoresEmpresa({
  empresaId,
}: empresaProps) {
  const listaFornecedores = await prisma.fornecedor.findMany({
    select: {
      id: true,
      pessoa: {
        select: {
          nome: true,
        },
      },
      documento: true,
      critico: true,
      aprovado: true,
      desempenho: true,
    },
    where: {
      empresaId,
      excluido: false,
    },
  })

  return listaFornecedores.map((fornecedor) => {
    return {
      id: fornecedor.id,
      nome: fornecedor.pessoa.nome,
      documento: fornecedor.documento,
      critico: fornecedor.critico,
      aprovado: fornecedor.aprovado,
      desempenho: fornecedor.desempenho,
    }
  })
}

export async function recuperarDadosFornecedor({
  id,
  empresaId,
}: ConsultaFornecedorProps) {
  const dadosFornecedor = await prisma.fornecedor.findUniqueOrThrow({
    select: {
      id: true,
      pessoa: {
        select: {
          nome: true,
          Endereco: true,
          EmailPessoa: true,
          TelefonePessoa: true,
        },
      },
      documento: true,
      desempenho: true,
      ultimaAvaliacao: true,
      critico: true,
      aprovado: true,
    },
    where: {
      id,
      empresaId,
      excluido: false,
    },
  })

  return {
    id: dadosFornecedor.id,
    nome: dadosFornecedor.pessoa.nome,
    documento: dadosFornecedor.documento,
    desempenho: dadosFornecedor.desempenho,
    ultimaAvaliacao: dadosFornecedor.ultimaAvaliacao,
    critico: dadosFornecedor.critico,
    aprovado: dadosFornecedor.aprovado,
    endereco: {
      id: dadosFornecedor.pessoa.Endereco?.id,
      logradouro: dadosFornecedor.pessoa.Endereco?.logradouro,
      numero: dadosFornecedor.pessoa.Endereco?.numero,
      bairro: dadosFornecedor.pessoa.Endereco?.bairro,
      cidade: dadosFornecedor.pessoa.Endereco?.cidade,
      estado: dadosFornecedor.pessoa.Endereco?.estado,
      cep: dadosFornecedor.pessoa.Endereco?.cep,
      complemento: dadosFornecedor.pessoa.Endereco?.complemento,
    },
    telefones: dadosFornecedor.pessoa.TelefonePessoa.map((telefone) => {
      return {
        id: telefone.id,
        codigoArea: telefone.codigoArea,
        numero: telefone.numero,
      }
    }),
    emails: dadosFornecedor.pessoa.EmailPessoa.map((email) => {
      return {
        id: email.id,
        email: email.email,
      }
    }),
  }
}

export async function recuperarDocumentosFornecedor({
  id,
  empresaId,
}: ConsultaFornecedorProps) {
  const documentosFornecedor = await prisma.documentosFornecedor.findMany({
    where: {
      fornecedorId: id,
      fornecedor: {
        empresaId,
      },
    },
  })

  return documentosFornecedor.map((documento) => {
    return {
      id: documento.id,
      nome: documento.nome,
      arquivo: documento.arquivo,
    }
  })
}

export async function recuperarAvaliacoesFornecedor({
  id,
  empresaId,
}: ConsultaFornecedorProps) {
  const avaliacoesFornecedor = await prisma.avaliacoesFornecedor.findMany({
    where: {
      fornecedorId: id,
      fornecedor: {
        empresaId,
      },
    },
    select: {
      id: true,
      usuario: {
        select: {
          pessoa: {
            select: {
              nome: true,
            },
          },
        },
      },
      nota: true,
      validade: true,
      aprovado: true,
      avaliadoEm: true,
    },
    orderBy: {
      avaliadoEm: 'asc',
    },
  })

  return avaliacoesFornecedor.map((avaliacao) => {
    return {
      id: avaliacao.id,
      usuario: avaliacao.usuario.pessoa.nome,
      nota: avaliacao.nota,
      validade: avaliacao.validade,
      aprovado: avaliacao.aprovado,
      avaliadoEm: avaliacao.avaliadoEm,
    }
  })
}

export async function recuperarAvaliacoesEntregaFornecedor({
  id,
}: ConsultaFornecedorProps) {
  const avaliacoesEntregaFornecedor =
    await prisma.desempenhoFornecedor.findMany({
      where: {
        fornecedorId: id,
      },
      select: {
        id: true,
        nota: true,
        cadastradoEm: true,
      },
      orderBy: {
        cadastradoEm: 'desc',
      },
    })

  return avaliacoesEntregaFornecedor.map((avaliacao) => {
    return {
      id: avaliacao.id,
      nota: avaliacao.nota,
      avaliadoEm: avaliacao.cadastradoEm,
    }
  })
}

export async function removerFornecedor({
  id,
  empresaId,
}: ConsultaFornecedorProps) {
  return await prisma.fornecedor.update({
    data: {
      excluido: true,
    },
    where: {
      id,
      empresaId,
    },
  })
}

export async function salvarEndereco({
  empresaId,
  idFornecedor,
  endereco,
}: edicaoEnderecoFornecedorProps) {
  return await prisma.endereco.update({
    where: {
      id: endereco.id,
      Pessoa: {
        Fornecedor: {
          id: idFornecedor,
          empresaId,
        },
      },
    },
    data: {
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      complemento: endereco.complemento,
    },
  })
}

export async function adicionarNovoTelefone({
  empresaId,
  idFornecedor,
  telefone,
}: novoTelefoneProps) {
  const dadosFornecedor = await prisma.fornecedor.findUniqueOrThrow({
    where: {
      id: idFornecedor,
      empresaId,
    },
  })

  return await prisma.telefonePessoa.create({
    data: {
      pessoaId: dadosFornecedor.pessoaId,
      codigoArea: telefone.codigoArea,
      numero: telefone.numero,
    },
  })
}

export async function removerTelefone({
  id,
  empresaId,
}: exclusaoDadosFornecedorProps) {
  return await prisma.telefonePessoa.delete({
    where: {
      id,
      pessoa: {
        Fornecedor: {
          empresaId,
        },
      },
    },
  })
}

export async function adicionarNovoEmail({
  email,
  empresaId,
  idFornecedor,
}: novoEmailProps) {
  const dadosFornecedor = await prisma.fornecedor.findUniqueOrThrow({
    where: {
      id: idFornecedor,
      empresaId,
    },
  })

  return await prisma.emailPessoa.create({
    data: {
      pessoaId: dadosFornecedor.pessoaId,
      email,
    },
  })
}

export async function removerEmail({
  id,
  empresaId,
}: exclusaoDadosFornecedorProps) {
  return await prisma.emailPessoa.delete({
    where: {
      id,
      pessoa: {
        Fornecedor: {
          empresaId,
        },
      },
    },
  })
}

export async function adicionarNovoAnexo({
  anexo,
  empresaId,
  idFornecedor,
}: novoAnexoProps) {
  const dadosFornecedor = await prisma.fornecedor.findUniqueOrThrow({
    where: {
      id: idFornecedor,
      empresaId,
    },
  })

  return await prisma.documentosFornecedor.create({
    select: {
      id: true,
      nome: true,
      arquivo: true,
    },
    data: {
      fornecedorId: dadosFornecedor.id,
      nome: anexo.nome,
      arquivo: anexo.arquivo,
    },
  })
}

export async function removerAnexo({
  id,
  empresaId,
}: exclusaoDadosFornecedorProps) {
  return await prisma.documentosFornecedor.delete({
    where: {
      id,
      fornecedor: {
        empresaId,
      },
    },
  })
}
