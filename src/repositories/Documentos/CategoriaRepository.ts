import { prisma } from "../../services/PrismaClientService"

type NovaCategoriaDocumentoEmpresaProps = {
  nome: string
  empresaId: string
}

export async function novaCategoriaEmpresa(categorias: Array<NovaCategoriaDocumentoEmpresaProps>){
  await prisma.categoriasDocumento.createMany({
    data: categorias
  })
}

export async function listarCategoriasDocumentoEmpresa(empresaId: string) {
  const categorias = await prisma.categoriasDocumento.findMany({
    where: {
      empresaId
    }
  })

  return categorias
}

export async function excluirCategoriaDocumento(categoriaId: string) {
  await prisma.categoriasDocumento.delete({
    where: {
      id: categoriaId
    }
  })
}