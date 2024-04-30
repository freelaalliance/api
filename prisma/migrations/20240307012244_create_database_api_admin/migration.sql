-- CreateTable
CREATE TABLE `pessoas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enderecos` (
    `id` VARCHAR(191) NOT NULL,
    `logradouro` VARCHAR(191) NOT NULL,
    `bairro` VARCHAR(191) NOT NULL,
    `cidade` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `complemento` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `pessoaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `enderecos_pessoaId_key`(`pessoaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `imagemLogo` VARCHAR(191) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `pessoaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `empresas_cnpj_key`(`cnpj`),
    UNIQUE INDEX `empresas_pessoaId_key`(`pessoaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `administrativo` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `pessoaId` VARCHAR(191) NOT NULL,
    `perfilId` VARCHAR(191) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    UNIQUE INDEX `usuarios_pessoaId_key`(`pessoaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modulos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `modulos_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modulos_empresa` (
    `empresaId` VARCHAR(191) NOT NULL,
    `moduloId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`empresaId`, `moduloId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcoes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `moduloId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `funcoes_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfil_permissao_funcoes` (
    `perfilId` VARCHAR(191) NOT NULL,
    `funcaoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`perfilId`, `funcaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instrumentos` (
    `id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `localizacao` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `resolucao` VARCHAR(191) NOT NULL,
    `frequencia` INTEGER NOT NULL,
    `repeticao` INTEGER NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizacao` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `instrumentos_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calibracoes` (
    `id` VARCHAR(191) NOT NULL,
    `numeroCertificado` VARCHAR(191) NOT NULL,
    `erroEncontrado` VARCHAR(191) NOT NULL,
    `incertezaTendenciaEncontrado` VARCHAR(191) NOT NULL,
    `toleranciaEstabelicida` VARCHAR(191) NOT NULL,
    `observacao` LONGTEXT NULL,
    `certificado` LONGTEXT NOT NULL,
    `status` ENUM('aprovado', 'reprovado') NOT NULL DEFAULT 'reprovado',
    `realizadoEm` DATETIME(3) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `usuarioId` VARCHAR(191) NOT NULL,
    `instrumentoId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `calibracoes_numeroCertificado_key`(`numeroCertificado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agendas` (
    `id` VARCHAR(191) NOT NULL,
    `agendadoPara` DATETIME(3) NOT NULL,
    `instrumentoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `enderecos` ADD CONSTRAINT `enderecos_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `empresas` ADD CONSTRAINT `empresas_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_perfilId_fkey` FOREIGN KEY (`perfilId`) REFERENCES `perfis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modulos_empresa` ADD CONSTRAINT `modulos_empresa_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modulos_empresa` ADD CONSTRAINT `modulos_empresa_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `modulos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funcoes` ADD CONSTRAINT `funcoes_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `modulos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfil_permissao_funcoes` ADD CONSTRAINT `perfil_permissao_funcoes_perfilId_fkey` FOREIGN KEY (`perfilId`) REFERENCES `perfis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfil_permissao_funcoes` ADD CONSTRAINT `perfil_permissao_funcoes_funcaoId_fkey` FOREIGN KEY (`funcaoId`) REFERENCES `funcoes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instrumentos` ADD CONSTRAINT `instrumentos_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calibracoes` ADD CONSTRAINT `calibracoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calibracoes` ADD CONSTRAINT `calibracoes_instrumentoId_fkey` FOREIGN KEY (`instrumentoId`) REFERENCES `instrumentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendas` ADD CONSTRAINT `agendas_instrumentoId_fkey` FOREIGN KEY (`instrumentoId`) REFERENCES `instrumentos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
