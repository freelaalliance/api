-- CreateTable
CREATE TABLE `telefones_pessoa` (
    `id` VARCHAR(191) NOT NULL,
    `codigoArea` VARCHAR(3) NOT NULL,
    `numero` VARCHAR(9) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `pessoaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `telefones_pessoa_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emails_pessoa` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,
    `pessoaId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `emails_pessoa_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(14) NOT NULL,
    `critico` BOOLEAN NOT NULL DEFAULT false,
    `aprovado` BOOLEAN NOT NULL DEFAULT false,
    `desempenho` DECIMAL(65, 30) NOT NULL DEFAULT 100,
    `pessoaId` VARCHAR(191) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,
    `excluido` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `fornecedores_documento_key`(`documento`),
    UNIQUE INDEX `fornecedores_pessoaId_key`(`pessoaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos_fornecedor` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `arquivo` LONGTEXT NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacoes_fornecedor` (
    `id` VARCHAR(191) NOT NULL,
    `nota` INTEGER NOT NULL,
    `validade` DATE NOT NULL,
    `avaliadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aprovado` BOOLEAN NOT NULL,
    `fornecedorId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desempenho_fornecedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nota` DECIMAL(65, 30) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fornecedorId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `telefones_pessoa` ADD CONSTRAINT `telefones_pessoa_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emails_pessoa` ADD CONSTRAINT `emails_pessoa_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fornecedores` ADD CONSTRAINT `fornecedores_pessoaId_fkey` FOREIGN KEY (`pessoaId`) REFERENCES `pessoas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fornecedores` ADD CONSTRAINT `fornecedores_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos_fornecedor` ADD CONSTRAINT `documentos_fornecedor_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacoes_fornecedor` ADD CONSTRAINT `avaliacoes_fornecedor_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacoes_fornecedor` ADD CONSTRAINT `avaliacoes_fornecedor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desempenho_fornecedor` ADD CONSTRAINT `desempenho_fornecedor_fornecedorId_fkey` FOREIGN KEY (`fornecedorId`) REFERENCES `fornecedores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
