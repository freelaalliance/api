import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { verificarPermissaoAdmin } from '../../middlewares/verificarPermissaoAdmin'
import { prisma } from '../../services/PrismaClientService'

export class ExclusaoController {
  constructor(fastify: FastifyInstance) {
    // Rotas de Calibração
    fastify.register(this.excluirCalibracao, {
      prefix: '/api/admin/calibracao',
    })

    fastify.register(this.excluirInstrumento, {
      prefix: '/api/admin/calibracao/instrumento',
    })

    fastify.register(this.excluirTodasCalibracoes, {
      prefix: '/api/admin/calibracao/empresa',
    })

    fastify.register(this.excluirTodosInstrumentos, {
      prefix: '/api/admin/calibracao/instrumento/empresa',
    })

    // Rotas de Compras
    fastify.register(this.excluirCompra, {
      prefix: '/api/admin/compras',
    })

    fastify.register(this.excluirFornecedor, {
      prefix: '/api/admin/compras/fornecedor',
    })

    fastify.register(this.desativarItemAvaliativoRecebimento, {
      prefix: '/api/admin/compras/recebimento/item-avaliativo',
    })

    fastify.register(this.excluirTodasCompras, {
      prefix: '/api/admin/compras/empresa',
    })

    fastify.register(this.excluirTodosFornecedores, {
      prefix: '/api/admin/compras/fornecedor/empresa',
    })

    // Rotas de Manutenção
    fastify.register(this.cancelarManutencao, {
      prefix: '/api/admin/manutencao',
    })

    fastify.register(this.cancelarTodasManutencoes, {
      prefix: '/api/admin/manutencao/empresa',
    })

    // Rotas de RH
    fastify.register(this.excluirCargo, {
      prefix: '/api/admin/rh/cargo',
    })

    fastify.register(this.excluirTreinamento, {
      prefix: '/api/admin/rh/treinamento',
    })

    fastify.register(this.excluirPlanoTreinamento, {
      prefix: '/api/admin/rh/treinamento/plano',
    })

    fastify.register(this.excluirTodosCargos, {
      prefix: '/api/admin/rh/cargo/empresa',
    })

    fastify.register(this.excluirTodosColaboradores, {
      prefix: '/api/admin/rh/colaborador/empresa',
    })

    // Rotas de Expedição
    fastify.register(this.excluirItemAvaliacaoExpedicao, {
      prefix: '/api/admin/expedicao/item-avaliacao',
    })

    fastify.register(this.excluirTodosItensAvaliacaoExpedicao, {
      prefix: '/api/admin/expedicao/item-avaliacao/empresa',
    })

    // Rotas de Vendas
    fastify.register(this.cancelarVenda, {
      prefix: '/api/admin/vendas',
    })

    fastify.register(this.desativarProdutoServico, {
      prefix: '/api/admin/vendas/produto-servico',
    })

    fastify.register(this.cancelarTodasVendas, {
      prefix: '/api/admin/vendas/empresa',
    })

    // Rotas de Documentos
    fastify.register(this.excluirDocumento, {
      prefix: '/api/admin/documentos',
    })

    fastify.register(this.excluirCategoriaDocumento, {
      prefix: '/api/admin/documentos/categoria',
    })

    fastify.register(this.excluirTodosDocumentos, {
      prefix: '/api/admin/documentos/empresa',
    })

    // Rotas de Clientes
    fastify.register(this.excluirCliente, {
      prefix: '/api/admin/cliente',
    })

    fastify.register(this.excluirTodosClientes, {
      prefix: '/api/admin/cliente/empresa',
    })
  }

  // ==================== CALIBRAÇÃO ====================

  private async excluirCalibracao(app: FastifyInstance) {
    const schemaParams = z.object({
      calibracaoId: z
        .string({
          required_error: 'ID da calibração é obrigatório',
        })
        .uuid({
          message: 'ID da calibração inválido',
        }),
    })

    app.delete(
      '/:calibracaoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { calibracaoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const calibracao = await prisma.calibracao.findFirst({
            where: {
              id: calibracaoId,
              instrumento: {
                empresaId,
              },
            },
          })

          if (!calibracao) {
            return reply.code(404).send({
              status: false,
              msg: 'Calibração não encontrada',
            })
          }

