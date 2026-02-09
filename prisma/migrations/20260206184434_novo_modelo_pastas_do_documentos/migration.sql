-- AlterTable
ALTER TABLE `documentos` ADD COLUMN `pastaDocumentoId` VARCHAR(191) NULL,
    MODIFY `retencao` DATE NULL;

-- AlterTable
ALTER TABLE `revisoes` MODIFY `revisadoEm` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `pasta_documento` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `empresaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pasta_documento` ADD CONSTRAINT `pasta_documento_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_pastaDocumentoId_fkey` FOREIGN KEY (`pastaDocumentoId`) REFERENCES `pasta_documento`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
