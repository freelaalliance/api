/*
  Warnings:

  - A unique constraint covering the columns `[chaveArquivo]` on the table `documentos_contrato` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chaveArquivo` to the `documentos_contrato` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documentos_contrato` ADD COLUMN `chaveArquivo` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `documentos_contrato_chaveArquivo_key` ON `documentos_contrato`(`chaveArquivo`);