          await prisma.calibracao.update({
            where: { id: calibracaoId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Calibração excluída com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir calibração',
          })
        }
      }
    )
  }

  private async excluirInstrumento(app: FastifyInstance) {
    const schemaParams = z.object({
      instrumentoId: z
        .string({
          required_error: 'ID do instrumento é obrigatório',
        })
        .uuid({
          message: 'ID do instrumento inválido',
        }),
    })

    app.delete(
      '/:instrumentoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { instrumentoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const instrumento = await prisma.instrumento.findFirst({
            where: {
              id: instrumentoId,
              empresaId,
            },
          })

          if (!instrumento) {
            return reply.code(404).send({
              status: false,
              msg: 'Instrumento não encontrado',
            })
          }

          await prisma.instrumento.update({
            where: { id: instrumentoId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Instrumento excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir instrumento',
          })
        }
      }
    )
  }

  private async excluirTodasCalibracoes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.calibracao.updateMany({
            where: {
              instrumento: {
                empresaId,
              },
              excluido: false,
            },
            data: { excluido: true },
          })

          const resultInstrumento = await prisma.instrumento.updateMany({
            where: {
              empresaId,
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} calibração(ões) e ${resultInstrumento.count} instrumento(s) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir calibrações',
          })
        }
      }
    )
  }

  private async excluirTodosInstrumentos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.instrumento.updateMany({
            where: {
              empresaId,
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} instrumento(s) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir instrumentos',
          })
        }
      }
    )
  }

  // ==================== COMPRAS ====================

  private async excluirCompra(app: FastifyInstance) {
    const schemaParams = z.object({
      compraId: z
        .string({
          required_error: 'ID da compra é obrigatório',
        })
        .uuid({
          message: 'ID da compra inválido',
        }),
    })

    app.delete(
      '/:compraId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { compraId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const compra = await prisma.compras.findFirst({
            where: {
              id: compraId,
              fornecedor: {
                empresaId,
              },
            },
          })

          if (!compra) {
            return reply.code(404).send({
              status: false,
              msg: 'Compra não encontrada',
            })
          }

          await prisma.compras.update({
            where: { id: compraId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Compra excluída com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir compra',
          })
        }
      }
    )
  }

  private async excluirFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      fornecedorId: z
        .string({
          required_error: 'ID do fornecedor é obrigatório',
        })
        .uuid({
          message: 'ID do fornecedor inválido',
        }),
    })

    app.delete(
      '/:fornecedorId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { fornecedorId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const fornecedor = await prisma.fornecedor.findFirst({
            where: {
              id: fornecedorId,
              empresaId,
            },
          })

          if (!fornecedor) {
            return reply.code(404).send({
              status: false,
              msg: 'Fornecedor não encontrado',
            })
          }

          await prisma.fornecedor.update({
            where: { id: fornecedorId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Fornecedor excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir fornecedor',
          })
        }
      }
    )
  }

  private async excluirTodosFornecedores(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.fornecedor.updateMany({
            where: {
              empresaId,
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} fornecedor(es) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir fornecedores',
          })
        }
      }
    )
  }

  private async desativarItemAvaliativoRecebimento(app: FastifyInstance) {
    const schemaParams = z.object({
      itemId: z
        .string({
          required_error: 'ID do item avaliativo é obrigatório',
        })
        .uuid({
          message: 'ID do item avaliativo inválido',
        }),
    })

    app.delete(
      '/:itemId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { itemId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const item = await prisma.itensAvaliativosRecebimentoEmpresa.findFirst({
            where: {
              id: itemId,
              empresaId,
            },
          })

          if (!item) {
            return reply.code(404).send({
              status: false,
              msg: 'Item avaliativo não encontrado',
            })
          }

          await prisma.itensAvaliativosRecebimentoEmpresa.update({
            where: { id: itemId },
            data: { ativo: false },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Item avaliativo desativado com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao desativar item avaliativo',
          })
        }
      }
    )
  }

  private async excluirTodasCompras(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.compras.updateMany({
            where: {
              fornecedor: {
                empresaId,
              },
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} compra(s) excluída(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir compras',
          })
        }
      }
    )
  }

  // ==================== MANUTENÇÃO ====================

  private async cancelarManutencao(app: FastifyInstance) {
    const schemaParams = z.object({
      manutencaoId: z
        .string({
          required_error: 'ID da manutenção é obrigatório',
        })
        .uuid({
          message: 'ID da manutenção inválido',
        }),
    })

    app.delete(
      '/:manutencaoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { manutencaoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const manutencao = await prisma.manutencao.findFirst({
            where: {
              id: manutencaoId,
              equipamento: {
                empresaId,
              },
            },
          })

          if (!manutencao) {
            return reply.code(404).send({
              status: false,
              msg: 'Manutenção não encontrada',
            })
          }

          if (manutencao.canceladoEm) {
            return reply.code(400).send({
              status: false,
              msg: 'Manutenção já está cancelada',
            })
          }

          await prisma.manutencao.update({
            where: { id: manutencaoId },
            data: { canceladoEm: new Date() },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Manutenção cancelada com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao cancelar manutenção',
          })
        }
      }
    )
  }

  private async cancelarTodasManutencoes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.manutencao.updateMany({
            where: {
              equipamento: {
                empresaId,
              },
              canceladoEm: null,
            },
            data: { canceladoEm: new Date() },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} manutenção(ões) cancelada(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao cancelar manutenções',
          })
        }
      }
    )
  }

  // ==================== RH ====================

  private async excluirCargo(app: FastifyInstance) {
    const schemaParams = z.object({
      cargoId: z
        .string({
          required_error: 'ID do cargo é obrigatório',
        })
        .uuid({
          message: 'ID do cargo inválido',
        }),
    })

    app.delete(
      '/:cargoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { cargoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const cargo = await prisma.cargo.findFirst({
            where: {
              id: cargoId,
              empresasId: empresaId,
            },
          })

          if (!cargo) {
            return reply.code(404).send({
              status: false,
              msg: 'Cargo não encontrado',
            })
          }

          await prisma.cargo.update({
            where: { id: cargoId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Cargo excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir cargo',
          })
        }
      }
    )
  }

  private async excluirTreinamento(app: FastifyInstance) {
    const schemaParams = z.object({
      treinamentoId: z
        .string({
          required_error: 'ID do treinamento é obrigatório',
        })
        .uuid({
          message: 'ID do treinamento inválido',
        }),
    })

    app.delete(
      '/:treinamentoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { treinamentoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const treinamento = await prisma.treinamento.findFirst({
            where: {
              id: treinamentoId,
              empresasId: empresaId,
            },
          })

          if (!treinamento) {
            return reply.code(404).send({
              status: false,
              msg: 'Treinamento não encontrado',
            })
          }

          await prisma.treinamento.update({
            where: { id: treinamentoId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Treinamento excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir treinamento',
          })
        }
      }
    )
  }

  private async excluirPlanoTreinamento(app: FastifyInstance) {
    const schemaParams = z.object({
      planoId: z.string({
        required_error: 'ID do plano de treinamento é obrigatório',
      }),
    })

    app.delete(
      '/:planoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { planoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const plano = await prisma.planoTreinamento.findFirst({
            where: {
              id: Number(planoId),
              treinamento: {
                empresasId: empresaId,
              },
            },
          })

          if (!plano) {
            return reply.code(404).send({
              status: false,
              msg: 'Plano de treinamento não encontrado',
            })
          }

          await prisma.planoTreinamento.update({
            where: { id: Number(planoId) },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Plano de treinamento excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir plano de treinamento',
          })
        }
      }
    )
  }

  private async excluirTodosCargos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.cargo.updateMany({
            where: {
              empresasId: empresaId,
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} cargo(s) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir cargos',
          })
        }
      }
    )
  }

  private async excluirTodosColaboradores(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.contratacaoColaborador.updateMany({
            where: {
              empresaId,
              excluido: false,
            },
            data: {
              excluido: true,
              excluidoEm: new Date(),
            },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} colaborador(es) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir colaboradores',
          })
        }
      }
    )
  }

  // ==================== EXPEDIÇÃO ====================

  private async excluirItemAvaliacaoExpedicao(app: FastifyInstance) {
    const schemaParams = z.object({
      itemId: z.string({
        required_error: 'ID do item de avaliação é obrigatório',
      }),
    })

    app.delete(
      '/:itemId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { itemId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const item = await prisma.itensAvaliacaoExpedicao.findFirst({
            where: {
              id: Number(itemId),
              empresasId: empresaId,
            },
          })

          if (!item) {
            return reply.code(404).send({
              status: false,
              msg: 'Item de avaliação não encontrado',
            })
          }

          await prisma.itensAvaliacaoExpedicao.update({
            where: { id: Number(itemId) },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Item de avaliação excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir item de avaliação',
          })
        }
      }
    )
  }

  private async excluirTodosItensAvaliacaoExpedicao(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.itensAvaliacaoExpedicao.updateMany({
            where: {
              empresasId: empresaId,
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} item(ns) de avaliação excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir itens de avaliação',
          })
        }
      }
    )
  }

  // ==================== VENDAS ====================

  private async cancelarVenda(app: FastifyInstance) {
    const schemaParams = z.object({
      vendaId: z
        .string({
          required_error: 'ID da venda é obrigatório',
        })
        .uuid({
          message: 'ID da venda inválido',
        }),
    })

    app.delete(
      '/:vendaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { vendaId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const venda = await prisma.venda.findFirst({
            where: {
              id: vendaId,
              empresasId: empresaId,
            },
          })

          if (!venda) {
            return reply.code(404).send({
              status: false,
              msg: 'Venda não encontrada',
            })
          }

          if (venda.cancelado) {
            return reply.code(400).send({
              status: false,
              msg: 'Venda já está cancelada',
            })
          }

          await prisma.venda.update({
            where: { id: vendaId },
            data: { cancelado: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Venda cancelada com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao cancelar venda',
          })
        }
      }
    )
  }

  private async desativarProdutoServico(app: FastifyInstance) {
    const schemaParams = z.object({
      produtoId: z
        .string({
          required_error: 'ID do produto/serviço é obrigatório',
        })
        .uuid({
          message: 'ID do produto/serviço inválido',
        }),
    })

    app.delete(
      '/:produtoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { produtoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const produto = await prisma.produtoServico.findFirst({
            where: {
              id: produtoId,
              empresaId,
            },
          })

          if (!produto) {
            return reply.code(404).send({
              status: false,
              msg: 'Produto/Serviço não encontrado',
            })
          }

          await prisma.produtoServico.update({
            where: { id: produtoId },
            data: { ativo: false },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Produto/Serviço desativado com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao desativar produto/serviço',
          })
        }
      }
    )
  }

  private async cancelarTodasVendas(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.venda.updateMany({
            where: {
              empresasId: empresaId,
              cancelado: false,
            },
            data: { cancelado: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} venda(s) cancelada(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao cancelar vendas',
          })
        }
      }
    )
  }

  // ==================== DOCUMENTOS ====================

  private async excluirDocumento(app: FastifyInstance) {
    const schemaParams = z.object({
      documentoId: z
        .string({
          required_error: 'ID do documento é obrigatório',
        })
        .uuid({
          message: 'ID do documento inválido',
        }),
    })

    app.delete(
      '/:documentoId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { documentoId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const documento = await prisma.documentos.findFirst({
            where: {
              id: documentoId,
              empresaId,
            },
          })

          if (!documento) {
            return reply.code(404).send({
              status: false,
              msg: 'Documento não encontrado',
            })
          }

          await prisma.documentos.update({
            where: { id: documentoId },
            data: {
              excluido: true,
              excluidoEm: new Date(),
            },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Documento excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir documento',
          })
        }
      }
    )
  }

  private async excluirCategoriaDocumento(app: FastifyInstance) {
    const schemaParams = z.object({
      categoriaId: z
        .string({
          required_error: 'ID da categoria é obrigatório',
        })
        .uuid({
          message: 'ID da categoria inválido',
        }),
    })

    app.delete(
      '/:categoriaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { categoriaId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const categoria = await prisma.categoriasDocumento.findFirst({
            where: {
              id: categoriaId,
              empresaId,
            },
            include: {
              Documentos: true,
            },
          })

          if (!categoria) {
            return reply.code(404).send({
              status: false,
              msg: 'Categoria não encontrada',
            })
          }

          if (categoria.Documentos.length > 0) {
            return reply.code(400).send({
              status: false,
              msg: 'Não é possível excluir categoria com documentos associados',
            })
          }

          await prisma.categoriasDocumento.delete({
            where: { id: categoriaId },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Categoria excluída com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir categoria',
          })
        }
      }
    )
  }

  private async excluirTodosDocumentos(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.documentos.updateMany({
            where: {
              empresaId,
              excluido: false,
            },
            data: {
              excluido: true,
              excluidoEm: new Date(),
            },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} documento(s) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir documentos',
          })
        }
      }
    )
  }

  // ==================== CLIENTES ====================

  private async excluirCliente(app: FastifyInstance) {
    const schemaParams = z.object({
      clienteId: z
        .string({
          required_error: 'ID do cliente é obrigatório',
        })
        .uuid({
          message: 'ID do cliente inválido',
        }),
    })

    app.delete(
      '/:clienteId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { clienteId } = schemaParams.parse(req.params)
          const empresaId = req.user.cliente

          const cliente = await prisma.cliente.findFirst({
            where: {
              id: clienteId,
              empresaId,
            },
          })

          if (!cliente) {
            return reply.code(404).send({
              status: false,
              msg: 'Cliente não encontrado',
            })
          }

          await prisma.cliente.update({
            where: { id: clienteId },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: 'Cliente excluído com sucesso',
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir cliente',
          })
        }
      }
    )
  }

  private async excluirTodosClientes(app: FastifyInstance) {
    const schemaParams = z.object({
      empresaId: z
        .string({
          required_error: 'ID da empresa é obrigatório',
        })
        .uuid({
          message: 'ID da empresa inválido',
        }),
    })

    app.delete(
      '/:empresaId',
      {
        preHandler: [verificarPermissaoAdmin],
      },
      async (req, reply) => {
        try {
          await req.jwtVerify({ onlyCookie: true })
          const { empresaId } = schemaParams.parse(req.params)

          const result = await prisma.cliente.updateMany({
            where: {
              empresaId,
              excluido: false,
            },
            data: { excluido: true },
          })

          return reply.code(200).send({
            status: true,
            msg: `${result.count} cliente(s) excluído(s) com sucesso`,
          })
        } catch (error) {
          return reply.code(500).send({
            status: false,
            msg: 'Erro ao excluir clientes',
          })
        }
      }
    )
  }
}
