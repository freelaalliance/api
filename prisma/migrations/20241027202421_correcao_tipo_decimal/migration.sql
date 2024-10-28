/*
  Warnings:

  - You are about to alter the column `desempenho` on the `fornecedores` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,1)` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `fornecedores` MODIFY `desempenho` DECIMAL(65, 30) NOT NULL;
