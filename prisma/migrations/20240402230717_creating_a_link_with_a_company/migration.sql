/*
  Warnings:

  - Added the required column `empresaId` to the `perfis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `perfis` ADD COLUMN `empresaId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `perfis` ADD CONSTRAINT `perfis_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
