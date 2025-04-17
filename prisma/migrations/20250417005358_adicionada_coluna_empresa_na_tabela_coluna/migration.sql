/*
  Warnings:

  - Added the required column `empresaId` to the `documentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documentos` ADD COLUMN `empresaId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `documentos` ADD CONSTRAINT `documentos_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
