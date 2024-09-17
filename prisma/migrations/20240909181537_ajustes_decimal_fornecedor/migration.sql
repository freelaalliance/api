/*
  Warnings:

  - You are about to alter the column `desempenho` on the `fornecedores` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(3,1)`.

*/
-- AlterTable
ALTER TABLE `fornecedores` MODIFY `desempenho` DECIMAL(3, 1) NOT NULL DEFAULT 0;
