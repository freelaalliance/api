/*
  Warnings:

  - You are about to alter the column `avaliacaoEntrega` on the `recebimento_compras` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,1)` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `recebimento_compras` MODIFY `avaliacaoEntrega` DECIMAL(65, 30) NOT NULL;
