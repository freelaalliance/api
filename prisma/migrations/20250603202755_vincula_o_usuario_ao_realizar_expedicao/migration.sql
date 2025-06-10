/*
  Warnings:

  - A unique constraint covering the columns `[usuariosId]` on the table `expedicoes_venda` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuariosId` to the `expedicoes_venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `expedicoes_venda` ADD COLUMN `usuariosId` CHAR(36) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `expedicoes_venda_usuariosId_key` ON `expedicoes_venda`(`usuariosId`);

-- AddForeignKey
ALTER TABLE `expedicoes_venda` ADD CONSTRAINT `expedicoes_venda_usuariosId_fkey` FOREIGN KEY (`usuariosId`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
