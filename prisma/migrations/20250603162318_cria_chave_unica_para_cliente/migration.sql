/*
  Warnings:

  - A unique constraint covering the columns `[pessoaId]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `clientes_pessoaId_key` ON `clientes`(`pessoaId`);
