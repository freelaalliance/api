/*
  Warnings:

  - You are about to drop the column `documentosId` on the `arquivos` table. All the data in the column will be lost.
  - Added the required column `descricao` to the `documentos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `arquivos` DROP FOREIGN KEY `arquivos_documentosId_fkey`;

-- AlterTable
ALTER TABLE `arquivos` DROP COLUMN `documentosId`;

-- AlterTable
ALTER TABLE `documentos` ADD COLUMN `descricao` VARCHAR(191) NOT NULL,
    MODIFY `copias` INTEGER NOT NULL DEFAULT 0;
