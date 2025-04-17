-- CreateTable
CREATE TABLE `categorias_documento` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `copias` INTEGER NOT NULL DEFAULT 1,
    `recuperacao` VARCHAR(191) NOT NULL,
    `presElegibilidade` VARCHAR(191) NOT NULL,
    `disposicao` VARCHAR(191) NOT NULL,
    `retencao` DATE NOT NULL,
    `uso` VARCHAR(191) NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `categoriaDocumentoId` VARCHAR(191) NOT NULL,
    `usuarioId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_acesso_documentos` (
    `usuarioId` VARCHAR(191) NOT NULL,
    `documentoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`usuarioId`, `documentoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `arquivos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `cadastradoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `documentosId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Revisoes` (
    `id` VARCHAR(191) NOT NULL,
    `numeroRevisao` INTEGER NOT NULL,
    `revisadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` VARCHAR(191) NOT NULL,
    `documentoId` VARCHAR(191) NOT NULL,
    `arquivoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categorias_documento` ADD CONSTRAINT `categorias_documento_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_categoriaDocumentoId_fkey` FOREIGN KEY (`categoriaDocumentoId`) REFERENCES `categorias_documento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_acesso_documentos` ADD CONSTRAINT `usuario_acesso_documentos_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_acesso_documentos` ADD CONSTRAINT `usuario_acesso_documentos_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `documentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `arquivos` ADD CONSTRAINT `arquivos_documentosId_fkey` FOREIGN KEY (`documentosId`) REFERENCES `documentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revisoes` ADD CONSTRAINT `Revisoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revisoes` ADD CONSTRAINT `Revisoes_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `documentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Revisoes` ADD CONSTRAINT `Revisoes_arquivoId_fkey` FOREIGN KEY (`arquivoId`) REFERENCES `arquivos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
