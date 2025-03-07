/*
  Warnings:

  - The primary key for the `avaliacao_recebimento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avaria` on the `avaliacao_recebimento` table. All the data in the column will be lost.
  - You are about to drop the column `numeroCertificado` on the `avaliacao_recebimento` table. All the data in the column will be lost.
  - You are about to drop the column `numeroNota` on the `avaliacao_recebimento` table. All the data in the column will be lost.
  - You are about to drop the column `quantidadeIncorreta` on the `avaliacao_recebimento` table. All the data in the column will be lost.
  - Added the required column `itemAvaliacaoId` to the `avaliacao_recebimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notaAvaliacao` to the `avaliacao_recebimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `avaliacao_recebimento` DROP PRIMARY KEY,
    DROP COLUMN `avaria`,
    DROP COLUMN `numeroCertificado`,
    DROP COLUMN `numeroNota`,
    DROP COLUMN `quantidadeIncorreta`,
    ADD COLUMN `itemAvaliacaoId` VARCHAR(191) NOT NULL,
    ADD COLUMN `notaAvaliacao` DECIMAL(65, 30) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `recebimento_compras` ADD COLUMN `entregaCompleta` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `numeroCertificado` VARCHAR(191) NULL,
    ADD COLUMN `numeroNota` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `itens_avaliativos_recebimento_empresa` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` MEDIUMTEXT NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `empresaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `itens_avaliativos_recebimento_empresa` ADD CONSTRAINT `itens_avaliativos_recebimento_empresa_empresaId_fkey` FOREIGN KEY (`empresaId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao_recebimento` ADD CONSTRAINT `avaliacao_recebimento_itemAvaliacaoId_fkey` FOREIGN KEY (`itemAvaliacaoId`) REFERENCES `itens_avaliativos_recebimento_empresa`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
