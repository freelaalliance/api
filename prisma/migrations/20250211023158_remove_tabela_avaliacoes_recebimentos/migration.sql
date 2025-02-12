/*
  Warnings:

  - You are about to drop the `avaliacao_recebimento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `avaliacao_recebimento` DROP FOREIGN KEY `avaliacao_recebimento_itemAvaliacaoId_fkey`;

-- DropForeignKey
ALTER TABLE `avaliacao_recebimento` DROP FOREIGN KEY `avaliacao_recebimento_recebimentoId_fkey`;

-- DropTable
DROP TABLE `avaliacao_recebimento`;
