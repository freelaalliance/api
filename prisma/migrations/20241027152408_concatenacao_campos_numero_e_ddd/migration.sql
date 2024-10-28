/*
  Warnings:

  - You are about to drop the column `codigoArea` on the `telefones_pessoa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `telefones_pessoa` DROP COLUMN `codigoArea`,
    MODIFY `numero` VARCHAR(12) NOT NULL;
