import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  buscarDadosPedido,
  cadastrarPedido,
  cancelarPedido,
  excluirPedido,
  listarPedidosFornecedor,
  listarPedidosPendentesEmpresa,
  listarPedidosRecebidosEmpresa,
} from '../../repositories/Compras/CompraRepository'
import { registrarRecebimentoPedido } from '../../repositories/Compras/RecebimentoRepository'

import { buscarItensAvaliacaoRecebimentoAtivoEmpresa } from '../../repositories/Compras/ItensAvaliacaoRecebimentoRepository'
import { buscarConfiguracoesPorEmpresa } from '../../repositories/ConfiguracaoEmpresaRepository'
import { reqUserSchema } from '../../schema/sessionUser'
import { gerarPdfCompraHTML } from './services/ComprasPdfService'
import { getNumeroPedido } from './utils/CompraUtil'


class ComprasController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.cadastrarNovaCompra, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.buscarPedido, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.buscaPedidosFornecedor, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.buscaPedidosPendentesEmpresa, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.buscaPedidosRecebidosEmpresa, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.inserirRecebimentoPedido, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.cancelarPedidoFornecedor, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.excluirPedidoFornecedor, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.itensAvaliacaoRecebimentoEmpresa, {
      prefix: 'pedido/recebimento',
    })

    fastifyInstance.register(this.buscarConfiguracaoCompra, {
      prefix: '/pedido',
    })

    fastifyInstance.register(this.gerarPdfPedido, {
      prefix: '/pedido',
    })
  }

  async cadastrarNovaCompra(app: FastifyInstance) {
    const schemaBody = z.object({
      permiteEntregaParcial: z.boolean().default(false),
      prazoEntrega: z.coerce.date({
        required_error: 'Obrigatório informar o prazo de entrega',
      }),
      condicoesEntrega: z.string().optional(),
      codigo: z.string({
        required_error: 'Obrigatório informar o código do pedido',
      }),
      frete: z.string().optional(),
      armazenamento: z.string().optional(),
      localEntrega: z.string().optional(),
      formaPagamento: z.string().optional(),
      imposto: z.string().optional(),
      itens: z.array(
        z.object({
          descricao: z.string({
            required_error: 'Obrigatório informar a descrição do item',
          }),
          quantidade: z.coerce
            .number({
              required_error: 'Obrigatório informar a quantidade do item',
            })
            .min(1, {
              message: 'A quantidade do item deve ser no mínimo 1',
            }),
        })
      ),
    })

    const schemaParam = z.object({
      fornecedorId: z.string().uuid(),
    })

    app.post('/fornecedor/:fornecedorId', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })

        const { fornecedorId } = await schemaParam.parseAsync(req.params)
        const { id } = await reqUserSchema.parseAsync(req.user)

        const {
          permiteEntregaParcial,
          prazoEntrega,
          condicoesEntrega,
          codigo,
          frete,
          armazenamento,
          localEntrega,
          formaPagamento,
          imposto,
          itens,
        } = await schemaBody.parseAsync(req.body)

        const numeroPedido = getNumeroPedido()

        const salvaPedido = await cadastrarPedido({
          permiteEntregaParcial,
          prazoEntrega,
          condicoesEntrega,
          codigo: `${numeroPedido}-${codigo}`,
          numPedido: numeroPedido,
          fornecedorId,
          usuarioId: id,
          frete,
          armazenamento,
          localEntrega,
          formaPagamento,
          imposto,
          itens,
        })

        return res.status(201).send({
          status: true,
          msg: 'Pedido criado com sucesso!',
          dados: salvaPedido,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao cadastrar novo pedido',
          dados: null,
          error,
        })
      }
    })
  }

  async cancelarPedidoFornecedor(app: FastifyInstance) {
    const schemaParam = z.object({
      idPedido: z.string().uuid(),
    })

    app.patch('/:idPedido/cancelar', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const { idPedido } = await schemaParam.parseAsync(req.params)

        const cancelaPedido = await cancelarPedido({
          idPedido,
          empresaId: cliente,
        })

        res.status(200).send({
          status: true,
          msg: 'Pedido cancelado com sucesso!',
          dados: cancelaPedido,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Falha ao cancelar pedido, tente novamente',
          dados: null,
          error,
        })
      }
    })
  }

  async excluirPedidoFornecedor(app: FastifyInstance) {
    const schemaParam = z.object({
      idPedido: z.string().uuid(),
    })

    app.delete('/:idPedido/excluir', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)
        const { idPedido } = await schemaParam.parseAsync(req.params)

        const deletaPedido = await excluirPedido({
          idPedido,
          empresaId: cliente,
        })

        res.status(200).send({
          status: true,
          msg: 'Pedido excluido com sucesso!',
          dados: deletaPedido,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Falha ao excluir pedido, tente novamente',
          dados: null,
          error,
        })
      }
    })
  }

  async buscarPedido(app: FastifyInstance) {
    const schemaQueryParam = z.object({
      codigo: z.string().optional(),
      id: z.string().uuid().optional(),
    })

    app.get('/', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const { codigo, id } = await schemaQueryParam.parseAsync(req.query)

        const pedido = await buscarDadosPedido({
          idPedido: id,
          codigo,
          empresaId: cliente,
        })

        res.status(200).send({
          status: true,
          msg: 'Pedido encontrado com sucesso!',
          dados: {
            id: pedido.id,
            numPedido: String(pedido.numPedido),
            codigo: pedido.codigo,
            permiteEntregaParcial: pedido.permiteEntregaParcial,
            prazoEntrega: pedido.prazoEntrega,
            condicoesEntrega: pedido.condicoesEntrega,
            recebido: pedido.recebido,
            frete: pedido.frete,
            armazenamento: pedido.armazenamento,
            localEntrega: pedido.localEntrega,
            formaPagamento: pedido.formaPagamento,
            imposto: pedido.imposto,
            itens: pedido.ItensCompra,
            cadastro: {
              usuario: pedido.usuario.pessoa.nome,
              dataCadastro: pedido.cadastradoEm,
            },
            empresa: {
              nome: pedido.fornecedor.empresa.pessoa.nome,
              documento: pedido.fornecedor.empresa.cnpj,
              endereco: {
                logradouro:
                  pedido.fornecedor.empresa.pessoa.Endereco?.logradouro,
                numero: pedido.fornecedor.empresa.pessoa.Endereco?.numero,
                complemento:
                  pedido.fornecedor.empresa.pessoa.Endereco?.complemento,
                bairro: pedido.fornecedor.empresa.pessoa.Endereco?.bairro,
                cidade: pedido.fornecedor.empresa.pessoa.Endereco?.cidade,
                estado: pedido.fornecedor.empresa.pessoa.Endereco?.estado,
                cep: pedido.fornecedor.empresa.pessoa.Endereco?.cep,
              },
            },
            fornecedor: {
              id: pedido.fornecedor.id,
              nome: pedido.fornecedor.pessoa.nome,
              documento: pedido.fornecedor.documento,
            },
          },
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao buscar pedido',
          dados: null,
          error,
        })
      }
    })
  }

  async buscaPedidosFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      fornecedorId: z.string().uuid(),
    })

    app.get('/:fornecedorId/all', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const { fornecedorId } = await schemaParams.parseAsync(req.params)

        const pedidos = await listarPedidosFornecedor({
          fornecedorId,
          empresaId: cliente,
        })

        res.status(200).send({
          status: true,
          msg: 'Pedidos encontrados com sucesso!',
          dados: pedidos.map(pedido => {
            return {
              id: pedido.id,
              numPedido: String(pedido.numPedido),
              codigo: pedido.codigo,
              permiteEntregaParcial: pedido.permiteEntregaParcial,
              prazoEntrega: pedido.prazoEntrega,
              condicoesEntrega: pedido.condicoesEntrega,
              recebido: pedido.recebido,
              itens: pedido.ItensCompra,
              cancelado: pedido.cancelado,
              empresa: {
                nome: pedido.fornecedor.empresa.pessoa.nome,
                documento: pedido.fornecedor.empresa.cnpj,
                endereco: {
                  logradouro:
                    pedido.fornecedor.empresa.pessoa.Endereco?.logradouro,
                  numero: pedido.fornecedor.empresa.pessoa.Endereco?.numero,
                  complemento:
                    pedido.fornecedor.empresa.pessoa.Endereco?.complemento,
                  bairro: pedido.fornecedor.empresa.pessoa.Endereco?.bairro,
                  cidade: pedido.fornecedor.empresa.pessoa.Endereco?.cidade,
                  estado: pedido.fornecedor.empresa.pessoa.Endereco?.estado,
                  cep: pedido.fornecedor.empresa.pessoa.Endereco?.cep,
                },
              },
              cadastro: {
                usuario: pedido.usuario.pessoa.nome,
                dataCadastro: pedido.cadastradoEm,
              },
              fornecedor: {
                id: pedido.fornecedor.id,
                nome: pedido.fornecedor.pessoa.nome,
                documento: pedido.fornecedor.documento,
              },
              recebimento: !pedido.RecebimentoCompras
                ? undefined
                : pedido.RecebimentoCompras.map(recebimento => {
                  return {
                    id: recebimento.id,
                    usuario: recebimento.usuario.pessoa.nome,
                    dataRecebimento: recebimento.recebidoEm,
                    avaliacaoEntrega: recebimento.avaliacaoEntrega,
                    numeroNota: recebimento.numeroNota,
                    numeroCertificado: recebimento.numeroCertificado,
                  }
                }),
            }
          }),
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao listar pedidos do fornecedor',
          dados: null,
          error,
        })
      }
    })
  }

  async buscaPedidosPendentesEmpresa(app: FastifyInstance) {
    app.get('/pendentes', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const pedidos = await listarPedidosPendentesEmpresa({
          empresaId: cliente,
        })

        res.status(200).send({
          status: true,
          msg: 'Pedidos encontrados com sucesso!',
          dados: pedidos.map(pedido => {
            return {
              id: pedido.id,
              numPedido: String(pedido.numPedido),
              codigo: pedido.codigo,
              permiteEntregaParcial: pedido.permiteEntregaParcial,
              prazoEntrega: pedido.prazoEntrega,
              condicoesEntrega: pedido.condicoesEntrega,
              recebido: pedido.recebido,
              cancelado: pedido.cancelado,
              itens: pedido.ItensCompra,
              cadastro: {
                usuario: pedido.usuario.pessoa.nome,
                dataCadastro: pedido.cadastradoEm,
              },
              empresa: {
                nome: pedido.fornecedor.empresa.pessoa.nome,
                documento: pedido.fornecedor.empresa.cnpj,
                endereco: {
                  logradouro:
                    pedido.fornecedor.empresa.pessoa.Endereco?.logradouro,
                  numero: pedido.fornecedor.empresa.pessoa.Endereco?.numero,
                  complemento:
                    pedido.fornecedor.empresa.pessoa.Endereco?.complemento,
                  bairro: pedido.fornecedor.empresa.pessoa.Endereco?.bairro,
                  cidade: pedido.fornecedor.empresa.pessoa.Endereco?.cidade,
                  estado: pedido.fornecedor.empresa.pessoa.Endereco?.estado,
                  cep: pedido.fornecedor.empresa.pessoa.Endereco?.cep,
                },
              },
              fornecedor: {
                id: pedido.fornecedor.id,
                nome: pedido.fornecedor.pessoa.nome,
                documento: pedido.fornecedor.documento,
              },
              recebimento: !pedido.RecebimentoCompras
                ? undefined
                : pedido.RecebimentoCompras.map(recebimento => {
                  return {
                    id: recebimento.id,
                    usuario: recebimento.usuario.pessoa.nome,
                    dataRecebimento: recebimento.recebidoEm,
                    avaliacaoEntrega: recebimento.avaliacaoEntrega,
                    numeroNota: recebimento.numeroNota,
                    numeroCertificado: recebimento.numeroCertificado,
                  }
                }),
            }
          }),
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao listar pedidos do fornecedor',
          dados: null,
          error,
        })
      }
    })
  }

  async buscaPedidosRecebidosEmpresa(app: FastifyInstance) {
    app.get('/recebidos', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const pedidos = await listarPedidosRecebidosEmpresa({
          empresaId: cliente,
        })

        res.status(200).send({
          status: true,
          msg: 'Pedidos encontrados com sucesso!',
          dados: pedidos.map(pedido => {
            return {
              id: pedido.id,
              numPedido: String(pedido.numPedido),
              codigo: pedido.codigo,
              permiteEntregaParcial: pedido.permiteEntregaParcial,
              prazoEntrega: pedido.prazoEntrega,
              condicoesEntrega: pedido.condicoesEntrega,
              recebido: pedido.recebido,
              cancelado: pedido.cancelado,
              itens: pedido.ItensCompra,
              cadastro: {
                usuario: pedido.usuario.pessoa.nome,
                dataCadastro: pedido.cadastradoEm,
              },
              empresa: {
                nome: pedido.fornecedor.empresa.pessoa.nome,
                documento: pedido.fornecedor.empresa.cnpj,
                endereco: {
                  logradouro:
                    pedido.fornecedor.empresa.pessoa.Endereco?.logradouro,
                  numero: pedido.fornecedor.empresa.pessoa.Endereco?.numero,
                  complemento:
                    pedido.fornecedor.empresa.pessoa.Endereco?.complemento,
                  bairro: pedido.fornecedor.empresa.pessoa.Endereco?.bairro,
                  cidade: pedido.fornecedor.empresa.pessoa.Endereco?.cidade,
                  estado: pedido.fornecedor.empresa.pessoa.Endereco?.estado,
                  cep: pedido.fornecedor.empresa.pessoa.Endereco?.cep,
                },
              },
              fornecedor: {
                id: pedido.fornecedor.id,
                nome: pedido.fornecedor.pessoa.nome,
                documento: pedido.fornecedor.documento,
              },
              recebimento: !pedido.RecebimentoCompras
                ? undefined
                : pedido.RecebimentoCompras.map(recebimento => {
                  return {
                    id: recebimento.id,
                    usuario: recebimento.usuario.pessoa.nome,
                    dataRecebimento: recebimento.recebidoEm,
                    avaliacaoEntrega: recebimento.avaliacaoEntrega,
                    numeroNota: recebimento.numeroNota,
                    numeroCertificado: recebimento.numeroCertificado,
                  }
                }),
            }
          }),
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao listar pedidos do fornecedor',
          dados: null,
          error,
        })
      }
    })
  }

  async inserirRecebimentoPedido(app: FastifyInstance) {
    const schemaBody = z.object({
      numeroCertificado: z.string().optional(),
      numeroNotaFiscal: z.string().optional(),
      dataRecebimento: z.coerce.date(),
      pedidoRecebidoCompleto: z.boolean().default(true),
      observacoes: z.string().optional(),
      avaliacoes: z.array(
        z.object({
          id: z.string().uuid(),
          nota: z.coerce
            .number()
            .min(0, {
              message: 'O valor deve ser de no mínimo 0',
            })
            .max(100, {
              message: 'O valor deve ser de no máximo 100',
            })
            .default(0),
        })
      ),
    })

    const schemaParams = z.object({
      compraId: z.string().uuid(),
    })

    app.post('/:compraId/recebimento', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })

        const {
          numeroCertificado,
          numeroNotaFiscal,
          dataRecebimento,
          pedidoRecebidoCompleto,
          observacoes,
          avaliacoes,
        } = await schemaBody.parseAsync(req.body)

        const { compraId } = await schemaParams.parseAsync(req.params)

        const { id, cliente } = await reqUserSchema.parseAsync(req.user)

        const salvaRecebimento = await registrarRecebimentoPedido({
          compraId,
          usuarioId: id,
          numeroNota: numeroNotaFiscal,
          numeroCertificado,
          avaliacoes: avaliacoes.map(avaliacao => ({
            itemAvaliacaoId: avaliacao.id,
            notaAvaliacao: avaliacao.nota,
          })),
          entregaCompleta: pedidoRecebidoCompleto,
          recebidoEm: dataRecebimento,
          empresaId: cliente,
          observacoes
        })

        if (salvaRecebimento) {
          res.status(200).send({
            status: true,
            msg: 'Recebimento inserido com sucesso!',
          })
        } else {
          res.status(200).send({
            status: false,
            msg: 'Pedido não encontrado',
          })
        }
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro inserir recebimento do pedido',
        })
      }
    })
  }

  async itensAvaliacaoRecebimentoEmpresa(app: FastifyInstance) {
    app.get('/avaliacao/itens', async (req, reply) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = await reqUserSchema.parseAsync(req.user)

      const listaItensRecebimento =
        await buscarItensAvaliacaoRecebimentoAtivoEmpresa({
          empresaId: cliente,
        })

      return reply.status(200).send(listaItensRecebimento)
    })
  }

  async buscarConfiguracaoCompra(app: FastifyInstance) {
    app.get('/configuracao', async (req, reply) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const configuracao = await buscarConfiguracoesPorEmpresa(cliente)

        if (!configuracao) {
          return reply.status(404).send({
            status: false,
            msg: 'Configuração não encontrada',
          })
        }

        return reply.status(200).send(configuracao)
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: 'Erro ao buscar configuração',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    })
  }
  async gerarPdfPedido(app: FastifyInstance) {
    const schemaParams = z.object({
      idPedido: z.string().uuid(),
    })

    app.get('/:idPedido/pdf', async (req, res) => {
      try {
        await req.jwtVerify({ onlyCookie: true })
        const { cliente } = await reqUserSchema.parseAsync(req.user)

        const { idPedido } = await schemaParams.parseAsync(req.params)

        const pedido = await buscarDadosPedido({
          idPedido,
          empresaId: cliente,
        })

        const pdf = await gerarPdfCompraHTML({
          numPedido: pedido.numPedido,
          codigo: pedido.codigo,
          permiteEntregaParcial: pedido.permiteEntregaParcial,
          prazoEntrega: pedido.prazoEntrega,
          condicoesEntrega: pedido.condicoesEntrega ?? null,
          cadastradoEm: pedido.cadastradoEm,
          frete: pedido.frete ?? null,
          armazenamento: pedido.armazenamento ?? null,
          localEntrega: pedido.localEntrega ?? null,
          formaPagamento: pedido.formaPagamento ?? null,
          imposto: pedido.imposto ?? null,
          recebido: pedido.recebido,
          cancelado: pedido.excluido,
          usuario: pedido.usuario.pessoa.nome,
          empresa: {
            nome: pedido.fornecedor.empresa.pessoa.nome,
            documento: pedido.fornecedor.empresa.cnpj,
            endereco: pedido.fornecedor.empresa.pessoa.Endereco
              ? {
                logradouro:
                  pedido.fornecedor.empresa.pessoa.Endereco.logradouro,
                numero: pedido.fornecedor.empresa.pessoa.Endereco.numero,
                complemento:
                  pedido.fornecedor.empresa.pessoa.Endereco.complemento,
                bairro: pedido.fornecedor.empresa.pessoa.Endereco.bairro,
                cidade: pedido.fornecedor.empresa.pessoa.Endereco.cidade,
                estado: pedido.fornecedor.empresa.pessoa.Endereco.estado,
                cep: pedido.fornecedor.empresa.pessoa.Endereco.cep,
              }
              : null,
          },
          fornecedor: {
            nome: pedido.fornecedor.pessoa.nome,
            documento: pedido.fornecedor.documento,
          },
          itens: pedido.ItensCompra.map((item) => ({
            descricao: item.descricao,
            quantidade: item.quantidade,
          })),
        })

        res
          .header('Content-Type', 'application/pdf')
          .header(
            'Content-Disposition',
            `inline; filename="pedido-${pedido.codigo}.pdf"`
          )
          .send(Buffer.from(pdf))
      } catch (error) {
        console.error('Erro ao gerar PDF do pedido:', error)
        return res.status(500).send({
          status: false,
          msg: 'Erro ao gerar PDF do pedido',
          error,
        })
      }
    })
  }
}

export default ComprasController
