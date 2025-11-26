/*
  Warnings:

  - A unique constraint covering the columns `[empresaId,chave]` on the table `configuracao_empresa` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `configuracao_empresa_chave_key` ON `configuracao_empresa`;

-- CreateIndex
CREATE UNIQUE INDEX `configuracao_empresa_empresaId_chave_key` ON `configuracao_empresa`(`empresaId`, `chave`);
