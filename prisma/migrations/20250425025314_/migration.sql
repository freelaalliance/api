/*
  Warnings:

  - You are about to drop the `Revisoes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Revisoes` DROP FOREIGN KEY `Revisoes_arquivoId_fkey`;

-- DropForeignKey
ALTER TABLE `Revisoes` DROP FOREIGN KEY `Revisoes_documentoId_fkey`;

-- DropForeignKey
ALTER TABLE `Revisoes` DROP FOREIGN KEY `Revisoes_usuarioId_fkey`;

-- DropTable
DROP TABLE `Revisoes`;

-- CreateTable
CREATE TABLE `revisoes` (
    `id` VARCHAR(191) NOT NULL,
    `numeroRevisao` INTEGER NOT NULL,
    `revisadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usuarioId` VARCHAR(191) NOT NULL,
    `documentoId` VARCHAR(191) NOT NULL,
    `arquivoId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `revisoes` ADD CONSTRAINT `revisoes_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisoes` ADD CONSTRAINT `revisoes_documentoId_fkey` FOREIGN KEY (`documentoId`) REFERENCES `documentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revisoes` ADD CONSTRAINT `revisoes_arquivoId_fkey` FOREIGN KEY (`arquivoId`) REFERENCES `arquivos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
