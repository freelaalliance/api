import { prisma } from "../../services/PrismaClientService";

type NovoDocumentoFormType = {
  nome: string;
  descricaoDocumento: string;
  copias: number;
  recuperacao: string;
  elegibilidade: string;
  disposicao: string;
  retencao: Date;
  uso: string;
  categoriaDocumento: string;
  usuariosAcessos: {
    id: string;
    nome: string;
    email: string;
  }[];
  arquivo: string;
  empresaId: string;
  usuarioId: string;
}

type NovaRevisaoDocumentoFormType = {
  id: string;
  arquivo: string;
  empresaId: string;
  usuarioId: string;
}

export async function getQtdRevisoesDocumento({ documentoId, empresaId }: { documentoId: string, empresaId: string }) {
  return await prisma.revisoes.count({
    where: {
      documentoId,
      documentos: {
        empresaId
      }
    }
  })
}

export async function cadastrarDocumento(documento: NovoDocumentoFormType) {

  const arquivoDocumento = await prisma.arquivos.create({
    data: {
      nome: documento.nome,
      url: documento.arquivo,
    }
  })

  return await prisma.documentos.create({
    data: {
      nome: documento.nome,
      descricao: documento.descricaoDocumento,
      copias: documento.copias,
      recuperacao: documento.recuperacao,
      presElegibilidade: documento.elegibilidade,
      disposicao: documento.disposicao,
      retencao: documento.retencao,
      uso: documento.uso,
      categoriaDocumentoId: documento.categoriaDocumento,
      empresaId: documento.empresaId,
      usuarioId: documento.usuarioId,
      Revisoes: {
        create: {
          usuarioId: documento.usuarioId,
          numeroRevisao: 1,
          revisadoEm: new Date(),
          arquivoId: arquivoDocumento.id
        },
      },
      UsuarioAcessoDocumentos: {
        createMany: {
          data: documento.usuariosAcessos.map((usuario) => ({
            usuarioId: usuario.id
          }))
        }
      }
    }
  })
}

export async function cadastraRevisaoDocumento({ id, arquivo, empresaId, usuarioId }: NovaRevisaoDocumentoFormType) {
  const qtdRevisoesDocumento = await getQtdRevisoesDocumento({ 
    documentoId: id, 
    empresaId 
  })

  console.log("🚀 ~ cadastraRevisaoDocumento ~ qtdRevisoesDocumento:", qtdRevisoesDocumento)

  const documento = await prisma.documentos.findUniqueOrThrow({
    where: {
      id,
      empresaId
    }
  })

  await prisma.arquivos.create({
    data: {
      nome: documento.nome,
      url: arquivo,
      Revisoes: {
        create: {
          usuarioId,
          numeroRevisao: qtdRevisoesDocumento + 1,
          documentoId: id,
        }
      }
    }
  })
}

export async function getDocumentosEmpresa(empresaId: string) {
  return await prisma.documentos.findMany({
    where: {
      empresaId,
    },
    include: {
      Revisoes: {
        orderBy: {
          numeroRevisao: 'desc'
        },
        include: {
          arquivos: true,
          usuario: {
            include: {
              pessoa: true,
            }
          },
        }
      },
      categoriasDocumento: true,
    }
  })
}

export async function getDocumentosUsuario(usuarioId: string, empresaId: string) {
  return await prisma.documentos.findMany({
    where: {
      UsuarioAcessoDocumentos: {
        some: {
          usuarioId,
          usuario: {
            ativo: true,
          }
        }
      },
      empresaId,
    },
    include: {
      Revisoes: {
        include: {
          arquivos: true,
          usuario: {
            include: {
              pessoa: true,
            }
          },
        },
        orderBy: {
          numeroRevisao: 'desc'
        }
      },
      categoriasDocumento: true,
    }
  })
}

export async function removerDocumentoEmpresa(empresaId: string, documentoId: string) {
  await prisma.documentos.deleteMany({
    where: {
      id: documentoId,
      empresaId,
    }
  })
}

export async function getUsuariosAcessoModuloDocumentos(empresaId: string) {
  return await prisma.usuario.findMany({
    where: {
      empresaId,
      perfil: {
        PerfilPermissaFuncao: {
          some: {
            funcao: {
              url: '/modulo/documentos/[id]/painel',
            }
          }
        }
      },
      empresa: {
        ModuloEmpresa: {
          some: {
            modulo: {
              url: '/modulo/documentos/[id]/painel',
            }
          }
        }
      }
    },
    select: {
      id: true,
      pessoa: {
        select: {
          nome: true,
        }
      },
      email: true,
    }
  })
}