/*
  Warnings:

  - You are about to alter the column `avaliacaoExpedicao` on the `expedicoes_venda` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,2)` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `expedicoes_venda` MODIFY `avaliacaoExpedicao` DECIMAL(65, 30) NOT NULL DEFAULT 0;
