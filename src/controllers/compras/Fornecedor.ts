import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import {
  adicionarNovoAnexo,
  adicionarNovoEmail,
  adicionarNovoTelefone,
  cadastrarFornecedor,
  recuperarAvaliacoesEntregaFornecedor,
  recuperarAvaliacoesFornecedor,
  recuperarDadosFornecedor,
  recuperarDocumentosFornecedor,
  recuperarFornecedoresEmpresa,
  removerAnexo,
  removerEmail,
  removerFornecedor,
  removerTelefone,
  salvarAvaliacaoFornecedor,
  salvarEndereco,
} from '../../repositories/Compras/FornecedorRepository'

class FornecedorController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.consultaFornecedoresEmpresa, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.criarFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.consultarFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.consultarDocumentosFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.consultarAvaliacoesFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.consultarAvaliacoesEntregaFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.registrarAvaliacao, {
      prefix: '/fornecedor',
    })

    fastifyInstance.register(this.modificarEndereco, {
      prefix: '/fornecedor',
    })

    fastifyInstance.register(this.excluirFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.removerEmailFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.removerTelefoneFornecedor, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.adicionarAnexo, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.adicionarEmail, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.adicionarTelefone, {
      prefix: '/fornecedor',
    })
    fastifyInstance.register(this.removerAnexoFornecedor, {
      prefix: '/fornecedor',
    })
  }

  async consultaFornecedoresEmpresa(app: FastifyInstance) {
    app.get('/', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const listaFornecedores = await recuperarFornecedoresEmpresa({
        empresaId: cliente,
      })

      res.status(200).send(listaFornecedores)
    })
  }

  async criarFornecedor(app: FastifyInstance) {
    const schemaBody = z.object({
      nome: z.string(),
      documento: z.string(),
      critico: z.boolean(),
      aprovado: z.boolean(),
      validade: z.coerce.date(),
      nota: z.coerce.number(),
      logradouro: z.string(),
      numero: z.string(),
      bairro: z.string(),
      cidade: z.string(),
      estado: z.string(),
      cep: z.string(),
      complemento: z.string().optional().nullable(),
      telefones: z.array(
        z.object({
          numero: z.string(),
          codigoArea: z.string(),
        })
      ),
      emails: z.array(
        z.object({
          email: z.string().email(),
        })
      ),
      documentos: z.array(
        z.object({
          nome: z.string(),
          arquivo: z.string(),
        })
      ),
    })
    app.post('/', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id, cliente } = req.user

      const {
        nome,
        documento,
        critico,
        aprovado,
        nota,
        validade,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
        telefones,
        emails,
        documentos,
      } = await schemaBody.parseAsync(req.body)

      try {
        const novoFornecedor = await cadastrarFornecedor({
          nome,
          documento,
          critico,
          aprovado,
          enderecoFornecedor: {
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
          },
          telefoneFornecedor: telefones,
          emailFornecedor: emails,
          anexos: documentos,
          empresaId: cliente,
        })

        if (novoFornecedor.id && critico) {
          await salvarAvaliacaoFornecedor({
            fornecedorId: novoFornecedor.id,
            nota,
            validade,
            aprovado,
            usuarioId: id,
            critico
          })
        }

        res.status(201).send({
          status: true,
          msg: 'Fornecedor criado com sucesso!',
          dados: novoFornecedor,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao cadastrar novo fornecedor',
          erro: error,
        })
      }
    })
  }

  async consultarFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.get('/:id', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParams.parseAsync(req.params)

      const fornecedor = await recuperarDadosFornecedor({
        id,
        empresaId: cliente,
      })

      res.status(200).send({
        status: true,
        msg: 'Fornecedor encontrado!',
        dados: fornecedor,
      })
    })
  }

  async consultarDocumentosFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.get('/:id/documentos', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParams.parseAsync(req.params)

      const documentos = await recuperarDocumentosFornecedor({
        id,
        empresaId: cliente,
      })

      res.status(200).send({
        status: true,
        msg: 'Documentos do fornecedor encontrados!',
        dados: documentos,
      })
    })
  }

  async consultarAvaliacoesFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.get('/:id/avaliacoes', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParams.parseAsync(req.params)

      const avaliacoes = await recuperarAvaliacoesFornecedor({
        id,
        empresaId: cliente,
      })

      res.status(200).send({
        status: true,
        msg: 'Avaliações do fornecedor encontradas!',
        dados: avaliacoes,
      })
    })
  }

  async consultarAvaliacoesEntregaFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.get('/:id/avaliacoes-entrega', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { cliente } = req.user

      const { id } = await schemaParams.parseAsync(req.params)

      const avaliacoesEntrega = await recuperarAvaliacoesEntregaFornecedor({
        id,
        empresaId: cliente,
      })

      res.status(200).send({
        status: true,
        msg: 'Avaliações de entrega do fornecedor encontradas!',
        dados: avaliacoesEntrega,
      })
    })
  }

  async registrarAvaliacao(app: FastifyInstance) {
    const schemaBody = z.object({
      nota: z.number().min(0).max(100),
      validade: z.coerce.date(),
      aprovado: z.boolean(),
      critico: z.boolean(),
    })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.post(`/:id/avaliacao`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })
      const { id: fornecedorId } = await schemaParams.parseAsync(req.params)
      const { cliente, id } = req.user

      const { nota, validade, aprovado, critico } = await schemaBody.parseAsync(
        req.body
      )

      try {
        await salvarAvaliacaoFornecedor({
          fornecedorId,
          nota,
          validade,
          aprovado,
          critico,
          usuarioId: id,
        })

        res.status(201).send({
          status: true,
          msg: 'Avaliação registrada com sucesso!',
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao registrar avaliação',
          error,
        })
      }
    })
  }

  async modificarEndereco(app: FastifyInstance) {
    const schemaBody = z.object({
      logradouro: z.string(),
      numero: z.string(),
      bairro: z.string(),
      cidade: z.string(),
      estado: z.string(),
      cep: z.string(),
      complemento: z.string().optional().nullable(),
    })

    const schemaParams = z.object({
      id: z.string().uuid(),
      enderecoId: z.string().uuid(),
    })

    app.put(`/:id/endereco/:enderecoId`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { id, enderecoId } = await schemaParams.parseAsync(req.params)
      const { logradouro, numero, bairro, cidade, estado, cep, complemento } =
        await schemaBody.parseAsync(req.body)

      try {
        const modificarEndereco = await salvarEndereco({
          empresaId: cliente,
          idFornecedor: id,
          endereco: {
            id: enderecoId,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            cep,
            complemento,
          },
        })

        res.status(200).send({
          status: true,
          msg: 'Endereço modificado com sucesso!',
          dados: modificarEndereco,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao modificar endereço',
          error,
        })
      }
    })
  }

  async removerTelefoneFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      telefoneId: z.string().uuid(),
    })

    app.delete(`/telefone/:telefoneId`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { telefoneId } = await schemaParams.parseAsync(req.params)

      try {
        const removeTelefone = await removerTelefone({
          empresaId: cliente,
          id: telefoneId,
        })

        res.status(200).send({
          status: true,
          msg: 'Telefone removido com sucesso!',
          dados: removeTelefone,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao remover telefone',
          dados: null,
          error,
        })
      }
    })
  }

  async adicionarTelefone(app: FastifyInstance) {
    const schemaBody = z.object({
      numero: z.string(),
      codigoArea: z.string(),
    })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.post(`/:id/telefone`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { numero, codigoArea } = await schemaBody.parseAsync(req.body)
      const { id: fornecedorId } = await schemaParams.parseAsync(req.params)

      try {
        const adicionarTelefone = await adicionarNovoTelefone({
          idFornecedor: fornecedorId,
          empresaId: cliente,
          telefone: {
            numero,
            codigoArea,
          },
        })

        res.status(201).send({
          status: true,
          msg: 'Telefone adicionado com sucesso!',
          dados: adicionarTelefone,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao adicionar telefone',
          error,
        })
      }
    })
  }

  async removerEmailFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      emailId: z.string().uuid(),
    })

    app.delete(`/email/:emailId`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { emailId } = await schemaParams.parseAsync(req.params)

      try {
        const removeEmail = await removerEmail({
          empresaId: cliente,
          id: emailId,
        })

        res.status(200).send({
          status: true,
          msg: 'Email removido com sucesso!',
          dados: removeEmail,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao remover email',
          dados: null,
          error,
        })
      }
    })
  }

  async adicionarEmail(app: FastifyInstance) {
    const schemaBody = z.object({
      email: z.string().email(),
    })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.post(`/:id/email`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { email } = await schemaBody.parseAsync(req.body)
      const { id: fornecedorId } = await schemaParams.parseAsync(req.params)

      try {
        const adicionaEmail = await adicionarNovoEmail({
          idFornecedor: fornecedorId,
          empresaId: cliente,
          email,
        })

        res.status(201).send({
          status: true,
          msg: 'Email adicionado com sucesso!',
          dados: adicionaEmail,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao adicionar o email',
          error,
        })
      }
    })
  }

  async removerAnexoFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      anexoId: z.string().uuid(),
    })

    app.delete(`/anexo/:anexoId`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { anexoId } = await schemaParams.parseAsync(req.params)

      try {
        const removeAnexo = await removerAnexo({
          empresaId: cliente,
          id: anexoId,
        })

        res.status(200).send({
          status: true,
          msg: 'Anexo removido com sucesso!',
          dados: removeAnexo,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao remover email',
          dados: null,
          error,
        })
      }
    })
  }

  async adicionarAnexo(app: FastifyInstance) {
    const schemaBody = z.object({
      nome: z.string(),
      arquivo: z.string(),
    })

    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.post(`/:id/anexo`, async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { nome, arquivo } = await schemaBody.parseAsync(req.body)
      const { id: fornecedorId } = await schemaParams.parseAsync(req.params)

      try {
        const adicionaAnexo = await adicionarNovoAnexo({
          idFornecedor: fornecedorId,
          empresaId: cliente,
          anexo: {
            nome,
            arquivo,
          },
        })

        res.status(201).send({
          status: true,
          msg: 'Anexo adicionado com sucesso!',
          dados: adicionaAnexo,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao adicionar o anexo',
          error,
        })
      }
    })
  }

  async excluirFornecedor(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z.string().uuid(),
    })

    app.delete('/:id', async (req, res) => {
      await req.jwtVerify({ onlyCookie: true })

      const { cliente } = req.user

      const { id } = await schemaParams.parseAsync(req.params)

      try {
        const removeFornecedor = await removerFornecedor({
          empresaId: cliente,
          id,
        })

        res.status(200).send({
          status: true,
          msg: 'Fornecedor removido com sucesso!',
          dados: removeFornecedor,
        })
      } catch (error) {
        return res.status(500).send({
          status: false,
          msg: 'Erro ao remover fornecedor',
          error,
        })
      }
    })
  }
}

export default FornecedorController
