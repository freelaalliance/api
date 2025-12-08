# ERP Alliance API - Instruções para Agentes de IA

## Arquitetura do Sistema

**Stack:** Fastify + Prisma + TypeScript (ES Modules com CommonJS output) + MySQL + Node 20

**Estrutura MVC modificada:** Controllers → Entities → Repositories → Prisma
- **Controllers** (`src/controllers/**`): Registram rotas Fastify e validam entrada com Zod
- **Entities** (`src/entities/**`): Lógica de negócio + getters/setters + operações CRUD via Repository
- **Repositories** (`src/repositories/**`): Camada de acesso ao Prisma Client, retorna `RespostaRequisicaoInterface`
- **Schema/Validação**: Sempre use Zod para validação de `body`, `params` e `query`

**Módulos ERP:** Calibração, Compras, Documentos, Manutenção, RH, Vendas - cada um com controllers especializados em `administrativo/` para painel admin.

## Padrões de Código Essenciais

### 1. Estrutura de Controllers
```typescript
class ExemploController {
  constructor(fastifyInstance: FastifyInstance) {
    fastifyInstance.register(this.metodoRota, { prefix: '/rota' })
  }
  
  private async metodoRota(app: FastifyInstance) {
    const schemaBody = z.object({ campo: z.string() })
    app.post('/', async (req, reply) => {
      const { campo } = schemaBody.parse(req.body)
      // Lógica aqui
    })
  }
}
```
- Controllers registram métodos privados como plugins Fastify com `prefix`
- Sempre inicialize controllers em `src/index.ts` com `new Controller(server.servico)`

### 2. Autenticação e Autorização
**JWT via cookies HTTP-only:**
- `sessionUser` para usuários regulares (`/usuario/login`)
- `sessionAdmin` para administradores (`/api/admin/login`)
- Verificação: `await req.jwtVerify({ onlyCookie: true })` retorna `req.user` com `{ id, cliente, isAdmin }`
- Middleware admin: use `verificarPermissaoAdmin` como `preHandler` em rotas admin

**Sistema de permissões:**
- Perfis com permissões por módulo e função (`PerfilPermissaoFuncao`)
- Verifique permissões via `PerfilEntity.verificaPermissaoFuncaoPerfil(perfilId, funcaoId)`

### 3. Prisma Client Singleton
```typescript
import { prisma } from '../services/PrismaClientService'
```
- **NUNCA** instancie `new PrismaClient()` diretamente
- Use sempre a instância exportada de `PrismaClientService.ts`
- Logs habilitados: `['query', 'info', 'warn', 'error']`

### 4. Response Pattern
Todos os repositories retornam:
```typescript
interface RespostaRequisicaoInterface {
  status: boolean
  msg: string
}
```
Nunca retorne objetos diretamente - encapsule em `{ status, msg, data? }`

### 5. Entities Pattern
- Entities estendem classes base (`PessoaEntity`, `EmpresaEntity`) quando aplicável
- Senhas: Criptografia com `bcrypt.hashSync(senha, 8)` antes de salvar
- Métodos públicos iniciam operações (ex: `cadastrarUsuario()`), que chamam repository interno
- Entities mantêm referência ao seu Repository no construtor

## Comandos de Desenvolvimento

```bash
npm run dev              # Modo watch com tsx
npm run build            # Build com tsup (output: dist/)
npm start                # Produção (node dist/index.cjs)
npm run db:seed          # Popula banco com dados iniciais
npm run db:generate      # Gera Prisma Client (sempre após mudanças no schema)
npm run db:migrate       # Cria e aplica nova migration
npm run db:push          # Push schema direto (dev only)
```

**Docker:** `docker-compose up` sobe MySQL na porta 3306 (senha: `passw0rd`, DB: `erp`)

## Convenções do Projeto

**Formatação:** Biome.js (sem Prettier/ESLint)
- Single quotes, sem semicolons (`semicolons: "asNeeded"`), trailing commas ES5
- `npm run format` (se configurado) ou deixe VS Code formatar com Biome

**Migrations:** Sempre nomeie com contexto claro (ex: `20250603202755_vincula_o_usuario_ao_realizar_expedicao`)

**Jobs/Cron:** Jobs em `src/jobs/**` são registrados em `src/index.ts` com `node-cron`
- Exemplo: `notificarVencimentoCalibracao` roda mensalmente via cron

**Rotas funcionais vs Classes:**
- Controllers de módulos complexos: classes com registro em `index.ts`
- Funcionalidades simples: exports de `routes` (ex: `vendasRoutes`, `clienteRoutes`) registradas com `server.servico.register()`

## Multi-Tenancy e Contexto
- Toda operação é scoped por `empresaId` (obtido de `req.user.cliente` após JWT verify)
- `Perfil` e `Usuario` são sempre vinculados a uma `Empresa`
- Use `where: { empresaId: req.user.cliente }` em queries Prisma para garantir isolamento

## Erros Comuns a Evitar

1. **NÃO** instancie Prisma Client diretamente - use o singleton
2. **NÃO** esqueça de validar com Zod - todos os inputs devem ter schema
3. **NÃO** exponha entidades Prisma diretamente - sempre mapeie para DTOs
4. **NÃO** use `.env` diretamente - variáveis de ambiente estão documentadas em `env.copy`
5. **NÃO** retorne erros 500 sem tratamento - use try/catch com respostas estruturadas
6. **NÃO** esqueça de marcar campos como `excluido: true` ao invés de deletar (soft delete)

