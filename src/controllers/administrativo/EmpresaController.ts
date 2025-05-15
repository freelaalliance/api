import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

import EmpresaEntity from '../../entities/EmpresaEntity'
import EnderecoEntity from '../../entities/EnderecoEntity'
import ModuloEntity from '../../entities/ModuloEntity'
import PerfilEntity from '../../entities/PerfilEntity'
import UsuarioEntity from '../../entities/UsuarioEntity'
import type { PerfilInterface } from '../../interfaces/PerfilInterface'
import type { RespostaRequisicaoInterface } from '../../interfaces/ResponseInterface'

class EmpresaController {
  constructor(fastify: FastifyInstance) {
    fastify.register(this.inserirEmpresa, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.alterarDadosEmpresa, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.listarEmpresas, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.vincularModulo, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.desvincularModulo, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.listarModulosEmpresa, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.listarPerfisEmpresa, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.listarUsuariosEmpresa, {
      prefix: '/admin/empresa',
    })

    fastify.register(this.excluirEmpresa, {
      prefix: '/admin/empresa',
    })
  }

  async inserirEmpresa(app: FastifyInstance) {
    const schemaEmpresa = z.object({
      nome: z.string().min(1, {
        message: 'O nome é obrigatório',
      }),
      cnpj: z
        .string()
        .min(14, { message: 'O documento é obrigatório!' })
        .max(18, { message: 'O documento é inválido!' }),
      logradouro: z.string().min(1, { message: 'O logradouro é obrigatório!' }),
      numero: z
        .string()
        .min(1, { message: 'O número do endereço é obrigatório!' }),
      bairro: z
        .string()
        .min(1, { message: 'O bairro do endereço é obrigatório!' }),
      cidade: z
        .string()
        .min(1, { message: 'A cidade do endereço é obrigatório!' }),
      estado: z
        .string()
        .min(1, { message: 'O estado do endereço é obrigatório!' }),
      cep: z
        .string()
        .min(8, { message: 'Necessário informar o CEP' })
        .max(9, { message: 'O cep do endereço é inválido!' }),
      complemento: z.string().optional(),
    })

    app.post('/', async (req, reply) => {
      const {
        nome,
        cnpj,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
      } = schemaEmpresa.parse(req.body)

      const empresa = new EmpresaEntity(
        undefined,
        cnpj,
        undefined,
        undefined,
        undefined,
        false,
        undefined,
        nome
      )

      const cadastraEmpresa: RespostaRequisicaoInterface =
        await empresa.cadastrarEmpresa()

      if (!cadastraEmpresa.status) return reply.code(500).send(cadastraEmpresa)

      const dadosEmpresa: EmpresaEntity =
        await empresa.recuperarDadosEmpresaPorCnpj()

      if (dadosEmpresa.getIdEmpresa() === '')
        return reply.code(500).send({
          status: false,
          msg: 'Empresa não cadastrada!',
        })

      const enderecoEntity = new EnderecoEntity(
        undefined,
        logradouro,
        bairro,
        cidade,
        estado,
        numero,
        complemento,
        cep,
        false,
        undefined,
        undefined,
        dadosEmpresa.getIdPessoa()
      )

      const cadastrarEndereco: RespostaRequisicaoInterface =
        await enderecoEntity.cadastrarEndereco()

      return reply
        .code(cadastrarEndereco.status ? 201 : 400)
        .send(cadastraEmpresa)
    })
  }

