/*
  Warnings:

  - Added the required column `usuariosId` to the `contratacao_colaborador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cargos` ADD COLUMN `excluido` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `contratacao_colaborador` ADD COLUMN `usuariosId` CHAR(36) NOT NULL;

-- AddForeignKey
ALTER TABLE `contratacao_colaborador` ADD CONSTRAINT `contratacao_colaborador_usuariosId_fkey` FOREIGN KEY (`usuariosId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