## Exclusão Lógica (Soft Delete)

**Estratégias de exclusão por tipo de campo:**

### Campo `excluido: Boolean`
Usado na maioria dos modelos. Marque como `true` para excluir:
```typescript
await prisma.modelo.update({
  where: { id },
  data: { excluido: true }
})
```

**Modelos com campo `excluido`:**
- `Calibracao`, `Instrumento`
- `Compras`, `Fornecedor`
- `Cliente`, `Cargo`, `Treinamento`, `PlanoTreinamento`
- `ItensAvaliacaoExpedicao`
- `Endereco`, `TelefonePessoa`, `EmailPessoa`

### Campo `ativo: Boolean`
Usado para itens que devem permanecer no histórico mas não estar disponíveis. Marque como `false`:
```typescript
await prisma.modelo.update({
  where: { id },
  data: { ativo: false }
})
```

**Modelos com campo `ativo`:**
- `Usuario` - desativa acesso sem remover do sistema
- `ProdutoServico` - mantém em histórico de vendas mas não lista
- `ItensAvaliativosRecebimentoEmpresa` - desativa critério de avaliação

### Campo `cancelado: Boolean` ou `canceladoEm: DateTime`
Usado para processos/transações. Indica cancelamento mantendo histórico:
```typescript
// Boolean
await prisma.venda.update({
  where: { id },
  data: { cancelado: true }
})

// DateTime
await prisma.manutencao.update({
  where: { id },
  data: { canceladoEm: new Date() }
})
```

**Modelos com cancelamento:**
- `Venda` - campo `cancelado: Boolean`
- `Compras` - campo `cancelado: Boolean`
- `Manutencao` - campo `canceladoEm: DateTime`

### Controller de Exclusão Centralizado
Para operações administrativas de exclusão, use o `ExclusaoController` (`src/controllers/administrativo/ExclusaoController.ts`):
- Todas as rotas prefixadas com `/api/admin`
- Requerem autenticação administrativa via `verificarPermissaoAdmin`
- Verificam ownership da empresa antes de excluir
- Documentação completa em `docs/API-EXCLUSAO-LOGICA.md`

**Tipos de exclusão:**
- **Individual**: Exclui um registro específico por ID (ex: `/api/admin/calibracao/:calibracaoId`)
- **Em Lote**: Exclui todos os registros ativos de uma empresa (ex: `/api/admin/calibracao/empresa/:empresaId`)

**Padrão de rota de exclusão individual:**
```typescript
app.delete('/:id', {
  preHandler: [verificarPermissaoAdmin]
}, async (req, reply) => {
  await req.jwtVerify({ onlyCookie: true })
  const empresaId = req.user.cliente
  
  // 1. Verificar se existe e pertence à empresa
  const registro = await prisma.modelo.findFirst({
    where: { id, empresaId }
  })
  
  if (!registro) {
    return reply.code(404).send({
      status: false,
      msg: 'Registro não encontrado'
    })
  }
  
  // 2. Executar soft delete
  await prisma.modelo.update({
    where: { id },
    data: { excluido: true } // ou ativo: false, ou canceladoEm: new Date()
  })
  
  return reply.code(200).send({
    status: true,
    msg: 'Registro excluído com sucesso'
  })
})
```

**Padrão de rota de exclusão em lote:**
```typescript
app.delete('/:empresaId', {
  preHandler: [verificarPermissaoAdmin]
}, async (req, reply) => {
  await req.jwtVerify({ onlyCookie: true })
  const { empresaId } = schemaParams.parse(req.params)
  const empresaUsuario = req.user.cliente

  // Validar ownership
  if (empresaId !== empresaUsuario) {
    return reply.code(403).send({
      status: false,
      msg: 'Você não tem permissão para excluir registros desta empresa'
    })
  }

  // Executar exclusão em lote
  const result = await prisma.modelo.updateMany({
    where: {
      empresaId,
      excluido: false, // apenas registros ativos
    },
    data: { excluido: true }
  })

  return reply.code(200).send({
    status: true,
    msg: `${result.count} registro(s) excluído(s) com sucesso`
  })
})
```

### Filtragem em Queries
Sempre filtre registros excluídos em queries de listagem:
```typescript
// Listar apenas ativos
await prisma.modelo.findMany({
  where: {
    empresaId,
    excluido: false, // ou ativo: true
  }
})

// Incluir excluídos se necessário (ex: relatórios)
await prisma.modelo.findMany({
  where: { empresaId }
  // Sem filtro de excluido
})
```

## Adicionando Novo Módulo

1. Crie schema Prisma em `prisma/schema.prisma` e rode `npm run db:migrate`
2. Crie controller em `src/controllers/nomeModulo/`
3. Crie entity em `src/entities/NomeModuloEntity.ts`
4. Crie repository em `src/repositories/NomeModuloRepository.ts`
5. Registre controller em `src/index.ts`: `new NomeModuloController(server.servico)`
6. Para admin: adicione controller em `administrativo/NomeModuloController.ts` com prefix `/api/admin`