  async excluirEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({ message: 'O id da empresa é inválido!' }),
    })

    app.delete('/:id', async (req, reply) => {
      const { id } = await schemaParams.parseAsync(req.params)

      const empresaEntity = new EmpresaEntity(id)

      const excluirEmpresa: RespostaRequisicaoInterface =
        await empresaEntity.excluirEmpresa()

      if (!excluirEmpresa.status) {
        return reply.code(400).send(excluirEmpresa)
      }

      return reply.code(202).send(excluirEmpresa)
    })
  }

  async listarEmpresas(app: FastifyInstance) {
    app.get('/all', async () => {
      const empresaEntity = new EmpresaEntity()

      const empresas: EmpresaEntity[] = await empresaEntity.listarEmpresas()

      if (empresas.length === 0) return []

      return Promise.all(
        empresas.map(async empresa => {
          return {
            id: empresa.getIdEmpresa(),
            imagemLogo: empresa.getImagemLogo(),
            nome: empresa.getNomePessoa(),
          }
        })
      )
    })
  }

  async alterarDadosEmpresa(app: FastifyInstance) {
    const schemaEmpresa = z.object({
      idPessoa: z
        .string({
          required_error: 'Necessário informar o id da pessoa',
        })
        .uuid({ message: 'O id da pessoa é inválido!' }),
      idEndereco: z
        .string({
          required_error: 'Necessário informar o id da endereço',
        })
        .uuid({ message: 'O id da endereço é inválido!' }),
      nome: z.string().min(1, {
        message: 'O nome é obrigatório',
      }),
      cnpj: z
        .string()
        .min(14, { message: 'O documento é obrigatório!' })
        .max(18, { message: 'O documento é inválido!' }),
      logradouro: z.string().min(1, { message: 'O logradouro é obrigatório!' }),
      numero: z
        .string()
        .min(1, { message: 'O número do endereço é obrigatório!' }),
      bairro: z
        .string()
        .min(1, { message: 'O bairro do endereço é obrigatório!' }),
      cidade: z
        .string()
        .min(1, { message: 'A cidade do endereço é obrigatório!' }),
      estado: z
        .string()
        .min(1, { message: 'O estado do endereço é obrigatório!' }),
      cep: z
        .string()
        .min(8, { message: 'Necessário informar o CEP' })
        .max(9, { message: 'O cep do endereço é inválido!' }),
      complemento: z.string().optional(),
    })

    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({ message: 'O id da empresa é inválido!' }),
    })

    app.put('/:id', async (req, reply) => {
      const { id } = schemaParams.parse(req.params)

      const {
        idPessoa,
        nome,
        cnpj,
        idEndereco,
        logradouro,
        numero,
        bairro,
        cidade,
        estado,
        cep,
        complemento,
      } = schemaEmpresa.parse(req.body)

      const empresaEntity = new EmpresaEntity(
        id,
        cnpj,
        null,
        undefined,
        undefined,
        false,
        idPessoa,
        nome
      )

      const alteraEmpresa: RespostaRequisicaoInterface =
        await empresaEntity.modificaEmpresa()

      if (!alteraEmpresa.status) {
        return reply.code(400).send(alteraEmpresa)
      }

      const enderecoEntity = new EnderecoEntity(
        idEndereco,
        logradouro,
        bairro,
        cidade,
        estado,
        numero,
        complemento,
        cep,
        false,
        undefined,
        undefined,
        idPessoa
      )

      const alteraEndereco: RespostaRequisicaoInterface =
        await enderecoEntity.alterarEndereco()

      return reply.code(alteraEmpresa.status ? 202 : 400).send(alteraEndereco)
    })
  }

  async vincularModulo(app: FastifyInstance) {
    const schemaVinculoModulo = z.object({
      idModulo: z
        .string({
          required_error: 'Necessário informar o id do modulo',
        })
        .uuid({
          message: 'O id do modulo é inválido!',
        }),
    })

    const schemaParamEmpresa = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({
          message: 'O id da empresa é inválido!',
        }),
    })

    app.post('/:id/vincular/modulo', async (req, reply) => {
      try {
        const { idModulo } = schemaVinculoModulo.parse(req.body)
        const { id } = schemaParamEmpresa.parse(req.params)

        const empresaEntity = new EmpresaEntity()

        const vincula = await empresaEntity.vincularModuloEmpresa(id, idModulo)

        if (vincula.status) {
          reply.status(201).send(vincula)
          return
        }

        reply.status(400).send(vincula)
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: error,
        })
      }
    })
  }

  async desvincularModulo(app: FastifyInstance) {
    const schemaVinculoModulo = z.array(
      z.object({
        idModulo: z
          .string({
            required_error: 'Necessário informar o id do modulo',
          })
          .uuid({
            message: 'O id do modulo é inválido!',
          }),
      })
    )

    const schemaParamEmpresa = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({
          message: 'O id da empresa é inválido!',
        }),
    })

    app.delete('/:id/desvincular/modulo', async (req, reply) => {
      try {
        const modulos = schemaVinculoModulo.parse(req.body)
        const { id } = schemaParamEmpresa.parse(req.params)

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        const promises: Array<any> = []

        const empresaEntity = new EmpresaEntity()

        // biome-ignore lint/complexity/noForEach: <explanation>
        modulos.forEach(modulo => {
          promises.push(
            empresaEntity.desvincularModuloEmpresa(id, modulo.idModulo)
          )
        })

        await Promise.all(promises)

        reply.code(200).send({
          status: true,
          msg: 'Módulos desvinculados com sucesso!',
        })
      } catch (error) {
        return reply.status(500).send({
          status: false,
          msg: error,
        })
      }
    })
  }

  async listarModulosEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({ message: 'O id da empresa é inválido!' }),
    })

    app.get('/:id/modulos', async req => {
      const { id } = schemaParams.parse(req.params)

      const moduloEntity = new ModuloEntity()

      return await moduloEntity.listarModulosVinculadosEmpresa(id)
    })
  }

  async listarPerfisEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({ message: 'O id da empresa é inválido!' }),
    })

    app.get('/:id/perfis', async req => {
      const { id } = schemaParams.parse(req.params)
      const perfilEntity = new PerfilEntity()

      const perfil: PerfilInterface[] =
        await perfilEntity.listarPerfilEmpresa(id)

      return perfil
    })
  }

  async listarUsuariosEmpresa(app: FastifyInstance) {
    const schemaParams = z.object({
      id: z
        .string({
          required_error: 'Necessário informar o id da empresa',
        })
        .uuid({ message: 'O id da empresa é inválido!' }),
    })

    app.get('/:id/usuarios', async req => {
      const { id } = schemaParams.parse(req.params)

      const usuarioEntity = new UsuarioEntity()
      const usuarios = await usuarioEntity.recuperarTodosUsuariosEmpresa(id)

      if (usuarios.length === 0) {
        return []
      }

      return usuarios.map(usuario => {
        return {
          id: usuario.getId(),
          nome: usuario.getNomePessoa(),
          status: usuario.isAtivo() ? 'ativo' : 'desativado',
          email: usuario.getEmail(),
          perfil: usuario.getPerfilId(),
        }
      })
    })
  }
}

export default EmpresaController
